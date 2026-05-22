import type { RectCollider } from '../../collision/collisionTypes'

export type Direction = 'north' | 'south' | 'east' | 'west'

export type RoomKind =
  | 'start'
  | 'objective'
  | 'exit'
  | 'connector'
  | 'combat'
  | 'puzzle'

export type DoorwayDefinition = {
  id: string
  direction: Direction
  width: number
  isLocked?: boolean
  gateId?: string
  connectsToRoomId?: string
}

export type RoomObjectType =
  | 'objective-orb'
  | 'echo-orb'
  | 'gate'
  | 'pillar'
  | 'debris'
  | 'exit-zone'

export type RoomObjectDefinition = {
  id: string
  type: RoomObjectType
  position: readonly [number, number, number]
  rotation?: readonly [number, number, number]
  scale?: readonly [number, number, number]
  /** Gate box, exit zone plane footprint, etc. */
  size?: readonly [number, number, number]
}

export type RoomTemplate = {
  id: string
  kind: RoomKind
  width: number
  depth: number
  wallHeight: number
  wallThickness: number
  visualOverlap: number
  wallColor: string
  floorColor: string
  doorways: readonly DoorwayDefinition[]
  objects: readonly RoomObjectDefinition[]
  playerStart?: readonly [number, number, number]
}

export type PlacedRoom = {
  id: string
  templateId: string
  worldPosition: readonly [number, number, number]
  rotationY?: number
}

export type RoomConnection = {
  id: string
  fromRoomId: string
  fromDirection: Direction
  toRoomId: string
  toDirection: Direction
  isLocked?: boolean
  gateId?: string
  requiredObjectiveId?: string
}

export type MapDefinition = {
  id: string
  rooms: readonly PlacedRoom[]
  templates: Record<string, RoomTemplate>
  connections: readonly RoomConnection[]
}

/** Map-derived rects (walls, corridor barriers). Not circles — avoid `StaticCollider &` widening. */
export type GeneratedMapCollider = RectCollider & {
  sourceRoomId: string
  sourceObjectId?: string
}
