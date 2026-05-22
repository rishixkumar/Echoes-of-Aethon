import { InteractableRenderer } from '../features/interaction/InteractableRenderer'
import { GameCamera } from '../features/camera/GameCamera'
import { PlayerController } from '../features/player/PlayerController'
import { EchoGate } from '../features/world-objects/EchoGate'
import { ExitZone } from '../features/world-objects/ExitZone'
import { PrototypeRoom } from '../features/world-objects/PrototypeRoom'
import { Atmosphere } from '../rendering/Atmosphere'
import { PROTOTYPE_SCENE_CONFIG } from './prototypeSceneConfig'

const [spawnX, , spawnZ] = PROTOTYPE_SCENE_CONFIG.playerStart

/**
 * Prototype playground: room, lighting, gate, exit zone, gameplay camera, player, interactables.
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
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <PrototypeRoom />
      <EchoGate />
      <ExitZone />
      <GameCamera />
      <PlayerController spawn={{ x: spawnX, z: spawnZ }} />
      <InteractableRenderer />
    </>
  )
}
