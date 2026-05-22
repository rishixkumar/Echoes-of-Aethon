/**
 * Scene-facing config projected from the generated linear map template data.
 * Numeric layout source of truth: `generateLinearMap()` + `ROOM_TEMPLATES`.
 */
import {
  FIXED_PROTOTYPE_MAP,
  findMapObject,
  findPlacedRoomByKind,
  getMapBounds,
  getPlayerStartWorld,
} from '../features/map-generation'

const objectiveRoom = findPlacedRoomByKind(FIXED_PROTOTYPE_MAP, 'objective')
const exitRoom = findPlacedRoomByKind(FIXED_PROTOTYPE_MAP, 'exit')

const orbBundle = findMapObject(
  FIXED_PROTOTYPE_MAP,
  (object) => object.id === 'ancient-echo-orb',
)
const exitBundle = findMapObject(
  FIXED_PROTOTYPE_MAP,
  (object) => object.type === 'exit-zone',
)
const gateBundle = findMapObject(
  FIXED_PROTOTYPE_MAP,
  (object) => object.type === 'gate',
)

const playerStart = getPlayerStartWorld(FIXED_PROTOTYPE_MAP)
const mapBounds = getMapBounds(FIXED_PROTOTYPE_MAP)

if (!objectiveRoom || !exitRoom || !orbBundle || !exitBundle) {
  throw new Error(
    'Generated linear map missing objective room, exit room, ancient-echo-orb, or exit-zone',
  )
}

const exitSize = exitBundle.object.size ?? ([3.5, 0.05, 1.2] as const)
const gateConfig = gateBundle
  ? {
      id: gateBundle.object.id,
      position: gateBundle.worldPosition,
      size: [...(gateBundle.object.size ?? ([3, 2.2, 0.35] as const))] as const,
      unlocksWhen: 'ancient-echo-orb' as const,
    }
  : null

/** @deprecated Prefer map templates; kept for legacy imports during migration. */
export const PROTOTYPE_ROOM_CONFIG = {
  floor: {
    size: [14, 18] as const,
    position: [0, 0, 0] as const,
  },
  walls: {
    height: orbBundle.template.wallHeight,
    thickness: orbBundle.template.wallThickness,
    color: orbBundle.template.wallColor,
    visualOverlap: orbBundle.template.visualOverlap,
  },
  gate: gateConfig ?? {
    id: 'prototype-gate',
    position: [0, 0, 0] as const,
    size: [0, 0, 0] as const,
  },
  exitZone: {
    id: exitBundle.object.id,
    position: exitBundle.worldPosition,
    size: [...exitSize] as const,
  },
  playerStart,
  objectiveOrb: {
    id: 'ancient-echo-orb',
    position: orbBundle.worldPosition,
  },
} as const

export const PROTOTYPE_SCENE_CONFIG = {
  mapBounds,
  floor: {
    halfExtentX: (mapBounds.maxX - mapBounds.minX) / 2,
    halfExtentZ: (mapBounds.maxZ - mapBounds.minZ) / 2,
    sizeX: mapBounds.maxX - mapBounds.minX,
    sizeZ: mapBounds.maxZ - mapBounds.minZ,
  },
  gate: gateConfig,
  exitZone: PROTOTYPE_ROOM_CONFIG.exitZone,
  playerStart: PROTOTYPE_ROOM_CONFIG.playerStart,
  objectiveOrb: PROTOTYPE_ROOM_CONFIG.objectiveOrb,
} as const
