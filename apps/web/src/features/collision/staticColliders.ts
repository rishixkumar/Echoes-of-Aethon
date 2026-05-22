import { INTERACTABLES } from '../interaction/interactableRegistry'
import { PROTOTYPE_SCENE_CONFIG } from '../../scenes/prototypeSceneConfig'
import { getRoomWallColliders, getConnectionCorridorColliders } from '../map-generation/mapCollision'
import { FIXED_PROTOTYPE_MAP } from '../map-generation/mapSceneUtils'
import { useWorldStateStore } from '../world-state/worldStateStore'
import { COLLISION_CONFIG } from './collisionConfig'
import type { CircleCollider, RectCollider, StaticCollider } from './collisionTypes'

const gateCfg = PROTOTYPE_SCENE_CONFIG.gate

const GENERATED_ROOM_WALL_RECTS: readonly RectCollider[] =
  FIXED_PROTOTYPE_MAP.rooms.flatMap((room) => {
    const template = FIXED_PROTOTYPE_MAP.templates[room.templateId]
    if (!template) return []
    return getRoomWallColliders(FIXED_PROTOTYPE_MAP, room, template)
  })

const CONNECTION_CORRIDOR_WALL_RECTS: readonly RectCollider[] =
  getConnectionCorridorColliders(FIXED_PROTOTYPE_MAP)

/** XZ circles for interactable bodies (always active). */
const INTERACTABLE_COLLIDERS: readonly CircleCollider[] = INTERACTABLES.map(
  (item) => ({
    id: item.id,
    kind: 'circle' as const,
    position: [item.position[0], item.position[1], item.position[2]] as [
      number,
      number,
      number,
    ],
    radius: item.colliderRadius,
  }),
)

function getGateRectCollider(): RectCollider | null {
  if (
    useWorldStateStore.getState().isInteractableActivated(gateCfg.unlocksWhen)
  ) {
    return null
  }
  const [gx, gy, gz] = gateCfg.position
  const [gw, , gd] = gateCfg.size
  return {
    id: gateCfg.id,
    kind: 'rect',
    position: [gx, gy, gz],
    size: [gw, gd],
  }
}

/** Walls + closed gate rects — for third-person camera obstruction (XZ footprints). */
export function getThirdPersonCameraObstructionRects(): RectCollider[] {
  const rects: RectCollider[] = [
    ...GENERATED_ROOM_WALL_RECTS,
    ...CONNECTION_CORRIDOR_WALL_RECTS,
  ]
  const gate = getGateRectCollider()
  if (gate) rects.push(gate)
  return rects
}

/** Colliders used by the player this frame (walls + optional gate + interactables). */
export function getCollidersForPlayer(): StaticCollider[] {
  const gate = getGateRectCollider()
  const rects: StaticCollider[] = [
    ...GENERATED_ROOM_WALL_RECTS,
    ...CONNECTION_CORRIDOR_WALL_RECTS,
  ]
  if (gate) rects.push(gate)
  return [...rects, ...INTERACTABLE_COLLIDERS]
}

function xzCircleOverlapsRect(
  px: number,
  pz: number,
  playerRadius: number,
  rect: RectCollider,
): boolean {
  const [cx, , cz] = rect.position
  const [fullW, fullD] = rect.size
  const halfW = fullW / 2
  const halfD = fullD / 2
  const rectMinX = cx - halfW
  const rectMaxX = cx + halfW
  const rectMinZ = cz - halfD
  const rectMaxZ = cz + halfD

  const closestX = Math.max(rectMinX, Math.min(px, rectMaxX))
  const closestZ = Math.max(rectMinZ, Math.min(pz, rectMaxZ))
  const dx = px - closestX
  const dz = pz - closestZ
  return dx * dx + dz * dz < playerRadius * playerRadius
}

export function xzOverlapsAnyStaticCollider(
  px: number,
  pz: number,
  playerRadius: number,
) {
  if (!COLLISION_CONFIG.xzOnly) return false
  for (const c of getCollidersForPlayer()) {
    if (c.kind === 'rect') {
      if (xzCircleOverlapsRect(px, pz, playerRadius, c)) return true
    } else {
      const dx = px - c.position[0]
      const dz = pz - c.position[2]
      const dist = Math.hypot(dx, dz)
      if (dist < playerRadius + c.radius) return true
    }
  }
  return false
}
