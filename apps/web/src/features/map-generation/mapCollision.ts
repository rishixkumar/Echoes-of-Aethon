import type { RectCollider } from '../collision/collisionTypes'
import { getEffectiveDoorwaysForRoom } from './mapConnections'
import { buildConnectionCorridors } from './mapRoomConnectors'
import { buildWallSlabsForRoom } from './mapRoomWallSlabs'
import type { GeneratedMapCollider, MapDefinition, PlacedRoom, RoomTemplate } from './mapTypes'

/**
 * Build axis-aligned wall rects for a placed room using **effective** doorways
 * (connections + template overrides). Keeps visuals and collision in sync.
 */
export function getRoomWallColliders(
  map: MapDefinition,
  room: PlacedRoom,
  template: RoomTemplate,
): GeneratedMapCollider[] {
  const doorways = getEffectiveDoorwaysForRoom(map, room, template)
  const slabs = buildWallSlabsForRoom({ template, doorways })
  const [ox, oy, oz] = room.worldPosition

  return slabs.map((slab) => {
    const px = slab.position[0] + ox
    const py = slab.position[1] + oy
    const pz = slab.position[2] + oz
    const rect: RectCollider = {
      id: `${room.id}-${slab.key}`,
      kind: 'rect',
      position: [px, py, pz],
      size: [slab.args[0], slab.args[2]],
    }
    return {
      ...rect,
      sourceRoomId: room.id,
    }
  })
}

/** Side barrier walls for connection corridors (keeps player on the map between rooms). */
export function getConnectionCorridorColliders(
  map: MapDefinition,
): GeneratedMapCollider[] {
  return buildConnectionCorridors(map).flatMap((corridor) =>
    corridor.sideWalls.map((wall) => {
      const rect: RectCollider = {
        id: `${corridor.id}-${wall.key}`,
        kind: 'rect',
        position: [...wall.position],
        size: [wall.args[0], wall.args[2]],
      }
      return {
        ...rect,
        sourceRoomId: corridor.id,
      }
    }),
  )
}
