/**
 * Player movement tuning for the prototype (no physics engine).
 *
 * `bounds` match `PrototypeScene` ground: `planeGeometry` 12×12 centered at origin
 * (±6 along X/Z), inset by the capsule radius so the mesh stays visually on the slab.
 */
const PLANE_HALF_EXTENT = 6
const CAPSULE_RADIUS = 0.35
const CAPSULE_LENGTH = 0.9

export const PLAYER_MOVEMENT_CONFIG = {
  speed: 4,
  response: 10,
  capsule: {
    radius: CAPSULE_RADIUS,
    length: CAPSULE_LENGTH,
  },
  bounds: {
    minX: -PLANE_HALF_EXTENT + CAPSULE_RADIUS,
    maxX: PLANE_HALF_EXTENT - CAPSULE_RADIUS,
    minZ: -PLANE_HALF_EXTENT + CAPSULE_RADIUS,
    maxZ: PLANE_HALF_EXTENT - CAPSULE_RADIUS,
  },
} as const
