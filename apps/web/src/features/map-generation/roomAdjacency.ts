import type { Direction, MapDefinition, RoomConnection } from './mapTypes'

export type RoomAdjacency = Partial<Record<Direction, RoomConnection>>

/** Neighbor connections keyed by the direction this room opens toward. */
export function getRoomAdjacency(
  map: MapDefinition,
  roomId: string,
): RoomAdjacency {
  const adjacency: RoomAdjacency = {}

  for (const connection of map.connections) {
    if (connection.fromRoomId === roomId) {
      adjacency[connection.fromDirection] = connection
    }
    if (connection.toRoomId === roomId) {
      adjacency[connection.toDirection] = connection
    }
  }

  return adjacency
}
