import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  NormalBlending,
  Points,
  ShaderMaterial,
  Vector3,
} from 'three'
import { createSeededRandom } from '../../features/map-generation/data/seededRandom'
import { useCameraStore } from '../../features/camera/cameraStore'
import { usePlayerStore } from '../../features/player/playerStore'
import { GROUND_FOG_CONFIG } from './groundFogConfig'
import { MIST_PARTICLE_CONFIG } from './mistParticleConfig'
import { VOLUMETRIC_FOG_CONFIG } from './volumetricFogConfig'

type MapBoundsXZ = Readonly<{
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}>

type MistParticlesProps = Readonly<{
  mapBounds: MapBoundsXZ
}>

const WS = MIST_PARTICLE_CONFIG.wind.speed
const STR = MIST_PARTICLE_CONFIG.wind.strength
const WZ = WS * 0.8

const vertexShader = /* glsl */ `
uniform float uTime;

attribute float aSize;
attribute float aPhase;

varying vec3 vWorldPosition;
varying float vHeightFade;

void main() {
  vec3 pos = position;

  pos.x += sin(uTime * ${WS.toFixed(4)} + aPhase) * ${STR.toFixed(4)};
  pos.z += cos(uTime * ${WZ.toFixed(4)} + aPhase) * ${STR.toFixed(4)};

  vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;

  vHeightFade = 1.0 - smoothstep(0.12, 2.35, pos.y);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  gl_PointSize = aSize * (12.0 / max(-mvPosition.z, 3.0));
  gl_PointSize = clamp(gl_PointSize, 0.8, 4.0);

  gl_Position = projectionMatrix * mvPosition;
}
`

const fragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uBaseAlpha;
uniform vec3 uPlayerPosition;
uniform vec3 uLanternPosition;
uniform float uClearRadius;
uniform float uClearSoftness;
uniform float uLanternClearRadius;
uniform float uLanternClearSoftness;
uniform float uMinimumFogNearPlayer;

varying vec3 vWorldPosition;
varying float vHeightFade;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float circle = 1.0 - smoothstep(0.32, 0.5, length(uv));

  float distPlayer = distance(vWorldPosition.xz, uPlayerPosition.xz);
  float clearPlayerFactor = smoothstep(
    uClearRadius,
    uClearRadius + uClearSoftness,
    distPlayer
  );
  float playerPocket = mix(uMinimumFogNearPlayer, 1.0, clearPlayerFactor);

  float distLantern = distance(vWorldPosition.xz, uLanternPosition.xz);
  float clearLanternFactor = smoothstep(
    uLanternClearRadius,
    uLanternClearRadius + uLanternClearSoftness,
    distLantern
  );
  float lanternPocket = mix(uMinimumFogNearPlayer, 1.0, clearLanternFactor);

  float pocketClear = max(playerPocket, lanternPocket);

  float alpha = uBaseAlpha * circle * vHeightFade * pocketClear;

  if (alpha < 0.0015) discard;

  gl_FragColor = vec4(uColor, alpha);
}
`

function buildMistGeometry(bounds: MapBoundsXZ): BufferGeometry {
  const rng = createSeededRandom('mist-particles-v1')
  const {
    count,
    mapPadding,
    height,
    size,
  } = MIST_PARTICLE_CONFIG

  const minX = bounds.minX - mapPadding
  const maxX = bounds.maxX + mapPadding
  const minZ = bounds.minZ - mapPadding
  const maxZ = bounds.maxZ + mapPadding

  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const phases = new Float32Array(count)

  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = rng.range(minX, maxX)
    positions[i * 3 + 1] = rng.range(height.min, height.max)
    positions[i * 3 + 2] = rng.range(minZ, maxZ)
    sizes[i] = rng.range(size.min, size.max)
    phases[i] = rng.range(0, Math.PI * 2)
  }

  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(positions, 3))
  geo.setAttribute('aSize', new BufferAttribute(sizes, 1))
  geo.setAttribute('aPhase', new BufferAttribute(phases, 1))
  return geo
}

const farColorScratch = new Color()

const lanternLocal = new Vector3(0.38, 0.95, 0.25)

/**
 * Secondary wisps on top of `GroundFogLayer`; shares lantern / player clear pocket with ground sheets.
 */
export function MistParticles({ mapBounds }: MistParticlesProps) {
  const pointsRef = useRef<Points>(null)
  const scratchColor = useMemo(() => new Color(), [])
  const scratchLantern = useMemo(() => new Vector3(), [])

  const geometry = useMemo(
    () => buildMistGeometry(mapBounds),
    [
      mapBounds.minX,
      mapBounds.maxX,
      mapBounds.minZ,
      mapBounds.maxZ,
      MIST_PARTICLE_CONFIG.count,
    ],
  )

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPlayerPosition: { value: new Vector3() },
      uLanternPosition: { value: new Vector3() },
      uColor: { value: new Color(MIST_PARTICLE_CONFIG.color.near) },
      uBaseAlpha: { value: MIST_PARTICLE_CONFIG.alpha.base },
      uClearRadius: { value: MIST_PARTICLE_CONFIG.playerClear.radius },
      uClearSoftness: { value: MIST_PARTICLE_CONFIG.playerClear.softness },
      uLanternClearRadius: { value: MIST_PARTICLE_CONFIG.lanternClear.radius },
      uLanternClearSoftness: {
        value: MIST_PARTICLE_CONFIG.lanternClear.softness,
      },
      uMinimumFogNearPlayer: {
        value: MIST_PARTICLE_CONFIG.playerClear.minimumFogNearPlayer,
      },
    }),
    [],
  )

  useFrame(({ clock }) => {
    const points = pointsRef.current
    const mat = points?.material
    if (!mat || !(mat instanceof ShaderMaterial)) return

    const [px, py, pz] = usePlayerStore.getState().playerPosition
    const yaw = useCameraStore.getState().yaw
    const cos = Math.cos(yaw)
    const sin = Math.sin(yaw)
    scratchLantern.set(
      px + lanternLocal.x * cos + lanternLocal.z * sin,
      py + lanternLocal.y,
      pz - lanternLocal.x * sin + lanternLocal.z * cos,
    )

    farColorScratch.set(MIST_PARTICLE_CONFIG.color.far)
    scratchColor.set(MIST_PARTICLE_CONFIG.color.near)
    scratchColor.lerp(farColorScratch, 0.45)

    const vis =
      GROUND_FOG_CONFIG.debug.forceHighVisibility ||
      VOLUMETRIC_FOG_CONFIG.debug.forceHighVisibility
        ? 1.5
        : 1

    mat.uniforms.uTime.value = clock.elapsedTime
    mat.uniforms.uPlayerPosition.value.set(px, py, pz)
    mat.uniforms.uLanternPosition.value.copy(scratchLantern)
    mat.uniforms.uColor.value.copy(scratchColor)
    mat.uniforms.uBaseAlpha.value = MIST_PARTICLE_CONFIG.alpha.base * vis
    mat.uniforms.uClearRadius.value = MIST_PARTICLE_CONFIG.playerClear.radius
    mat.uniforms.uClearSoftness.value = MIST_PARTICLE_CONFIG.playerClear.softness
    mat.uniforms.uLanternClearRadius.value =
      MIST_PARTICLE_CONFIG.lanternClear.radius
    mat.uniforms.uLanternClearSoftness.value =
      MIST_PARTICLE_CONFIG.lanternClear.softness
    mat.uniforms.uMinimumFogNearPlayer.value =
      MIST_PARTICLE_CONFIG.playerClear.minimumFogNearPlayer
  })

  const depthTest = !MIST_PARTICLE_CONFIG.debug

  return (
    <points ref={pointsRef} args={[geometry]} frustumCulled={false}>
      <shaderMaterial
        attach="material"
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        depthTest={depthTest}
        blending={NormalBlending}
        toneMapped={false}
        fog={false}
      />
    </points>
  )
}
