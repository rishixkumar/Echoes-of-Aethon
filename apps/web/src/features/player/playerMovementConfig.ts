/**
 * Player movement tuning for the prototype (no physics engine).
 *
 * Slab bounds use `PROTOTYPE_SCENE_CONFIG.floor.halfExtent`, inset by the capsule radius.
 */
import { PROTOTYPE_SCENE_CONFIG } from '../../scenes/prototypeSceneConfig'

const { halfExtent } = PROTOTYPE_SCENE_CONFIG.floor
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
    minX: -halfExtent + CAPSULE_RADIUS,
    maxX: halfExtent - CAPSULE_RADIUS,
    minZ: -halfExtent + CAPSULE_RADIUS,
    maxZ: halfExtent - CAPSULE_RADIUS,
  },
} as const
