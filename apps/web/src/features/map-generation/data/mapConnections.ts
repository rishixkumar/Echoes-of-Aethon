import { MAP_CONFIG } from './mapConfig'
import { getRoomAdjacency } from '../graph/roomAdjacency'
import type {
  Direction,
  DoorwayDefinition,
  MapDefinition,
  PlacedRoom,
  RoomTemplate,
} from './mapTypes'
import { OPPOSITE_DIRECTION } from '../graph/roomGraph'

export function oppositeDirection(direction: Direction): Direction {
  return OPPOSITE_DIRECTION[direction]
}

function mergeDoorways(
  explicit: readonly DoorwayDefinition[],
  generated: DoorwayDefinition[],
): DoorwayDefinition[] {
  const byDirection = new Map<Direction, DoorwayDefinition>()

  for (const doorway of generated) {
    byDirection.set(doorway.direction, doorway)
  }

  for (const doorway of explicit) {
    const existing = byDirection.get(doorway.direction)
    byDirection.set(doorway.direction, {
      ...existing,
      ...doorway,
      width: doorway.width ?? existing?.width ?? MAP_CONFIG.doorway.defaultWidth,
    })
  }

  return [...byDirection.values()]
}

/**
 * Openings = map connections on that side, merged with template overrides (width, lock, gate).
 * Unconnected sides get no doorway → wall builder renders solid walls.
 */
export function getEffectiveDoorwaysForRoom(
  map: MapDefinition,
  room: PlacedRoom,
  template: RoomTemplate,
): DoorwayDefinition[] {
  const adjacency = getRoomAdjacency(map, room.id)

  const connectionDoorways: DoorwayDefinition[] = []
  for (const direction of Object.keys(adjacency) as Direction[]) {
    const connection = adjacency[direction]
    if (!connection) continue
    connectionDoorways.push({
      id: `${room.id}-${direction}-doorway`,
      direction,
      width: MAP_CONFIG.doorway.defaultWidth,
      isLocked: connection.isLocked,
      gateId: connection.gateId,
      connectsToRoomId:
        connection.fromRoomId === room.id
          ? connection.toRoomId
          : connection.fromRoomId,
    })
  }

  return mergeDoorways(template.doorways, connectionDoorways)
}
