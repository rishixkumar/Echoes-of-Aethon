import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  ShaderMaterial,
  Vector3,
} from 'three'
import { useCameraStore } from '../../features/camera/cameraStore'
import { usePlayerStore } from '../../features/player/playerStore'
import { ATMOSPHERE_CONFIG } from '../atmosphereConfig'
import { MIST_PARTICLE_CONFIG } from './mistParticleConfig'

type MapBoundsXZ = Readonly<{
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}>

type MistParticlesProps = Readonly<{
  /** World-space floor bounds; defaults from scene config when omitted at call site. */
  mapBounds: MapBoundsXZ
}>

const lanternLocal = new Vector3(0.38, 0.95, 0.25)

const vertexShader = /* glsl */ `
uniform float uTime;
uniform vec3 uPlayerPos;
attribute float aPhase;
attribute float aSizeJitter;
varying vec3 vWorldPos;
varying float vJitter;

void main() {
  vJitter = aSizeJitter;
  vec3 pos = position;

  float t = uTime * 0.38;
  float w1 = sin(t + aPhase) * 0.55 + sin(t * 0.61 + aPhase * 2.17) * 0.35;
  float w2 = cos(t * 0.47 + aPhase * 1.33) * 0.55;
  pos.x += w1 * ${MIST_PARTICLE_CONFIG.windAmplitudeXZ.toFixed(4)};
  pos.z += w2 * ${MIST_PARTICLE_CONFIG.windAmplitudeXZ.toFixed(4)};
  pos.y += sin(t * 0.52 + aPhase * 1.9) * ${MIST_PARTICLE_CONFIG.windAmplitudeY.toFixed(4)};

  vec3 toP = pos - uPlayerPos;
  float pr = length(toP.xz);
  float r0 = ${MIST_PARTICLE_CONFIG.bodyPushRadius.toFixed(4)};
  if (pr < r0 && pos.y < uPlayerPos.y + 3.2) {
    float push = (r0 - pr) * ${MIST_PARTICLE_CONFIG.bodyPushStrength.toFixed(4)};
    pos.xz += normalize(toP.xz + vec2(1e-4)) * push;
  }

  vWorldPos = pos;
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  float dist = -mvPosition.z;
  float baseSize = 320.0 + 140.0 * aSizeJitter;
  gl_PointSize = baseSize / max(dist, 0.35);
  gl_PointSize = clamp(gl_PointSize, 3.0, 110.0);
  gl_Position = projectionMatrix * mvPosition;
}
`

const fragmentShader = /* glsl */ `
uniform vec3 uLanternPos;
uniform vec3 uTintNear;
uniform vec3 uTintFar;
uniform float uBaseAlpha;

varying vec3 vWorldPos;
varying float vJitter;

void main() {
  vec2 q = gl_PointCoord - vec2(0.5);
  float r = length(q);
  if (r > 0.5) discard;

  float soft = 1.0 - smoothstep(0.18, 0.5, r);
  soft = pow(soft, 1.35);

  float dl = distance(vWorldPos, uLanternPos);
  float lanternClear = smoothstep(${MIST_PARTICLE_CONFIG.lanternClearNear.toFixed(
    4,
  )}, ${MIST_PARTICLE_CONFIG.lanternClearFar.toFixed(4)}, dl);

  float heightBias = smoothstep(0.0, 4.5, vWorldPos.y);
  float alpha =
    uBaseAlpha *
    soft *
    (0.12 + 0.88 * lanternClear) *
    (0.75 + 0.25 * heightBias) *
    (0.85 + 0.15 * vJitter);

  vec3 col = mix(uTintNear, uTintFar, lanternClear * 0.65 + heightBias * 0.2);
  gl_FragColor = vec4(col, alpha);
}
`

function buildMistGeometry(bounds: MapBoundsXZ): BufferGeometry {
  const {
    count,
    paddingXZ,
    yMin,
    yMax,
  } = MIST_PARTICLE_CONFIG

  const minX = bounds.minX - paddingXZ
  const maxX = bounds.maxX + paddingXZ
  const minZ = bounds.minZ - paddingXZ
  const maxZ = bounds.maxZ + paddingXZ

  const positions = new Float32Array(count * 3)
  const phases = new Float32Array(count)
  const jitters = new Float32Array(count)

  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = minX + Math.random() * (maxX - minX)
    positions[i * 3 + 1] = yMin + Math.random() ** 1.15 * (yMax - yMin)
    positions[i * 3 + 2] = minZ + Math.random() * (maxZ - minZ)
    phases[i] = Math.random() * Math.PI * 2
    jitters[i] = Math.random()
  }

  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(positions, 3))
  geo.setAttribute('aPhase', new BufferAttribute(phases, 1))
  geo.setAttribute('aSizeJitter', new BufferAttribute(jitters, 1))
  return geo
}

/**
 * Soft additive mist particles across the map. Fragment shader thins mist near the
 * computed lantern position so the carried light reads as cutting through haze; vertex
 * shader nudges samples away from the player for a subtle “parting” effect.
 */
export function MistParticles({ mapBounds }: MistParticlesProps) {
  const materialRef = useRef<ShaderMaterial>(null)

  const geometry = useMemo(() => buildMistGeometry(mapBounds), [mapBounds])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPlayerPos: { value: new Vector3() },
      uLanternPos: { value: new Vector3() },
      uTintNear: {
        value: new Color('#7a5a8c').multiplyScalar(0.55),
      },
      uTintFar: {
        value: new Color(ATMOSPHERE_CONFIG.fog.color).multiplyScalar(0.9),
      },
      uBaseAlpha: { value: MIST_PARTICLE_CONFIG.baseAlpha },
    }),
    [],
  )

  const scratchLantern = useMemo(() => new Vector3(), [])

  useFrame(({ clock }) => {
    const mat = materialRef.current
    if (!mat) return

    const [px, py, pz] = usePlayerStore.getState().playerPosition
    const yaw = useCameraStore.getState().yaw

    const cos = Math.cos(yaw)
    const sin = Math.sin(yaw)
    scratchLantern.set(
      px + lanternLocal.x * cos + lanternLocal.z * sin,
      py + lanternLocal.y,
      pz - lanternLocal.x * sin + lanternLocal.z * cos,
    )

    mat.uniforms.uTime.value = clock.elapsedTime
    mat.uniforms.uPlayerPos.value.set(px, py, pz)
    mat.uniforms.uLanternPos.value.copy(scratchLantern)
  })

  return (
    <points geometry={geometry} frustumCulled={false} renderOrder={-2}>
      <shaderMaterial
        ref={materialRef}
        attach="material"
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        depthTest
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </points>
  )
}
