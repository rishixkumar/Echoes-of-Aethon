/**
 * Dev playground: hand-built prototype room + gate + exit (Iteration 3).
 * Interactable rows: `features/interaction/interactableRegistry.ts`.
 */
export const PROTOTYPE_ROOM_CONFIG = {
  floor: {
    size: [14, 18] as const,
    position: [0, 0, 0] as const,
  },
  walls: {
    height: 2.5,
    thickness: 0.35,
    color: '#1b1020',
  },
  gate: {
    id: 'echo-gate',
    position: [0, 1.1, -7.2] as const,
    size: [3, 2.2, 0.35] as const,
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
