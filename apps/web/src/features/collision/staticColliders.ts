import { INTERACTABLES } from '../interaction/interactableRegistry'
import { PROTOTYPE_SCENE_CONFIG } from '../../scenes/prototypeSceneConfig'
import { useWorldStateStore } from '../world-state/worldStateStore'
import { COLLISION_CONFIG } from './collisionConfig'
import type { CircleCollider } from './collisionTypes'

const gateCfg = PROTOTYPE_SCENE_CONFIG.gate

/** XZ circles for interactable bodies (always active). */
const INTERACTABLE_COLLIDERS: readonly CircleCollider[] = INTERACTABLES.map(
  (item) => ({
    id: item.id,
    position: [item.position[0], item.position[1], item.position[2]] as [
      number,
      number,
      number,
    ],
    radius: item.colliderRadius,
  }),
)

function getGateCollider(): CircleCollider | null {
  if (
    useWorldStateStore.getState().isInteractableActivated(gateCfg.unlocksWhen)
  ) {
    return null
  }
  return {
    id: gateCfg.id,
    position: [
      gateCfg.position[0],
      gateCfg.position[1],
      gateCfg.position[2],
    ] as [number, number, number],
    radius: gateCfg.colliderRadius,
  }
}

/** Colliders used by the player this frame (interactables + optional gate). */
export function getCollidersForPlayer(): CircleCollider[] {
  const gate = getGateCollider()
  return gate ? [...INTERACTABLE_COLLIDERS, gate] : [...INTERACTABLE_COLLIDERS]
}

export function xzOverlapsAnyStaticCollider(
  px: number,
  pz: number,
  playerRadius: number,
) {
  if (!COLLISION_CONFIG.xzOnly) return false
  for (const c of getCollidersForPlayer()) {
    const dx = px - c.position[0]
    const dz = pz - c.position[2]
    const dist = Math.hypot(dx, dz)
    if (dist < playerRadius + c.radius) return true
  }
  return false
}
