import { OrbitControls } from '@react-three/drei'

/**
 * Minimal render-loop smoke test: lighting, mesh, camera controls.
 * Not gameplay — only proves R3F + Three are wired correctly.
 */
export function PrototypeScene() {
  return (
    <>
      <color attach="background" args={['#0b0d12']} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 3]} intensity={1.1} />
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#c96b4a" metalness={0.1} roughness={0.65} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#1a2030" metalness={0.05} roughness={0.95} />
      </mesh>
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
    </>
  )
}
