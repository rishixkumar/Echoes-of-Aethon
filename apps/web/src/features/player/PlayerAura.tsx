import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { PointLight } from 'three'

/**
 * Layered warm + fantasy fill point lights with a small emissive lantern mesh — no floor decal.
 */
export function PlayerAura() {
  const coreLightRef = useRef<PointLight>(null)
  const fillLightRef = useRef<PointLight>(null)

  useFrame(({ clock }) => {
    const flicker =
      1 +
      Math.sin(clock.elapsedTime * 9) * 0.08 +
      Math.sin(clock.elapsedTime * 17) * 0.04

    if (coreLightRef.current) {
      coreLightRef.current.intensity = 4.5 * flicker
    }
    if (fillLightRef.current) {
      fillLightRef.current.intensity = 1.4 * flicker
    }
  })

  return (
    <>
      <pointLight
        ref={coreLightRef}
        position={[0, 1.15, 0]}
        color="#ffd6a3"
        intensity={4.5}
        distance={5.5}
        decay={1.35}
      />
      <pointLight
        ref={fillLightRef}
        position={[0, 0.45, 0]}
        color="#ff8fd6"
        intensity={1.4}
        distance={8}
        decay={1.8}
      />
      <mesh position={[0.38, 0.95, 0.25]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial
          color="#ffd6a3"
          emissive="#ffb35c"
          emissiveIntensity={2.5}
        />
      </mesh>
    </>
  )
}
