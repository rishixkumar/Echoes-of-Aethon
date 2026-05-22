/**
 * Scene-facing config projected from the fixed three-room map template data.
 * Numeric layout source of truth: `ROOM_TEMPLATES` + `generateFixedPrototypeMap()`.
 */
import {
  FIXED_PROTOTYPE_MAP,
  getMapBounds,
  getPlayerStartWorld,
  getWorldObjectByType,
  getWorldObjectPosition,
} from '../features/map-generation'

const OBJECTIVE_ROOM_ID = 'room-objective'

const gateBundle = getWorldObjectByType(
  FIXED_PROTOTYPE_MAP,
  OBJECTIVE_ROOM_ID,
  'gate',
)
const exitBundle = getWorldObjectByType(
  FIXED_PROTOTYPE_MAP,
  OBJECTIVE_ROOM_ID,
  'exit-zone',
)
const orbWorld = getWorldObjectPosition(
  FIXED_PROTOTYPE_MAP,
  OBJECTIVE_ROOM_ID,
  'ancient-echo-orb',
)
const playerStart = getPlayerStartWorld(FIXED_PROTOTYPE_MAP)
const mapBounds = getMapBounds(FIXED_PROTOTYPE_MAP)

if (!gateBundle || !exitBundle || !orbWorld) {
  throw new Error(
    'Fixed prototype map missing objective-room gate, exit zone, or ancient-echo-orb',
  )
}

const gateWorld = getWorldObjectPosition(
  FIXED_PROTOTYPE_MAP,
  OBJECTIVE_ROOM_ID,
  gateBundle.object.id,
)!
const exitWorld = getWorldObjectPosition(
  FIXED_PROTOTYPE_MAP,
  OBJECTIVE_ROOM_ID,
  exitBundle.object.id,
)!

/** @deprecated Prefer map templates; kept for legacy imports during migration. */
export const PROTOTYPE_ROOM_CONFIG = {
  floor: {
    size: [14, 18] as const,
    position: [0, 0, 0] as const,
  },
  walls: {
    height: gateBundle.template.wallHeight,
    thickness: gateBundle.template.wallThickness,
    color: gateBundle.template.wallColor,
    visualOverlap: gateBundle.template.visualOverlap,
  },
  gate: {
    id: gateBundle.object.id,
    position: gateWorld,
    size: [...(gateBundle.object.size ?? ([3, 2.2, 0.35] as const))] as const,
  },
  exitZone: {
    id: exitBundle.object.id,
    position: exitWorld,
    size: [...(exitBundle.object.size ?? ([3.5, 0.05, 1.2] as const))] as const,
  },
  playerStart,
  objectiveOrb: {
    id: 'ancient-echo-orb',
    position: orbWorld,
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
  gate: {
    id: PROTOTYPE_ROOM_CONFIG.gate.id,
    position: [...PROTOTYPE_ROOM_CONFIG.gate.position] as const,
    size: [...PROTOTYPE_ROOM_CONFIG.gate.size] as const,
    unlocksWhen: 'ancient-echo-orb' as const,
  },
  exitZone: PROTOTYPE_ROOM_CONFIG.exitZone,
  playerStart: PROTOTYPE_ROOM_CONFIG.playerStart,
  objectiveOrb: PROTOTYPE_ROOM_CONFIG.objectiveOrb,
} as const
