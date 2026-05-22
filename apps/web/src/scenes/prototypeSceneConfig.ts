/**
 * Dev playground: hand-built prototype room + gate + exit (Iteration 3).
 * Interactable rows: `features/interaction/interactableRegistry.ts`.
 */

/** Floor outer size (X × Z) — single source for wall / gate alignment. */
const PROTOTYPE_FLOOR_W = 14
const PROTOTYPE_FLOOR_D = 18

const halfD = PROTOTYPE_FLOOR_D / 2
const wallT = 0.35
const gateW = 3
const gateH = 2.2
const gateD = 0.35

/** Front wall slab center Z (same as `PrototypeRoom` `frontZ`). */
const frontWallCenterZ = -halfD

/**
 * Gate sits in the doorway: back face flush with the room-facing side of the front wall slab
 * (avoids a visible void between jambs and gate). Depth extends slightly into the room (+Z).
 */
const gateCenterZ = frontWallCenterZ + wallT / 2 + gateD / 2

export const PROTOTYPE_ROOM_CONFIG = {
  floor: {
    size: [PROTOTYPE_FLOOR_W, PROTOTYPE_FLOOR_D] as const,
    position: [0, 0, 0] as const,
  },
  walls: {
    height: 2.5,
    thickness: wallT,
    color: '#1b1020',
    /** Extra length on each visual wall segment (± along its long axis) to seal mesh seams. */
    visualOverlap: 0.08,
  },
  gate: {
    id: 'echo-gate',
    position: [0, 1.1, gateCenterZ] as const,
    size: [gateW, gateH, gateD] as const,
  },
  exitZone: {
    id: 'prototype-exit-zone',
    position: [0, 0.03, -8.3] as const,
    size: [3.5, 0.05, 1.2] as const,
  },
  playerStart: [0, 0, 3] as const,
  objectiveOrb: {
    id: 'gate-orb',
    position: [-3, 0.5, 1] as const,
  },
} as const

/** Scene-facing config derived from `PROTOTYPE_ROOM_CONFIG` for movement, collision, and assembly. */
export const PROTOTYPE_SCENE_CONFIG = {
  floor: {
    halfExtentX: PROTOTYPE_ROOM_CONFIG.floor.size[0] / 2,
    halfExtentZ: PROTOTYPE_ROOM_CONFIG.floor.size[1] / 2,
    sizeX: PROTOTYPE_ROOM_CONFIG.floor.size[0],
    sizeZ: PROTOTYPE_ROOM_CONFIG.floor.size[1],
  },
  gate: {
    id: PROTOTYPE_ROOM_CONFIG.gate.id,
    position: [...PROTOTYPE_ROOM_CONFIG.gate.position] as const,
    size: [...PROTOTYPE_ROOM_CONFIG.gate.size] as const,
    unlocksWhen: 'gate-orb' as const,
  },
  exitZone: PROTOTYPE_ROOM_CONFIG.exitZone,
  playerStart: PROTOTYPE_ROOM_CONFIG.playerStart,
  objectiveOrb: PROTOTYPE_ROOM_CONFIG.objectiveOrb,
} as const
