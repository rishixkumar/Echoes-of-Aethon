import type { Direction, MapDefinition, PlacedRoom, RoomConnection } from '../data/mapTypes'

export type RoomNode = {
  id: string
  room: PlacedRoom
}

export type RoomEdge = RoomConnection & {
  oppositeRoomId: string
}

export type RoomGraph = {
  mapId: string
  nodes: Map<string, RoomNode>
  adjacency: Map<string, Partial<Record<Direction, RoomEdge>>>
}

export type RoomGraphValidationResult = {
  valid: boolean
  errors: string[]
  warnings: string[]
}
