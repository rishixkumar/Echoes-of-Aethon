import type { Direction, MapDefinition, RoomConnection } from '../data/mapTypes'
import type { RoomEdge, RoomGraph, RoomNode } from './roomGraphTypes'

export const DIRECTION_ORDER: Direction[] = [
  'north',
  'east',
  'south',
  'west',
]

export const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  north: 'south',
  south: 'north',
  east: 'west',
  west: 'east',
}

export function buildRoomGraph(map: MapDefinition): RoomGraph {
  const nodes = new Map<string, RoomNode>()
  const adjacency = new Map<string, Partial<Record<Direction, RoomEdge>>>()

  for (const room of map.rooms) {
    nodes.set(room.id, { id: room.id, room })
    adjacency.set(room.id, {})
  }

  for (const connection of map.connections) {
    const fromRow = adjacency.get(connection.fromRoomId)
    const toRow = adjacency.get(connection.toRoomId)
    if (!fromRow || !toRow) continue

    fromRow[connection.fromDirection] = {
      ...connection,
      oppositeRoomId: connection.toRoomId,
    }

    toRow[connection.toDirection] = {
      ...connection,
      oppositeRoomId: connection.fromRoomId,
    }
  }

  return {
    mapId: map.id,
    nodes,
    adjacency,
  }
}

export function getConnectedRoomIds(graph: RoomGraph, roomId: string): string[] {
  const row = graph.adjacency.get(roomId)
  if (!row) return []

  return Object.values(row)
    .filter(Boolean)
    .map((edge) => edge!.oppositeRoomId)
}

export function getConnectionInDirection(
  graph: RoomGraph,
  roomId: string,
  direction: Direction,
): RoomEdge | undefined {
  return graph.adjacency.get(roomId)?.[direction]
}

export function hasConnectionInDirection(
  graph: RoomGraph,
  roomId: string,
  direction: Direction,
): boolean {
  return Boolean(getConnectionInDirection(graph, roomId, direction))
}

/** Dev / logging: one line per room listing direction → neighbor id. */
export function describeRoomGraph(graph: RoomGraph): string {
  const lines: string[] = []

  for (const [roomId, row] of graph.adjacency.entries()) {
    const exits = Object.entries(row)
      .map(([direction, edge]) => `${direction}→${edge?.oppositeRoomId}`)
      .join(', ')

    lines.push(`${roomId}: ${exits || 'no connections'}`)
  }

  return lines.join('\n')
}
