import { validateRoomGraph } from '../graph/validateRoomGraph'
import type {
  MapDefinition,
  PlacedRoom,
  RoomTemplate,
  RoomObjectType,
} from './mapTypes'

export type MapValidationResult = {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export function createValidationResult(
  errors: string[] = [],
  warnings: string[] = [],
): MapValidationResult {
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

const ROOM_OVERLAP_EPSILON = 0.001

type RoomAabb = {
  roomId: string
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

function getRoomAabb(room: PlacedRoom, template: RoomTemplate): RoomAabb {
  const [x, , z] = room.worldPosition
  const halfW = template.width / 2
  const halfD = template.depth / 2

  return {
    roomId: room.id,
    minX: x - halfW,
    maxX: x + halfW,
    minZ: z - halfD,
    maxZ: z + halfD,
  }
}

function aabbOverlaps(a: RoomAabb, b: RoomAabb): boolean {
  return (
    a.minX < b.maxX - ROOM_OVERLAP_EPSILON &&
    a.maxX > b.minX + ROOM_OVERLAP_EPSILON &&
    a.minZ < b.maxZ - ROOM_OVERLAP_EPSILON &&
    a.maxZ > b.minZ + ROOM_OVERLAP_EPSILON
  )
}

export function validateMapDefinition(map: MapDefinition): MapValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const seenRoomIds = new Set<string>()
  const roomById = new Map<string, PlacedRoom>()
  const roomAabbs: RoomAabb[] = []
  const objectTypeById = new Map<string, RoomObjectType>()
  const objectIds = new Set<string>()

  for (const room of map.rooms) {
    if (seenRoomIds.has(room.id)) {
      errors.push(`Duplicate room id "${room.id}".`)
    }

    seenRoomIds.add(room.id)
    roomById.set(room.id, room)

    const template = map.templates[room.templateId]
    if (!template) {
      errors.push(
        `Room "${room.id}" references missing template "${room.templateId}".`,
      )
      continue
    }

    if (room.rotationY && room.rotationY !== 0) {
      warnings.push(
        `Room "${room.id}" has rotationY=${room.rotationY}; overlap validation assumes axis-aligned rooms.`,
      )
    }

    roomAabbs.push(getRoomAabb(room, template))
  }

  for (let i = 0; i < roomAabbs.length; i += 1) {
    for (let j = i + 1; j < roomAabbs.length; j += 1) {
      const a = roomAabbs[i]
      const b = roomAabbs[j]
      if (aabbOverlaps(a, b)) {
        errors.push(`Rooms "${a.roomId}" and "${b.roomId}" overlap.`)
      }
    }
  }

  for (const room of map.rooms) {
    const template = map.templates[room.templateId]
    if (!template) continue

    for (const object of template.objects) {
      if (objectIds.has(object.id)) {
        warnings.push(
          `Duplicate object id "${object.id}" appears in multiple templates/rooms. Consider namespacing objects by room.`,
        )
      }

      objectIds.add(object.id)
      objectTypeById.set(object.id, object.type)
    }
  }

  const roomIds = new Set(roomById.keys())

  for (const connection of map.connections) {
    const fromRoom = roomById.get(connection.fromRoomId)
    const toRoom = roomById.get(connection.toRoomId)

    if (!roomIds.has(connection.fromRoomId)) {
      errors.push(
        `Connection "${connection.id}" has invalid fromRoomId "${connection.fromRoomId}".`,
      )
    }

    if (!roomIds.has(connection.toRoomId)) {
      errors.push(
        `Connection "${connection.id}" has invalid toRoomId "${connection.toRoomId}".`,
      )
    }

    if (connection.fromRoomId === connection.toRoomId) {
      errors.push(
        `Connection "${connection.id}" connects room "${connection.fromRoomId}" to itself.`,
      )
    }

    if (connection.gateId && !objectIds.has(connection.gateId)) {
      errors.push(
        `Connection "${connection.id}" references missing gateId "${connection.gateId}".`,
      )
    }

    if (
      connection.gateId &&
      objectTypeById.get(connection.gateId) !== 'gate'
    ) {
      errors.push(
        `Connection "${connection.id}" gateId "${connection.gateId}" does not reference an object of type "gate".`,
      )
    }

    if (
      connection.requiredObjectiveId &&
      !objectIds.has(connection.requiredObjectiveId)
    ) {
      errors.push(
        `Connection "${connection.id}" references missing requiredObjectiveId "${connection.requiredObjectiveId}".`,
      )
    }

    if (
      connection.requiredObjectiveId &&
      objectTypeById.get(connection.requiredObjectiveId) !== 'objective-orb' &&
      objectTypeById.get(connection.requiredObjectiveId) !== 'echo-orb'
    ) {
      errors.push(
        `Connection "${connection.id}" requiredObjectiveId "${connection.requiredObjectiveId}" does not reference an objective object.`,
      )
    }

    if (!fromRoom || !toRoom) continue

    const fromTemplate = map.templates[fromRoom.templateId]
    const toTemplate = map.templates[toRoom.templateId]

    const fromDoorwayOverride = fromTemplate?.doorways.find(
      (doorway) => doorway.direction === connection.fromDirection,
    )

    const toDoorwayOverride = toTemplate?.doorways.find(
      (doorway) => doorway.direction === connection.toDirection,
    )

    if (
      fromDoorwayOverride?.connectsToRoomId &&
      fromDoorwayOverride.connectsToRoomId !== connection.toRoomId
    ) {
      errors.push(
        `Doorway override "${fromDoorwayOverride.id}" on room "${fromRoom.id}" points to "${fromDoorwayOverride.connectsToRoomId}" but connection points to "${connection.toRoomId}".`,
      )
    }

    if (
      toDoorwayOverride?.connectsToRoomId &&
      toDoorwayOverride.connectsToRoomId !== connection.fromRoomId
    ) {
      errors.push(
        `Doorway override "${toDoorwayOverride.id}" on room "${toRoom.id}" points to "${toDoorwayOverride.connectsToRoomId}" but connection points to "${connection.fromRoomId}".`,
      )
    }
  }

  for (const template of Object.values(map.templates)) {
    for (const doorway of template.doorways) {
      if (doorway.gateId && !objectIds.has(doorway.gateId)) {
        errors.push(
          `Doorway "${doorway.id}" in template "${template.id}" references missing gateId "${doorway.gateId}".`,
        )
      }

      if (doorway.gateId && objectTypeById.get(doorway.gateId) !== 'gate') {
        errors.push(
          `Doorway "${doorway.id}" in template "${template.id}" gateId "${doorway.gateId}" does not reference an object of type "gate".`,
        )
      }
    }
  }

  const startRooms = map.rooms.filter((room) => {
    const template = map.templates[room.templateId]
    return template?.kind === 'start'
  })

  if (startRooms.length === 0) {
    errors.push('Map has no start room.')
  }

  if (startRooms.length > 1) {
    warnings.push(`Map has ${startRooms.length} start rooms. Expected 1 for now.`)
  }

  const startRoom = startRooms[0]
  if (startRoom) {
    const template = map.templates[startRoom.templateId]

    if (!template?.playerStart) {
      errors.push(
        `Start room "${startRoom.id}" template "${template?.id}" has no playerStart.`,
      )
    }
  }

  const objectiveRooms = map.rooms.filter((room) => {
    const template = map.templates[room.templateId]
    return template?.kind === 'objective'
  })

  if (objectiveRooms.length === 0) {
    errors.push('Map has no objective room.')
  }

  const hasObjectiveObject = map.rooms.some((room) => {
    const template = map.templates[room.templateId]
    return template?.objects.some((object) => object.type === 'objective-orb')
  })

  if (!hasObjectiveObject) {
    errors.push('Map has no objective-orb object.')
  }

  const hasExitObject = map.rooms.some((room) => {
    const template = map.templates[room.templateId]
    return template?.objects.some((object) => object.type === 'exit-zone')
  })

  const hasExitRoom = map.rooms.some((room) => {
    const template = map.templates[room.templateId]
    return template?.kind === 'exit'
  })

  if (!hasExitObject && !hasExitRoom) {
    errors.push('Map has no exit-zone object or exit room.')
  }

  const graphResult = validateRoomGraph(map)
  errors.push(...graphResult.errors)
  warnings.push(...graphResult.warnings)

  return createValidationResult(errors, warnings)
}

export function assertValidMapDefinition(map: MapDefinition): void {
  const result = validateMapDefinition(map)
  if (!result.valid) {
    throw new Error(
      [
        `Invalid map definition: ${map.id}`,
        ...result.errors.map((error) => `- ${error}`),
      ].join('\n'),
    )
  }

  if (import.meta.env.DEV && result.warnings.length > 0) {
    console.warn(
      [
        `Map validation warnings: ${map.id}`,
        ...result.warnings.map((warning) => `- ${warning}`),
      ].join('\n'),
    )
  }
}
