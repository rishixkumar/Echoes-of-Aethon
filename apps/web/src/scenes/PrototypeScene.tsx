import { OrbitControls } from '@react-three/drei'
import { PlayerController } from '../features/player/PlayerController'

/**
 * Prototype playground: lighting, ground, orbit inspection, and a keyboard-driven placeholder player.
 */
export function PrototypeScene() {
  return (
    <>
      <color attach="background" args={['#0b0d12']} />
      <ambientLight intensity={0.35} />
      <directionalLight
        castShadow
        position={[4, 6, 3]}
        intensity={1.1}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <PlayerController spawn={{ x: 0, z: 0 }} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#1a2030" metalness={0.05} roughness={0.95} />
      </mesh>
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
    </>
  )
}
