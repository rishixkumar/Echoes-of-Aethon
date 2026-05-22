import { InteractableRenderer } from '../features/interaction/InteractableRenderer'
import { GameCamera } from '../features/camera/GameCamera'
import { PlayerController } from '../features/player/PlayerController'
import { EchoGate } from '../features/world-objects/EchoGate'
import { ExitZone } from '../features/world-objects/ExitZone'
import { GeneratedMap, FIXED_PROTOTYPE_MAP } from '../features/map-generation'
import { Atmosphere } from '../rendering/Atmosphere'
import { SkyFogDome } from '../rendering/SkyFogDome'
import { CelestialBodies } from '../rendering/sky/CelestialBodies'
import { CELESTIAL_BODIES_CONFIG } from '../rendering/sky/celestialBodiesConfig'
import { SKY_CLOUD_CONFIG } from '../rendering/sky/skyCloudConfig'
import { SkyCloudLayer } from '../rendering/sky/SkyCloudLayer'
import { CLOUD_FOG_CONFIG } from '../rendering/mist/cloudFogConfig'
import { CloudFogVolume } from '../rendering/mist/CloudFogVolume'
import { GROUND_FOG_CONFIG } from '../rendering/mist/groundFogConfig'
import { GroundFogLayer } from '../rendering/mist/GroundFogLayer'
import { MistParticles } from '../rendering/mist/MistParticles'
import { ROLLING_FOG_BANDS_CONFIG } from '../rendering/mist/rollingFogBandsConfig'
import { RollingFogBands } from '../rendering/mist/RollingFogBands'
import { VOLUMETRIC_FOG_CONFIG } from '../rendering/mist/volumetricFogConfig'
import { VolumetricFogCurtains } from '../rendering/mist/VolumetricFogCurtains'
import { PROTOTYPE_SCENE_CONFIG } from './prototypeSceneConfig'

const [spawnX, , spawnZ] = PROTOTYPE_SCENE_CONFIG.playerStart
const { mapBounds } = PROTOTYPE_SCENE_CONFIG
const shadowPad = 4

// Distant pink glow — gives fog something to reveal and adds depth cue.
const glowX = mapBounds.maxX - 8
const glowZ = (mapBounds.minZ + mapBounds.maxZ) / 2

/**
 * Prototype playground: seeded linear map, full layered fog stack, camera, player, interactables.
 */
export function PrototypeScene() {
  return (
    <>
      <Atmosphere />
      <SkyFogDome mapBounds={mapBounds} />
      {CELESTIAL_BODIES_CONFIG.enabled ? (
        <CelestialBodies mapBounds={mapBounds} />
      ) : null}
      {SKY_CLOUD_CONFIG.enabled ? (
        <SkyCloudLayer mapBounds={mapBounds} />
      ) : null}

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

      {/* Distant pink glow — creates depth and something for fog to scatter against. */}
      <pointLight
        position={[glowX, 1.6, glowZ]}
        intensity={2.2}
        distance={28}
        decay={1.7}
        color="#ff4fb3"
      />
      <mesh position={[glowX, 1.6, glowZ]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#ff4fb3" />
      </mesh>

      <GeneratedMap map={FIXED_PROTOTYPE_MAP} />

      <GroundFogLayer mapBounds={mapBounds} />

      {CLOUD_FOG_CONFIG.enabled ? (
        <CloudFogVolume mapBounds={mapBounds} />
      ) : null}

      {ROLLING_FOG_BANDS_CONFIG.enabled &&
      ROLLING_FOG_BANDS_CONFIG.debug.showRollingBands ? (
        <RollingFogBands mapBounds={mapBounds} />
      ) : null}

      {VOLUMETRIC_FOG_CONFIG.enabled &&
      VOLUMETRIC_FOG_CONFIG.debug.showFogCurtains ? (
        <VolumetricFogCurtains mapBounds={mapBounds} />
      ) : null}

      {GROUND_FOG_CONFIG.debug.showParticles ? (
        <MistParticles mapBounds={mapBounds} />
      ) : null}

      <EchoGate />
      <ExitZone />
      <GameCamera />
      <PlayerController spawn={{ x: spawnX, z: spawnZ }} />
      <InteractableRenderer />
    </>
  )
}
