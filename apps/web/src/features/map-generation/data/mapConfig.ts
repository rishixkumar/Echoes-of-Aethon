/**
 * Global defaults for map generation. Room templates may override per-room values.
 * Keep wall thickness / overlap philosophy aligned with the wall-gap postmortem
 * (outer-skin joins, not floor half-extent alone).
 */
export const MAP_CONFIG = {
  wall: {
    defaultHeight: 2.5,
    defaultThickness: 0.35,
    visualOverlap: 0.08,
  },
  room: {
    defaultWidth: 14,
    defaultDepth: 18,
  },
  doorway: {
    defaultWidth: 3,
  },
} as const
