import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo } from 'react'
import {
  Color,
  NormalBlending,
  PlaneGeometry,
  ShaderMaterial,
} from 'three'
import { createSeededRandom } from '../../features/map-generation/data/seededRandom'
import { SKY_CLOUD_CONFIG } from './skyCloudConfig'

type MapBoundsXZ = Readonly<{
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}>

type SkyCloudLayerProps = Readonly<{
  mapBounds: MapBoundsXZ
}>

type CloudItem = Readonly<{
  id: string
  x: number
  y: number
  z: number
  width: number
  depth: number
  rotationY: number
  alpha: number
  color: string
  speed: number
  phase: number
}>

const vertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform vec3 uColor;
uniform float uAlpha;
uniform float uSpeed;
uniform float uPhase;

varying vec2 vUv;

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
  float amp = 0.5;

  for (int i = 0; i < 5; i++) {
    value += amp * noise(p);
    p *= 2.0;
    amp *= 0.5;
  }

  return value;
}

void main() {
  vec2 uv = vUv;

  vec2 moving = uv * 5.0;
  moving.x += uTime * uSpeed + uPhase;
  moving.y += sin(uTime * uSpeed * 0.6 + uPhase) * 0.18;

  float n = fbm(moving);
  float cloud = smoothstep(0.38, 0.75, n);

  float edge =
    smoothstep(0.0, 0.18, uv.x) *
    smoothstep(0.0, 0.18, 1.0 - uv.x) *
    smoothstep(0.0, 0.22, uv.y) *
    smoothstep(0.0, 0.22, 1.0 - uv.y);

  float alpha = uAlpha * cloud * edge;

  if (alpha < 0.004) discard;

  gl_FragColor = vec4(uColor, alpha);
}
`

function buildClouds(bounds: MapBoundsXZ): CloudItem[] {
  const rng = createSeededRandom(SKY_CLOUD_CONFIG.seed)
  const centerX = (bounds.minX + bounds.maxX) / 2
  const centerZ = (bounds.minZ + bounds.maxZ) / 2

  const items: CloudItem[] = []

  for (const layer of SKY_CLOUD_CONFIG.layers) {
    for (let i = 0; i < layer.count; i += 1) {
      const angle = rng.range(0, Math.PI * 2)
      const radius = rng.range(
        layer.radiusMin,
        layer.radiusMax + SKY_CLOUD_CONFIG.mapPadding * 0.22,
      )
      const x = centerX + Math.cos(angle) * radius
      const z = centerZ + Math.sin(angle) * radius

      items.push({
        id: `${layer.id}-${i}`,
        x,
        y: layer.y,
        z,
        width: rng.range(layer.width[0], layer.width[1]),
        depth: rng.range(layer.depth[0], layer.depth[1]),
        rotationY: rng.range(-0.35, 0.35),
        alpha: rng.range(layer.alpha[0], layer.alpha[1]),
        color: layer.color,
        speed: layer.speed,
        phase: rng.range(0, Math.PI * 2),
      })
    }
  }

  return items
}

function createCloudMaterial(cloud: CloudItem): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new Color(cloud.color) },
      uAlpha: { value: cloud.alpha },
      uSpeed: { value: cloud.speed },
      uPhase: { value: cloud.phase },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    toneMapped: false,
    fog: false,
    blending: NormalBlending,
  })
}

/**
 * Layered horizontal sky cloud planes — slow drift, soft noise, dark tones.
 */
export function SkyCloudLayer({ mapBounds }: SkyCloudLayerProps) {
  const clouds = useMemo(
    () => buildClouds(mapBounds),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mapBounds.minX, mapBounds.maxX, mapBounds.minZ, mapBounds.maxZ],
  )

  const { materials, geometries } = useMemo(() => {
    const mats = clouds.map((c) => createCloudMaterial(c))
    const geos = clouds.map((c) => new PlaneGeometry(c.width, c.depth, 1, 1))
    return { materials: mats, geometries: geos }
  }, [clouds])

  useLayoutEffect(() => {
    return () => {
      for (const m of materials) m.dispose()
      for (const g of geometries) g.dispose()
    }
  }, [materials, geometries])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    for (const mat of materials) {
      mat.uniforms.uTime.value = t
    }
  })

  if (!SKY_CLOUD_CONFIG.enabled || clouds.length === 0) return null

  return (
    <group name="sky-cloud-layer">
      {clouds.map((cloud, index) => (
        <mesh
          key={cloud.id}
          position={[cloud.x, cloud.y, cloud.z]}
          rotation={[-Math.PI / 2, 0, cloud.rotationY]}
          geometry={geometries[index]}
          material={materials[index]}
          frustumCulled={false}
          renderOrder={-50}
        />
      ))}
    </group>
  )
}
