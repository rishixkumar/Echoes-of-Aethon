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
import { GROUND_FOG_CONFIG } from './groundFogConfig'
import { VOLUMETRIC_FOG_CONFIG } from './volumetricFogConfig'

type MapBoundsXZ = Readonly<{
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}>

type VolumetricFogCurtainsProps = Readonly<{
  mapBounds: MapBoundsXZ
}>

type CurtainSpec = Readonly<{
  baseX: number
  baseZ: number
  y: number
  rotationY: number
  width: number
  height: number
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
  // World-space noise keeps density consistent regardless of plane dimensions.
  float n1 = fbm(vWorldPosition.xz * uNoiseScale + vec2(uTime * uNoiseSpeed, 0.0));
  float n2 = fbm(vWorldPosition.xz * (uNoiseScale * 1.6) + vec2(0.0, -uTime * uNoiseSpeed * 0.8));
  float n = n1 * 0.7 + n2 * 0.3;

  float cloud = smoothstep(0.42, 0.72, n);

  float heightFade = 1.0 - smoothstep(0.0, 3.5, vWorldPosition.y);

  float verticalFade =
    smoothstep(0.0, 0.18, vUv.y) *
    smoothstep(0.0, 0.24, 1.0 - vUv.y);

  float horizontalFade =
    smoothstep(0.0, 0.12, vUv.x) *
    smoothstep(0.0, 0.12, 1.0 - vUv.x);

  float distToPlayer = distance(vWorldPosition.xz, uPlayerPosition.xz);

  float clearFactor = smoothstep(
    uClearRadius,
    uClearRadius + uClearSoftness,
    distToPlayer
  );

  float playerClear = mix(uMinimumFogNearPlayer, 1.0, clearFactor);

  float alpha =
    uAlpha *
    cloud *
    verticalFade *
    horizontalFade *
    playerClear *
    heightFade;

  if (alpha < 0.003) discard;

  gl_FragColor = vec4(uColor, alpha);
}
`

function buildCurtainSpecs(bounds: MapBoundsXZ): CurtainSpec[] {
  if (!VOLUMETRIC_FOG_CONFIG.enabled) return []
  const rng = createSeededRandom('volumetric-fog-curtains-v1')
  const pad = VOLUMETRIC_FOG_CONFIG.mapPadding
  const minX = bounds.minX - pad
  const maxX = bounds.maxX + pad
  const minZ = bounds.minZ - pad
  const maxZ = bounds.maxZ + pad
  const { height, scale, alpha, color, noise, count } = VOLUMETRIC_FOG_CONFIG

  const specs: CurtainSpec[] = []
  for (let i = 0; i < count; i += 1) {
    const hex = rng.bool() ? color.primary : color.secondary
    specs.push({
      baseX: rng.range(minX, maxX),
      baseZ: rng.range(minZ, maxZ),
      y: rng.range(height.min, height.max),
      rotationY: rng.range(0, Math.PI),
      width: rng.range(scale.minWidth, scale.maxWidth),
      height: rng.range(scale.minHeight, scale.maxHeight),
      alpha: rng.range(alpha.min, alpha.max),
      color: hex,
      noiseScale: rng.range(noise.scaleMin, noise.scaleMax),
      noiseSpeed: rng.range(noise.speedMin, noise.speedMax),
      driftPhase: rng.range(0, Math.PI * 2),
    })
  }
  return specs
}

function createCurtainMaterial(spec: CurtainSpec): ShaderMaterial {
  const mat = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new Color(spec.color) },
      uPlayerPosition: { value: new Vector3() },
      uAlpha: { value: spec.alpha },
      uNoiseScale: { value: spec.noiseScale },
      uNoiseSpeed: { value: spec.noiseSpeed },
      uClearRadius: { value: VOLUMETRIC_FOG_CONFIG.playerClear.radius },
      uClearSoftness: { value: VOLUMETRIC_FOG_CONFIG.playerClear.softness },
      uMinimumFogNearPlayer: {
        value: VOLUMETRIC_FOG_CONFIG.playerClear.minimumFogNearPlayer,
      },
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
 * Large vertical translucent planes with animated FBM — fills knee-to-head air with haze.
 */
export function VolumetricFogCurtains({ mapBounds }: VolumetricFogCurtainsProps) {
  const materialsRef = useRef<ShaderMaterial[]>([])
  const groupRefs = useRef<(Group | null)[]>([])

  const specs = useMemo(
    () => buildCurtainSpecs(mapBounds),
    [mapBounds.minX, mapBounds.maxX, mapBounds.minZ, mapBounds.maxZ],
  )

  const layers = useMemo(() => {
    if (!VOLUMETRIC_FOG_CONFIG.enabled) return []
    return specs.map((spec) => ({
      spec,
      material: createCurtainMaterial(spec),
      geometry: new PlaneGeometry(spec.width, spec.height, 1, 1),
    }))
  }, [specs])

  useLayoutEffect(() => {
    materialsRef.current = layers.map((l) => l.material)
    return () => {
      for (const { material, geometry } of layers) {
        material.dispose()
        geometry.dispose()
      }
    }
  }, [layers])

  useFrame(({ clock }) => {
    if (
      !VOLUMETRIC_FOG_CONFIG.enabled ||
      !VOLUMETRIC_FOG_CONFIG.debug.showFogCurtains ||
      materialsRef.current.length === 0
    ) {
      return
    }

    const [px, py, pz] = usePlayerStore.getState().playerPosition
    const t = clock.elapsedTime
    const drift = VOLUMETRIC_FOG_CONFIG.drift
    const vis =
      GROUND_FOG_CONFIG.debug.forceHighVisibility ||
      VOLUMETRIC_FOG_CONFIG.debug.forceHighVisibility
        ? 1.5
        : 1

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
        const ax = drift.amplitude
        g.position.x =
          spec.baseX + Math.sin(t * drift.speed + phase) * ax
        g.position.z =
          spec.baseZ + Math.cos(t * drift.speed * 0.83 + phase) * ax * 0.65
      }
      i += 1
    }
  })

  if (
    !VOLUMETRIC_FOG_CONFIG.enabled ||
    !VOLUMETRIC_FOG_CONFIG.debug.showFogCurtains ||
    layers.length === 0
  ) {
    return null
  }

  return (
    <group name="volumetric-fog-curtains">
      {layers.map(({ spec, material, geometry }, index) => (
        <group
          key={`${spec.baseX}-${spec.baseZ}-${index}`}
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
          />
        </group>
      ))}
    </group>
  )
}
