import { InteractableRenderer } from '../features/interaction/InteractableRenderer'
import { GameCamera } from '../features/camera/GameCamera'
import { PlayerController } from '../features/player/PlayerController'
import { EchoGate } from '../features/world-objects/EchoGate'
import { ExitZone } from '../features/world-objects/ExitZone'
import { GeneratedMap, FIXED_PROTOTYPE_MAP } from '../features/map-generation'
import { Atmosphere } from '../rendering/Atmosphere'
import { PROTOTYPE_SCENE_CONFIG } from './prototypeSceneConfig'

const [spawnX, , spawnZ] = PROTOTYPE_SCENE_CONFIG.playerStart
const { mapBounds } = PROTOTYPE_SCENE_CONFIG
const shadowPad = 4

/**
 * Prototype playground: seeded linear map, lighting, optional gate, exit zone, camera, player, interactables.
 */
export function PrototypeScene() {
  return (
    <>
      <Atmosphere />
      <directionalLight
        castShadow
        position={[mapBounds.minX + 8, 8, 4]}
        intensity={1.1}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={mapBounds.minX - shadowPad}
        shadow-camera-right={mapBounds.maxX + shadowPad}
        shadow-camera-top={mapBounds.maxZ + shadowPad}
        shadow-camera-bottom={mapBounds.minZ - shadowPad}
      />
      <GeneratedMap map={FIXED_PROTOTYPE_MAP} />
      <EchoGate />
      <ExitZone />
      <GameCamera />
      <PlayerController spawn={{ x: spawnX, z: spawnZ }} />
      <InteractableRenderer />
    </>
  )
}
