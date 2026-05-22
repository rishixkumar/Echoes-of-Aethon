import { INTERACTABLES } from '../interaction/interactableRegistry'
import { COLLISION_CONFIG } from './collisionConfig'
import type { CircleCollider } from './collisionTypes'

/** Static XZ circle colliders derived from the interactable registry. */
export const STATIC_COLLIDERS: readonly CircleCollider[] = INTERACTABLES.map(
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

export function xzOverlapsAnyStaticCollider(
  px: number,
  pz: number,
  playerRadius: number,
) {
  if (!COLLISION_CONFIG.xzOnly) return false
  for (const c of STATIC_COLLIDERS) {
    const dx = px - c.position[0]
    const dz = pz - c.position[2]
    const dist = Math.hypot(dx, dz)
    if (dist < playerRadius + c.radius) return true
  }
  return false
}
