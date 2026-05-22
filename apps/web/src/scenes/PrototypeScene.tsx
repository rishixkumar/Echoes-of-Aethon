import { OrbitControls } from '@react-three/drei'
import { InteractableRenderer } from '../features/interaction/InteractableRenderer'
import { PlayerController } from '../features/player/PlayerController'
import { EchoGate } from '../features/world-objects/EchoGate'
import { Atmosphere } from '../rendering/Atmosphere'
import { PROTOTYPE_SCENE_CONFIG } from './prototypeSceneConfig'

const floorSize = PROTOTYPE_SCENE_CONFIG.floor.size

/**
 * Prototype playground: lighting, ground, gate, orbit inspection, player movement, interactables.
 */
export function PrototypeScene() {
  return (
    <>
      <Atmosphere />
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
      <EchoGate />
      <PlayerController spawn={{ x: 0, z: 0 }} />
      <InteractableRenderer />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[floorSize, floorSize]} />
        <meshStandardMaterial color="#211020" roughness={0.75} />
      </mesh>
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
    </>
  )
}
