import { OrbitControls } from '@react-three/drei'
import { InteractableRenderer } from '../features/interaction/InteractableRenderer'
import { PlayerController } from '../features/player/PlayerController'
import { PROTOTYPE_SCENE_CONFIG } from './prototypeSceneConfig'

const floorSize = PROTOTYPE_SCENE_CONFIG.floor.size

/**
 * Prototype playground: lighting, ground, orbit inspection, player movement, and interactables.
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
      <InteractableRenderer />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[floorSize, floorSize]} />
        <meshStandardMaterial color="#1a2030" metalness={0.05} roughness={0.95} />
      </mesh>
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
    </>
  )
}
