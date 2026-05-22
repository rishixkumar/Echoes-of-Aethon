import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { PointLight } from 'three'

const CORE_BASE = 3.2
const FILL_BASE = 0.9

/**
 * Lantern lights — warm core + pink fantasy fill.
 * The fill radiates enough to scatter off nearby fog but doesn't illuminate the whole map.
 */
export function PlayerAura() {
  const coreLightRef = useRef<PointLight>(null)
  const fillLightRef = useRef<PointLight>(null)

  useFrame(({ clock }) => {
    const flicker =
      1 +
      Math.sin(clock.elapsedTime * 9) * 0.06 +
      Math.sin(clock.elapsedTime * 17) * 0.03

    if (coreLightRef.current) {
      coreLightRef.current.intensity = CORE_BASE * flicker
    }
    if (fillLightRef.current) {
      fillLightRef.current.intensity = FILL_BASE * flicker
    }
  })

  return (
    <>
      <pointLight
        ref={coreLightRef}
        position={[0, 1.15, 0]}
        color="#ffd2ad"
        intensity={CORE_BASE}
        distance={5.8}
        decay={1.5}
      />
      <pointLight
        ref={fillLightRef}
        position={[0, 0.45, 0]}
        color="#ff6abd"
        intensity={FILL_BASE}
        distance={9}
        decay={1.7}
      />
      <mesh position={[0.38, 0.95, 0.25]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial
          color="#ffd6a3"
          emissive="#a86830"
          emissiveIntensity={1.8}
        />
      </mesh>
    </>
  )
}
