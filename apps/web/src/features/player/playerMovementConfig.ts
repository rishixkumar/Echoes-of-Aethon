/**
 * Player movement tuning for the prototype (no physics engine).
 *
 * Slab bounds use the fixed map footprint from `PROTOTYPE_SCENE_CONFIG.mapBounds`.
 */
import { PROTOTYPE_SCENE_CONFIG } from '../../scenes/prototypeSceneConfig'

const { mapBounds } = PROTOTYPE_SCENE_CONFIG
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
    minX: mapBounds.minX + CAPSULE_RADIUS,
    maxX: mapBounds.maxX - CAPSULE_RADIUS,
    minZ: mapBounds.minZ + CAPSULE_RADIUS,
    maxZ: mapBounds.maxZ - CAPSULE_RADIUS,
  },
} as const
