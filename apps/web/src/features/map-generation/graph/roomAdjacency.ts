import type { Direction, MapDefinition } from '../data/mapTypes'
import type { RoomEdge } from './roomGraphTypes'
import { buildRoomGraph } from './roomGraph'

export type RoomAdjacency = Partial<Record<Direction, RoomEdge>>

/**
 * Neighbor connections keyed by the direction this room opens toward.
 * Implemented via {@link buildRoomGraph} (rebuilt each call; pass a cached graph later if hot).
 */
export function getRoomAdjacency(
  map: MapDefinition,
  roomId: string,
): RoomAdjacency {
  return buildRoomGraph(map).adjacency.get(roomId) ?? {}
}
