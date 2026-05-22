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

  float t = uTime * 1.05;
  float t2 = uTime * 0.63;

  float w1 =
    sin(t + aPhase) * 0.62 +
    sin(t2 * 1.37 + aPhase * 2.31) * 0.38 +
    sin(t * 0.29 + aPhase * 4.1) * 0.22;
  float w2 =
    cos(t * 0.88 + aPhase * 1.11) * 0.58 +
    cos(t2 * 1.09 + aPhase * 1.73) * 0.34;
  float w3 = sin(t * 0.41 + aPhase * 2.9) * 0.55 + cos(t2 + aPhase * 3.7) * 0.25;

  pos.x += w1 * ${MIST_PARTICLE_CONFIG.windAmplitudeXZ.toFixed(4)};
  pos.z += w2 * ${MIST_PARTICLE_CONFIG.windAmplitudeXZ.toFixed(4)};
  pos.y += w3 * ${MIST_PARTICLE_CONFIG.windAmplitudeY.toFixed(4)};

  vec3 toP = pos - uPlayerPos;
  float pr = length(toP.xz);
  float r0 = ${MIST_PARTICLE_CONFIG.bodyPushRadius.toFixed(4)};
  if (pr < r0 && pos.y < uPlayerPos.y + 3.2) {
    float push = (r0 - pr) * ${MIST_PARTICLE_CONFIG.bodyPushStrength.toFixed(4)};
    pos.xz += normalize(toP.xz + vec2(1e-4)) * push;
  }

  vWorldPos = pos;
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  float dist = max(-mvPosition.z, 1.15);
  float baseSize = 110.0 + 55.0 * aSizeJitter;
  gl_PointSize = baseSize / dist;
  gl_PointSize = clamp(gl_PointSize, 2.0, 42.0);
  gl_Position = projectionMatrix * mvPosition;
}
`

const fragmentShader = /* glsl */ `
uniform vec3 uLanternPos;
uniform vec3 uTintNear;
uniform vec3 uTintFar;
uniform float uBaseAlpha;
uniform float uTime;

varying vec3 vWorldPos;
varying float vJitter;

float hash31(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
}

void main() {
  vec2 q = gl_PointCoord - vec2(0.5);
  float r = length(q);
  if (r > 0.5) discard;

  float soft = 1.0 - smoothstep(0.12, 0.48, r);
  soft = pow(max(soft, 0.001), 1.15);

  vec3 q3 = vWorldPos * vec3(0.35, 0.9, 0.35) + vec3(uTime * 0.11, uTime * 0.07, uTime * 0.09);
  float n = mix(hash31(q3), hash31(q3.yzx * 1.37 + 19.1), 0.5);
  float n2 = mix(hash31(q3 * 2.7 + 3.0), hash31(q3.zxy * 1.9), 0.5);
  float wisp = 0.45 + 0.55 * n * (0.65 + 0.35 * n2);

  float dl = distance(vWorldPos, uLanternPos);
  float lanternClear = smoothstep(${MIST_PARTICLE_CONFIG.lanternClearNear.toFixed(
    4,
  )}, ${MIST_PARTICLE_CONFIG.lanternClearFar.toFixed(4)}, dl);

  float heightBias = smoothstep(0.0, 2.8, vWorldPos.y);
  float alpha =
    uBaseAlpha *
    soft *
    wisp *
    (0.18 + 0.82 * lanternClear) *
    (0.82 + 0.18 * heightBias) *
    (0.88 + 0.12 * vJitter);

  vec3 col = mix(uTintNear, uTintFar, lanternClear * 0.55 + heightBias * 0.18);
  col *= vec3(0.72, 0.68, 0.82);
  gl_FragColor = vec4(col, alpha);
}
`

function buildMistGeometry(bounds: MapBoundsXZ): BufferGeometry {
  const {
    count,
    paddingXZ,
    yMin,
    yMax,
    yBiasExponent,
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
    const h = Math.random() ** yBiasExponent
    positions[i * 3 + 1] = yMin + h * (yMax - yMin)
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
 * Ground-hugging mist: small billboard points, slow multi-frequency wind,
 * hash noise for wispy alpha, lantern thinning, player push. Not true volumetrics—
 * tuned to read as haze rather than “snow” on screen.
 */
export function MistParticles({ mapBounds }: MistParticlesProps) {
  const pointsRef = useRef<Points>(null)

  const geometry = useMemo(() => buildMistGeometry(mapBounds), [mapBounds])

  const fogColor = useMemo(
    () => new Color(ATMOSPHERE_CONFIG.fog.color),
    [],
  )

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPlayerPos: { value: new Vector3() },
      uLanternPos: { value: new Vector3() },
      uTintNear: { value: new Color('#4a3558') },
      uTintFar: { value: fogColor.clone().multiplyScalar(0.92) },
      uBaseAlpha: { value: MIST_PARTICLE_CONFIG.baseAlpha },
    }),
    [fogColor],
  )

  const scratchLantern = useMemo(() => new Vector3(), [])

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

    const t = clock.elapsedTime
    mat.uniforms.uTime.value = t
    mat.uniforms.uPlayerPos.value.set(px, py, pz)
    mat.uniforms.uLanternPos.value.copy(scratchLantern)
  })

  return (
    <points ref={pointsRef} args={[geometry]} frustumCulled={false}>
      <shaderMaterial
        attach="material"
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        depthTest
        blending={NormalBlending}
        toneMapped={false}
        fog={false}
      />
    </points>
  )
}
