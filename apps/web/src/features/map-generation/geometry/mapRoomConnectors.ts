import type { MapDefinition, PlacedRoom, RoomTemplate } from '../data/mapTypes'
import { wallFromBounds } from './mapWallGeometry'
import {
  getOuterWallX,
  getOuterWallZ,
} from './mapDoorwayPlacement'

export type ConnectionFloor = {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export type ConnectionSideWall = {
  key: string
  position: readonly [number, number, number]
  args: readonly [number, number, number]
}

export type ConnectionCorridor = {
  id: string
  floor: ConnectionFloor
  sideWalls: ConnectionSideWall[]
  floorColor: string
  wallColor: string
}

function roomXSpan(room: PlacedRoom, template: RoomTemplate) {
  const [cx] = room.worldPosition
  const halfW = template.width / 2
  return { min: cx - halfW, max: cx + halfW }
}

function roomZSpan(room: PlacedRoom, template: RoomTemplate) {
  const [, , cz] = room.worldPosition
  const halfD = template.depth / 2
  return { min: cz - halfD, max: cz + halfD }
}

function buildEastWestCorridor(
  connectionId: string,
  fromRoom: PlacedRoom,
  fromTemplate: RoomTemplate,
  toRoom: PlacedRoom,
  toTemplate: RoomTemplate,
): ConnectionCorridor | null {
  const minX = getOuterWallX(fromRoom, fromTemplate, 'east')
  const maxX = getOuterWallX(toRoom, toTemplate, 'west')
  if (maxX <= minX) return null

  const fromZ = roomZSpan(fromRoom, fromTemplate)
  const toZ = roomZSpan(toRoom, toTemplate)
  const minZ = Math.max(fromZ.min, toZ.min)
  const maxZ = Math.min(fromZ.max, toZ.max)
  if (maxZ <= minZ) return null

  const t = Math.max(fromTemplate.wallThickness, toTemplate.wallThickness)
  const h = Math.max(fromTemplate.wallHeight, toTemplate.wallHeight)
  const ov = Math.max(fromTemplate.visualOverlap, toTemplate.visualOverlap)

  const north = wallFromBounds(minX - ov, maxX + ov, minZ - t / 2, minZ + t / 2, h)
  const south = wallFromBounds(minX - ov, maxX + ov, maxZ - t / 2, maxZ + t / 2, h)

  return {
    id: `corridor-${connectionId}`,
    floor: { minX, maxX, minZ, maxZ },
    sideWalls: [
      { ...north, key: 'north-barrier' },
      { ...south, key: 'south-barrier' },
    ],
    floorColor: fromTemplate.floorColor,
    wallColor: fromTemplate.wallColor,
  }
}

function buildWestEastCorridor(
  connectionId: string,
  fromRoom: PlacedRoom,
  fromTemplate: RoomTemplate,
  toRoom: PlacedRoom,
  toTemplate: RoomTemplate,
): ConnectionCorridor | null {
  const minX = getOuterWallX(toRoom, toTemplate, 'east')
  const maxX = getOuterWallX(fromRoom, fromTemplate, 'west')
  if (maxX <= minX) return null

  const fromZ = roomZSpan(fromRoom, fromTemplate)
  const toZ = roomZSpan(toRoom, toTemplate)
  const minZ = Math.max(fromZ.min, toZ.min)
  const maxZ = Math.min(fromZ.max, toZ.max)
  if (maxZ <= minZ) return null

  const t = Math.max(fromTemplate.wallThickness, toTemplate.wallThickness)
  const h = Math.max(fromTemplate.wallHeight, toTemplate.wallHeight)
  const ov = Math.max(fromTemplate.visualOverlap, toTemplate.visualOverlap)

  const north = wallFromBounds(minX - ov, maxX + ov, minZ - t / 2, minZ + t / 2, h)
  const south = wallFromBounds(minX - ov, maxX + ov, maxZ - t / 2, maxZ + t / 2, h)

  return {
    id: `corridor-${connectionId}`,
    floor: { minX, maxX, minZ, maxZ },
    sideWalls: [
      { ...north, key: 'north-barrier' },
      { ...south, key: 'south-barrier' },
    ],
    floorColor: fromTemplate.floorColor,
    wallColor: fromTemplate.wallColor,
  }
}

function buildNorthSouthCorridor(
  connectionId: string,
  fromRoom: PlacedRoom,
  fromTemplate: RoomTemplate,
  toRoom: PlacedRoom,
  toTemplate: RoomTemplate,
  fromDir: 'north' | 'south',
): ConnectionCorridor | null {
  // North = negative-Z, South = positive-Z.
  // The corridor must run between the two outer-wall faces that face each other.
  //
  // fromDir === 'north': fromRoom is at larger Z; toRoom is further north (smaller Z).
  //   gap runs from toRoom's south face (less negative) to fromRoom's north face (more negative).
  //   minZ = toRoom south outer,  maxZ = fromRoom north outer
  //
  // fromDir === 'south': fromRoom is at smaller Z; toRoom is further south (larger Z).
  //   gap runs from fromRoom's south face to toRoom's north face.
  //   minZ = fromRoom south outer,  maxZ = toRoom north outer
  const minZ =
    fromDir === 'north'
      ? getOuterWallZ(toRoom, toTemplate, 'south')
      : getOuterWallZ(fromRoom, fromTemplate, 'south')
  const maxZ =
    fromDir === 'north'
      ? getOuterWallZ(fromRoom, fromTemplate, 'north')
      : getOuterWallZ(toRoom, toTemplate, 'north')
  if (maxZ <= minZ) return null

  const fromX = roomXSpan(fromRoom, fromTemplate)
  const toX = roomXSpan(toRoom, toTemplate)
  const minX = Math.max(fromX.min, toX.min)
  const maxX = Math.min(fromX.max, toX.max)
  if (maxX <= minX) return null

  const t = Math.max(fromTemplate.wallThickness, toTemplate.wallThickness)
  const h = Math.max(fromTemplate.wallHeight, toTemplate.wallHeight)
  const ov = Math.max(fromTemplate.visualOverlap, toTemplate.visualOverlap)

  const west = wallFromBounds(minX - t / 2, minX + t / 2, minZ - ov, maxZ + ov, h)
  const east = wallFromBounds(maxX - t / 2, maxX + t / 2, minZ - ov, maxZ + ov, h)

  return {
    id: `corridor-${connectionId}`,
    floor: { minX, maxX, minZ, maxZ },
    sideWalls: [
      { ...west, key: 'west-barrier' },
      { ...east, key: 'east-barrier' },
    ],
    floorColor: fromTemplate.floorColor,
    wallColor: fromTemplate.wallColor,
  }
}

/**
 * Floor + side barrier walls between connected rooms (full depth overlap, not doorway sliver).
 */
export function buildConnectionCorridors(
  map: MapDefinition,
): ConnectionCorridor[] {
  const corridors: ConnectionCorridor[] = []

  for (const connection of map.connections) {
    const fromRoom = map.rooms.find((r) => r.id === connection.fromRoomId)
    const toRoom = map.rooms.find((r) => r.id === connection.toRoomId)
    if (!fromRoom || !toRoom) continue

    const fromTemplate = map.templates[fromRoom.templateId]
    const toTemplate = map.templates[toRoom.templateId]
    if (!fromTemplate || !toTemplate) continue

    let corridor: ConnectionCorridor | null = null

    if (
      connection.fromDirection === 'east' &&
      connection.toDirection === 'west'
    ) {
      corridor = buildEastWestCorridor(
        connection.id,
        fromRoom,
        fromTemplate,
        toRoom,
        toTemplate,
      )
    } else if (
      connection.fromDirection === 'west' &&
      connection.toDirection === 'east'
    ) {
      corridor = buildWestEastCorridor(
        connection.id,
        fromRoom,
        fromTemplate,
        toRoom,
        toTemplate,
      )
    } else if (
      connection.fromDirection === 'north' &&
      connection.toDirection === 'south'
    ) {
      corridor = buildNorthSouthCorridor(
        connection.id,
        fromRoom,
        fromTemplate,
        toRoom,
        toTemplate,
        'north',
      )
    } else if (
      connection.fromDirection === 'south' &&
      connection.toDirection === 'north'
    ) {
      corridor = buildNorthSouthCorridor(
        connection.id,
        fromRoom,
        fromTemplate,
        toRoom,
        toTemplate,
        'south',
      )
    }

    if (corridor) corridors.push(corridor)
  }

  return corridors
}

/** @deprecated Use {@link buildConnectionCorridors}. */
export type ConnectionBridge = ConnectionFloor & {
  id: string
  floorColor: string
}

/** @deprecated Use {@link buildConnectionCorridors}. */
export function buildConnectionBridges(map: MapDefinition): ConnectionBridge[] {
  return buildConnectionCorridors(map).map((c) => ({
    id: c.id,
    ...c.floor,
    floorColor: c.floorColor,
  }))
}

export type RoomConnectorBridge = ConnectionBridge
