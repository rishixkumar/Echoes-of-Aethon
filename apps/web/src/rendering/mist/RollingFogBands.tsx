import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import {
  Color,
  DoubleSide,
  Group,
  NormalBlending,
  PlaneGeometry,
  ShaderMaterial,
  Vector3,
} from 'three'
import { createSeededRandom } from '../../features/map-generation/data/seededRandom'
import { usePlayerStore } from '../../features/player/playerStore'
import { ROLLING_FOG_BANDS_CONFIG } from './rollingFogBandsConfig'

type MapBoundsXZ = Readonly<{
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}>

type RollingFogBandsProps = Readonly<{
  mapBounds: MapBoundsXZ
}>

type BandSpec = Readonly<{
  baseX: number
  baseZ: number
  y: number
  rotationY: number
  width: number
  depth: number
  alpha: number
  color: string
  noiseScale: number
  noiseSpeed: number
  driftPhase: number
}>

const vertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorldPosition;

void main() {
  vUv = uv;

  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
`

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform vec3 uColor;
uniform vec3 uPlayerPosition;
uniform float uAlpha;
uniform float uNoiseScale;
uniform float uNoiseSpeed;
uniform float uClearRadius;
uniform float uClearSoftness;
uniform float uMinimumFogNearPlayer;

varying vec2 vUv;
varying vec3 vWorldPosition;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x)
    + (c - a) * u.y * (1.0 - u.x)
    + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  // World-space noise so streaks have consistent real-world scale.
  float n1 = fbm(vWorldPosition.xz * uNoiseScale + vec2(uTime * uNoiseSpeed, 0.0));
  float n2 = fbm(vWorldPosition.xz * (uNoiseScale * 1.8) + vec2(0.0, -uTime * uNoiseSpeed * 0.9));
  float n3 = fbm(vWorldPosition.xz * (uNoiseScale * 3.2) + vec2(uTime * uNoiseSpeed * 0.7, uTime * uNoiseSpeed * 0.5));
  float cloud = n1 * 0.62 + n2 * 0.28 + n3 * 0.10;
  cloud = smoothstep(0.34, 0.68, cloud);

  // Height falloff — denser near floor.
  float heightDensity = 1.0 - smoothstep(0.0, 1.05, vWorldPosition.y);
  heightDensity = pow(max(heightDensity, 0.0), 0.38);

  // Soft UV edges so individual planes are invisible; only stacking reads.
  float edgeX = smoothstep(0.0, 0.10, vUv.x) * smoothstep(0.0, 0.10, 1.0 - vUv.x);
  float edgeY = smoothstep(0.0, 0.20, vUv.y) * smoothstep(0.0, 0.20, 1.0 - vUv.y);

  float distToPlayer = distance(vWorldPosition.xz, uPlayerPosition.xz);
  float clearFactor = smoothstep(uClearRadius, uClearRadius + uClearSoftness, distToPlayer);
  float playerClear = mix(uMinimumFogNearPlayer, 1.0, clearFactor);

  float alpha = uAlpha * cloud * heightDensity * edgeX * edgeY * playerClear;

  if (alpha < 0.003) discard;

  // Lantern scatter — pink glow from nearby light scattering through fog.
  float localGlow = 1.0 - smoothstep(0.0, 5.5, distToPlayer);
  localGlow = pow(localGlow, 1.8);

  vec3 glowColor = vec3(1.0, 0.32, 0.72);
  vec3 fogColor  = mix(uColor, glowColor, localGlow * 0.45);

  gl_FragColor = vec4(fogColor, alpha);
}
`

function buildBandSpecs(bounds: MapBoundsXZ): BandSpec[] {
  if (!ROLLING_FOG_BANDS_CONFIG.enabled) return []
  const rng = createSeededRandom('rolling-fog-bands-v1')
  const pad = ROLLING_FOG_BANDS_CONFIG.mapPadding
  const minX = bounds.minX - pad
  const maxX = bounds.maxX + pad
  const minZ = bounds.minZ - pad
  const maxZ = bounds.maxZ + pad
  const c = ROLLING_FOG_BANDS_CONFIG

  const specs: BandSpec[] = []
  for (let i = 0; i < c.count; i += 1) {
    specs.push({
      baseX: rng.range(minX, maxX),
      baseZ: rng.range(minZ, maxZ),
      y: rng.range(c.y.min, c.y.max),
      rotationY: rng.range(0, Math.PI),
      width: rng.range(c.width.min, c.width.max),
      depth: rng.range(c.depth.min, c.depth.max),
      alpha: rng.range(c.alpha.min, c.alpha.max),
      color: rng.bool() ? c.color.primary : c.color.secondary,
      noiseScale: rng.range(c.noise.scaleMin, c.noise.scaleMax),
      noiseSpeed: rng.range(c.noise.speedMin, c.noise.speedMax),
      driftPhase: rng.range(0, Math.PI * 2),
    })
  }
  return specs
}

function createBandMaterial(spec: BandSpec): ShaderMaterial {
  const c = ROLLING_FOG_BANDS_CONFIG
  const mat = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new Color(spec.color) },
      uPlayerPosition: { value: new Vector3() },
      uAlpha: { value: spec.alpha },
      uNoiseScale: { value: spec.noiseScale },
      uNoiseSpeed: { value: spec.noiseSpeed },
      uClearRadius: { value: c.playerClear.radius },
      uClearSoftness: { value: c.playerClear.softness },
      uMinimumFogNearPlayer: { value: c.playerClear.minimumFogNearPlayer },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: NormalBlending,
    toneMapped: false,
    fog: false,
    side: DoubleSide,
  })
  mat.userData.baseAlpha = spec.alpha
  return mat
}

/**
 * Low elongated fog planes creating visible cloud-streak shapes from floor to ~waist height.
 * More prominent than ground sheets, less opaque than curtains.
 */
export function RollingFogBands({ mapBounds }: RollingFogBandsProps) {
  const materialsRef = useRef<ShaderMaterial[]>([])
  const groupRefs = useRef<(Group | null)[]>([])

  const specs = useMemo(
    () => buildBandSpecs(mapBounds),
    [mapBounds.minX, mapBounds.maxX, mapBounds.minZ, mapBounds.maxZ],
  )

  const bands = useMemo(() => {
    if (!ROLLING_FOG_BANDS_CONFIG.enabled) return []
    return specs.map((spec) => ({
      spec,
      material: createBandMaterial(spec),
      geometry: new PlaneGeometry(spec.width, spec.depth, 1, 1),
    }))
  }, [specs])

  useLayoutEffect(() => {
    materialsRef.current = bands.map((b) => b.material)
    return () => {
      for (const { material, geometry } of bands) {
        material.dispose()
        geometry.dispose()
      }
    }
  }, [bands])

  useFrame(({ clock }) => {
    if (
      !ROLLING_FOG_BANDS_CONFIG.enabled ||
      !ROLLING_FOG_BANDS_CONFIG.debug.showRollingBands ||
      materialsRef.current.length === 0
    ) {
      return
    }

    const [px, py, pz] = usePlayerStore.getState().playerPosition
    const t = clock.elapsedTime
    const drift = ROLLING_FOG_BANDS_CONFIG.drift
    const vis = ROLLING_FOG_BANDS_CONFIG.debug.forceHighVisibility ? 1.5 : 1

    let i = 0
    for (const mat of materialsRef.current) {
      mat.uniforms.uTime.value = t
      mat.uniforms.uPlayerPosition.value.set(px, py, pz)
      const base = (mat.userData.baseAlpha as number) ?? mat.uniforms.uAlpha.value
      mat.uniforms.uAlpha.value = base * vis

      const g = groupRefs.current[i]
      const spec = specs[i]
      if (g && spec) {
        const phase = spec.driftPhase
        g.position.x = spec.baseX + Math.sin(t * drift.speed + phase) * drift.amplitude
        g.position.z = spec.baseZ + Math.cos(t * drift.speed * 0.7 + phase) * drift.amplitude * 0.7
      }
      i += 1
    }
  })

  if (
    !ROLLING_FOG_BANDS_CONFIG.enabled ||
    !ROLLING_FOG_BANDS_CONFIG.debug.showRollingBands ||
    bands.length === 0
  ) {
    return null
  }

  return (
    <group name="rolling-fog-bands">
      {bands.map(({ spec, material, geometry }, index) => (
        <group
          key={`rfb-${index}`}
          ref={(el) => {
            groupRefs.current[index] = el
          }}
          position={[spec.baseX, spec.y, spec.baseZ]}
          rotation={[0, spec.rotationY, 0]}
        >
          <mesh
            geometry={geometry}
            material={material}
            frustumCulled={false}
            renderOrder={-2}
            rotation={[-Math.PI / 2, 0, 0]}
          />
        </group>
      ))}
    </group>
  )
}
