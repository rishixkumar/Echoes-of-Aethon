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
import { usePlayerStore } from '../../features/player/playerStore'
import { MIST_PARTICLE_CONFIG } from './mistParticleConfig'

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
uniform vec3 uPlayerPosition;

attribute float aSize;
attribute float aPhase;

varying float vDistanceToPlayer;
varying float vHeightFade;

void main() {
  vec3 pos = position;

  pos.x += sin(uTime * ${WS.toFixed(4)} + aPhase) * ${STR.toFixed(4)};
  pos.z += cos(uTime * ${WZ.toFixed(4)} + aPhase) * ${STR.toFixed(4)};

  float dist = distance(pos.xz, uPlayerPosition.xz);
  vDistanceToPlayer = dist;

  vHeightFade = 1.0 - smoothstep(0.1, 1.0, pos.y);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  gl_PointSize = aSize * (12.0 / max(-mvPosition.z, 3.0));
  gl_PointSize = clamp(gl_PointSize, 3.0, 22.0);

  gl_Position = projectionMatrix * mvPosition;
}
`

const fragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uBaseAlpha;
uniform float uClearRadius;
uniform float uClearSoftness;

varying float vDistanceToPlayer;
varying float vHeightFade;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float circle = 1.0 - smoothstep(0.32, 0.5, length(uv));

  float playerClear = smoothstep(
    uClearRadius,
    uClearRadius + uClearSoftness,
    vDistanceToPlayer
  );

  float alpha = uBaseAlpha * circle * vHeightFade * playerClear;

  if (alpha < 0.01) discard;

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

/**
 * Simple floor mist (staged): visible purple haze when `MIST_DEBUG` is true,
 * then flip `MIST_DEBUG` in `mistParticleConfig.ts` for subtle values.
 */
export function MistParticles({ mapBounds }: MistParticlesProps) {
  const pointsRef = useRef<Points>(null)
  const scratchColor = useMemo(() => new Color(), [])

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
      uColor: { value: new Color(MIST_PARTICLE_CONFIG.color.near) },
      uBaseAlpha: { value: MIST_PARTICLE_CONFIG.alpha.base },
      uClearRadius: { value: MIST_PARTICLE_CONFIG.playerClear.radius },
      uClearSoftness: { value: MIST_PARTICLE_CONFIG.playerClear.softness },
    }),
    [],
  )

  useFrame(({ clock }) => {
    const points = pointsRef.current
    const mat = points?.material
    if (!mat || !(mat instanceof ShaderMaterial)) return

    const [px, py, pz] = usePlayerStore.getState().playerPosition

    farColorScratch.set(MIST_PARTICLE_CONFIG.color.far)
    scratchColor.set(MIST_PARTICLE_CONFIG.color.near)
    scratchColor.lerp(farColorScratch, 0.45)

    mat.uniforms.uTime.value = clock.elapsedTime
    mat.uniforms.uPlayerPosition.value.set(px, py, pz)
    mat.uniforms.uColor.value.copy(scratchColor)
    mat.uniforms.uBaseAlpha.value = MIST_PARTICLE_CONFIG.alpha.base
    mat.uniforms.uClearRadius.value = MIST_PARTICLE_CONFIG.playerClear.radius
    mat.uniforms.uClearSoftness.value = MIST_PARTICLE_CONFIG.playerClear.softness
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
