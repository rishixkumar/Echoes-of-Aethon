import { Billboard } from '@react-three/drei'
import { useMemo } from 'react'
import { Color, DoubleSide, NormalBlending } from 'three'
import { CELESTIAL_BODIES_CONFIG } from './celestialBodiesConfig'

type MapBoundsXZ = Readonly<{
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}>

type CelestialBodiesProps = Readonly<{
  mapBounds: MapBoundsXZ
}>

function polarSkyPosition({
  centerX,
  centerZ,
  angle,
  radius,
  y,
}: {
  centerX: number
  centerZ: number
  angle: number
  radius: number
  y: number
}): [number, number, number] {
  return [
    centerX + Math.cos(angle) * radius,
    y,
    centerZ + Math.sin(angle) * radius,
  ]
}

const sunVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const sunFragmentShader = /* glsl */ `
uniform vec3 uCoreColor;
uniform vec3 uOuterColor;
uniform float uAlpha;

varying vec2 vUv;

void main() {
  vec2 uv = vUv - vec2(0.5);
  float d = length(uv);

  float core = 1.0 - smoothstep(0.0, 0.12, d);
  float halo = 1.0 - smoothstep(0.08, 0.5, d);

  vec3 color = mix(uOuterColor, uCoreColor, core);
  float alpha = uAlpha * halo;

  if (alpha < 0.003) discard;

  gl_FragColor = vec4(color, alpha);
}
`

/**
 * Distant hazy suns, faint Saturn + moon cluster — rendered before sky cloud planes
 * so clouds veil them (clouds use higher renderOrder).
 */
export function CelestialBodies({ mapBounds }: CelestialBodiesProps) {
  const { centerX, centerZ } = useMemo(
    () => ({
      centerX: (mapBounds.minX + mapBounds.maxX) / 2,
      centerZ: (mapBounds.minZ + mapBounds.maxZ) / 2,
    }),
    [mapBounds.minX, mapBounds.maxX, mapBounds.minZ, mapBounds.maxZ],
  )

  const cfg = CELESTIAL_BODIES_CONFIG
  if (!cfg.enabled) return null

  const saturnPos = polarSkyPosition({
    centerX,
    centerZ,
    angle: cfg.saturn.angle,
    radius: cfg.saturn.radius,
    y: cfg.saturn.y,
  })

  const moonBase = polarSkyPosition({
    centerX,
    centerZ,
    angle: cfg.moons.angle,
    radius: cfg.moons.radius,
    y: cfg.moons.y,
  })

  return (
    <group name="celestial-bodies">
      {cfg.suns.map((sun) => {
        const pos = polarSkyPosition({
          centerX,
          centerZ,
          angle: sun.angle,
          radius: sun.radius,
          y: sun.y,
        })
        return (
          <group key={sun.id} position={pos}>
            <Billboard follow>
              <mesh renderOrder={-90} frustumCulled={false}>
                <planeGeometry args={[sun.size, sun.size, 1, 1]} />
                <shaderMaterial
                  transparent
                  depthWrite={false}
                  depthTest={false}
                  toneMapped={false}
                  fog={false}
                  blending={NormalBlending}
                  uniforms={{
                    uCoreColor: { value: new Color(sun.coreColor) },
                    uOuterColor: { value: new Color(sun.haloColor) },
                    uAlpha: { value: sun.alpha },
                  }}
                  vertexShader={sunVertexShader}
                  fragmentShader={sunFragmentShader}
                />
              </mesh>
            </Billboard>
            <pointLight
              intensity={sun.lightIntensity}
              distance={240}
              decay={2.0}
              color={sun.haloColor}
            />
          </group>
        )
      })}

      <group position={saturnPos}>
        <pointLight
          intensity={cfg.saturn.glowLightIntensity}
          distance={200}
          decay={2.0}
          color={cfg.saturn.glowLightColor}
        />
        <Billboard follow>
          <group renderOrder={-88}>
            <mesh>
              <sphereGeometry args={[cfg.saturn.planetRadius, 32, 16]} />
              <meshStandardMaterial
                color={cfg.saturn.color}
                emissive={cfg.saturn.emissive}
                emissiveIntensity={cfg.saturn.emissiveIntensity}
                roughness={0.88}
                metalness={0.08}
                transparent
                opacity={cfg.saturn.alpha}
                toneMapped={false}
                fog={false}
                depthWrite={false}
              />
            </mesh>
            <mesh rotation={[Math.PI / 2.8, 0.15, 0]}>
              <ringGeometry
                args={[
                  cfg.saturn.ringInnerRadius,
                  cfg.saturn.ringOuterRadius,
                  64,
                ]}
              />
              <meshStandardMaterial
                color={cfg.saturn.ringColor}
                emissive={cfg.saturn.ringEmissive}
                emissiveIntensity={cfg.saturn.ringEmissiveIntensity}
                roughness={0.95}
                metalness={0.02}
                transparent
                opacity={cfg.saturn.alpha * 0.55}
                side={DoubleSide}
                depthWrite={false}
                toneMapped={false}
                fog={false}
              />
            </mesh>
          </group>
        </Billboard>
      </group>

      <group position={moonBase} renderOrder={-87}>
        <pointLight
          intensity={cfg.moons.glowLightIntensity}
          distance={160}
          decay={2.0}
          color={cfg.moons.glowLightColor}
        />
        {cfg.moons.items.map((item, i) => (
          <mesh
            key={`${cfg.moons.id}-${i}`}
            position={[item.offset[0], item.offset[1], item.offset[2]]}
          >
            <sphereGeometry args={[item.radius, 24, 12]} />
            <meshStandardMaterial
              color={cfg.moons.color}
              emissive={cfg.moons.emissive}
              emissiveIntensity={cfg.moons.emissiveIntensity}
              roughness={0.82}
              metalness={0.06}
              transparent
              opacity={cfg.moons.alpha}
              toneMapped={false}
              fog={false}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}
