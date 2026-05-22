import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import {
  Color,
  DoubleSide,
  NormalBlending,
  PlaneGeometry,
  ShaderMaterial,
  Vector3,
} from 'three'
import { useCameraStore } from '../../features/camera/cameraStore'
import { usePlayerStore } from '../../features/player/playerStore'
import { GROUND_FOG_CONFIG } from './groundFogConfig'

type MapBoundsXZ = Readonly<{
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}>

type GroundFogLayerProps = Readonly<{
  mapBounds: MapBoundsXZ
}>

const lanternLocal = new Vector3(0.38, 0.95, 0.25)

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
uniform vec3 uLanternPosition;
uniform float uAlpha;
uniform float uNoiseScale;
uniform float uNoiseSpeed;
uniform float uClearRadius;
uniform float uClearSoftness;
uniform float uLanternClearRadius;
uniform float uLanternClearSoftness;
uniform float uMinimumFogNearPlayer;
uniform float uEdgeFade;

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
  // Three-octave world-space cloud bands — patches, voids, rolling structure.
  vec2 wx = vWorldPosition.xz;
  float n1 = fbm(wx * 0.055 + vec2(uTime * 0.018, 0.0));
  float n2 = fbm(wx * 0.13  + vec2(0.0, -uTime * 0.027));
  float n3 = fbm(wx * 0.31  + vec2(uTime * 0.012, uTime * 0.018));

  float cloud = n1 * 0.62 + n2 * 0.28 + n3 * 0.10;
  cloud = smoothstep(0.34, 0.68, cloud);

  // Dense near floor, fast falloff through knee height.
  float heightDensity = 1.0 - smoothstep(0.0, 1.05, vWorldPosition.y);
  heightDensity = pow(max(heightDensity, 0.0), 0.38);

  // Player/lantern pocket — 82% minimum retained, no clean bubble.
  float distToPlayer = distance(vWorldPosition.xz, uPlayerPosition.xz);
  float clearPlayerFactor = smoothstep(
    uClearRadius,
    uClearRadius + uClearSoftness,
    distToPlayer
  );
  float playerPocket = mix(uMinimumFogNearPlayer, 1.0, clearPlayerFactor);

  float distToLantern = distance(vWorldPosition.xz, uLanternPosition.xz);
  float clearLanternFactor = smoothstep(
    uLanternClearRadius,
    uLanternClearRadius + uLanternClearSoftness,
    distToLantern
  );
  float lanternPocket = mix(uMinimumFogNearPlayer, 1.0, clearLanternFactor);

  float pocketClear = max(playerPocket, lanternPocket);

  // Soft UV border so the plane edge never clips visibly.
  float edgeFadeX = smoothstep(0.0, uEdgeFade, vUv.x)
                  * smoothstep(0.0, uEdgeFade, 1.0 - vUv.x);
  float edgeFadeY = smoothstep(0.0, uEdgeFade, vUv.y)
                  * smoothstep(0.0, uEdgeFade, 1.0 - vUv.y);

  float alpha = uAlpha * cloud * heightDensity * pocketClear * edgeFadeX * edgeFadeY;

  if (alpha < 0.003) discard;

  // Lantern scatter — fog glows pink near the player, stays dark further away.
  float localGlow = 1.0 - smoothstep(0.0, 4.5, distToPlayer);
  localGlow = pow(localGlow, 2.0);

  vec3 glowColor   = vec3(0.85, 0.22, 0.55);
  vec3 fogColor    = mix(uColor, glowColor, localGlow * 0.55);

  gl_FragColor = vec4(fogColor, alpha);
}
`

function createLayerMaterial(
  layer: (typeof GROUND_FOG_CONFIG.layers)[number],
): ShaderMaterial {
  const mat = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new Color(layer.color) },
      uPlayerPosition: { value: new Vector3() },
      uLanternPosition: { value: new Vector3() },
      uAlpha: { value: layer.alpha },
      uNoiseScale: { value: layer.noiseScale },
      uNoiseSpeed: { value: layer.noiseSpeed },
      uClearRadius: { value: GROUND_FOG_CONFIG.playerClear.radius },
      uClearSoftness: { value: GROUND_FOG_CONFIG.playerClear.softness },
      uLanternClearRadius: { value: GROUND_FOG_CONFIG.lanternClear.radius },
      uLanternClearSoftness: { value: GROUND_FOG_CONFIG.lanternClear.softness },
      uMinimumFogNearPlayer: {
        value: GROUND_FOG_CONFIG.playerClear.minimumFogNearPlayer,
      },
      uEdgeFade: { value: GROUND_FOG_CONFIG.edgeFade },
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
  mat.userData.baseAlpha = layer.alpha
  return mat
}

/**
 * Horizontal fog sheets near the floor — main floor coverage layer.
 * Uses world-space 3-octave FBM with lantern scatter for local pink glow.
 */
export function GroundFogLayer({ mapBounds }: GroundFogLayerProps) {
  const materialsRef = useRef<ShaderMaterial[]>([])
  const scratchLantern = useMemo(() => new Vector3(), [])

  const { width, depth, centerX, centerZ } = useMemo(() => {
    const pad = GROUND_FOG_CONFIG.mapPadding
    const w = mapBounds.maxX - mapBounds.minX + pad * 2
    const d = mapBounds.maxZ - mapBounds.minZ + pad * 2
    const cx = (mapBounds.minX + mapBounds.maxX) / 2
    const cz = (mapBounds.minZ + mapBounds.maxZ) / 2
    return { width: w, depth: d, centerX: cx, centerZ: cz }
  }, [mapBounds.minX, mapBounds.maxX, mapBounds.minZ, mapBounds.maxZ])

  const planeGeometry = useMemo(
    () => new PlaneGeometry(width, depth, 1, 1),
    [width, depth],
  )

  const layers = useMemo(() => {
    if (!GROUND_FOG_CONFIG.enabled) return []
    return GROUND_FOG_CONFIG.layers.map((layer) => ({
      layer,
      material: createLayerMaterial(layer),
    }))
  }, [])

  useLayoutEffect(() => {
    materialsRef.current = layers.map((l) => l.material)
    return () => {
      for (const { material } of layers) {
        material.dispose()
      }
      planeGeometry.dispose()
    }
  }, [layers, planeGeometry])

  useFrame(({ clock }) => {
    if (
      !GROUND_FOG_CONFIG.enabled ||
      !GROUND_FOG_CONFIG.debug.showGroundFog ||
      materialsRef.current.length === 0
    ) {
      return
    }

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
    const vis = GROUND_FOG_CONFIG.debug.forceHighVisibility ? 1.5 : 1

    for (const mat of materialsRef.current) {
      mat.uniforms.uTime.value = t
      mat.uniforms.uPlayerPosition.value.set(px, py, pz)
      mat.uniforms.uLanternPosition.value.copy(scratchLantern)
      const base = (mat.userData.baseAlpha as number) ?? mat.uniforms.uAlpha.value
      mat.uniforms.uAlpha.value = base * vis
    }
  })

  if (
    !GROUND_FOG_CONFIG.enabled ||
    !GROUND_FOG_CONFIG.debug.showGroundFog ||
    layers.length === 0
  ) {
    return null
  }

  return (
    <group name="ground-fog-layer">
      {layers.map(({ layer, material }) => (
        <mesh
          key={`${layer.y}-${layer.noiseScale}`}
          position={[centerX, layer.y, centerZ]}
          rotation={[-Math.PI / 2, 0, 0]}
          geometry={planeGeometry}
          material={material}
          frustumCulled={false}
          renderOrder={-3}
        />
      ))}
    </group>
  )
}
