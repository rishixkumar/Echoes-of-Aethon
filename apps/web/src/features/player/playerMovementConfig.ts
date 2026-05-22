/**
 * Player movement tuning for the prototype (no physics engine).
 *
 * Slab bounds use `PROTOTYPE_SCENE_CONFIG.floor` half-extents, inset by the capsule radius.
 */
import { PROTOTYPE_SCENE_CONFIG } from '../../scenes/prototypeSceneConfig'

const { halfExtentX, halfExtentZ } = PROTOTYPE_SCENE_CONFIG.floor
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
    minX: -halfExtentX + CAPSULE_RADIUS,
    maxX: halfExtentX - CAPSULE_RADIUS,
    minZ: -halfExtentZ + CAPSULE_RADIUS,
    maxZ: halfExtentZ - CAPSULE_RADIUS,
  },
} as const
