import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { BackSide, Mesh, ShaderMaterial } from 'three'

type MapBoundsXZ = Readonly<{
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}>

type SkyFogDomeProps = Readonly<{
  mapBounds: MapBoundsXZ
}>

const vertexShader = /* glsl */ `
varying vec3 vWorldNormal;

void main() {
  // Pass the unit sphere surface normal (== local position for a unit sphere).
  vWorldNormal = normalize((modelMatrix * vec4(position, 0.0)).xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

// Opaque dark gradient — the dome IS the sky background, so alpha must be 1
// everywhere except the very bottom edge where we soften it.
const fragmentShader = /* glsl */ `
uniform float uTime;

varying vec3 vWorldNormal;

void main() {
  // height: 1.0 at top, 0.0 at equator, negative below.
  float h = normalize(vWorldNormal).y;

  vec3 topColor     = vec3(0.035, 0.006, 0.045);
  vec3 midColor     = vec3(0.13,  0.035, 0.10);
  vec3 horizonColor = vec3(0.32,  0.09,  0.22);

  float horizon = 1.0 - smoothstep(-0.1, 0.55, h);
  float mid     = 1.0 - smoothstep(0.15, 0.90, h);

  // Subtle time shimmer on horizon band only.
  float shimmer = 0.012 * sin(uTime * 0.14 + vWorldNormal.x * 4.8);
  horizon = clamp(horizon + shimmer, 0.0, 1.0);

  vec3 color = topColor;
  color = mix(color, midColor,     mid     * 0.55);
  color = mix(color, horizonColor, horizon * 0.75);

  // Solid — no discard, no alpha < 1 (this IS the background).
  gl_FragColor = vec4(color, 1.0);
}
`

/**
 * Inward-facing sphere used as the sky background.
 * renderOrder=-100 so it draws first, behind everything.
 * depthTest=false keeps it from being clipped by world geometry.
 */
export function SkyFogDome({ mapBounds }: SkyFogDomeProps) {
  const meshRef = useRef<Mesh>(null)
  const matRef = useRef<ShaderMaterial>(null)

  const { centerX, centerZ } = useMemo(
    () => ({
      centerX: (mapBounds.minX + mapBounds.maxX) / 2,
      centerZ: (mapBounds.minZ + mapBounds.maxZ) / 2,
    }),
    [mapBounds.minX, mapBounds.maxX, mapBounds.minZ, mapBounds.maxZ],
  )

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.elapsedTime
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={[centerX, 8, centerZ]}
      scale={[220, 70, 220]}
      renderOrder={-100}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 32, 16]} />
      <shaderMaterial
        ref={matRef}
        args={[
          {
            uniforms: { uTime: { value: 0 } },
            vertexShader,
            fragmentShader,
            side: BackSide,
            transparent: false,
            depthWrite: false,
            depthTest: false,
            toneMapped: false,
            fog: false,
          },
        ]}
      />
    </mesh>
  )
}
