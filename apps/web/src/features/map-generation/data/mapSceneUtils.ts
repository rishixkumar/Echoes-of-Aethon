import { generateLinearMap } from './generateLinearMap'
import { generateBranchingMap } from './generateBranchingMap'
import { localToWorldPosition } from '../geometry/mapObjectPlacement'
import type {
  MapDefinition,
  PlacedRoom,
  RoomKind,
  RoomObjectDefinition,
  RoomObjectType,
  RoomTemplate,
} from './mapTypes'

/** Options for the linear fallback (kept for quick comparison). */
export const PROTOTYPE_LINEAR_MAP_OPTIONS = {
  seed: 'dev-seed',
  roomCount: 5,
} as const

/** Options for the active branching map. */
export const PROTOTYPE_BRANCHING_MAP_OPTIONS = {
  seed: 'branch-dev-seed',
  mainPathRoomCount: 5,
  branchCount: 2,
  maxBranchLength: 2,
} as const

/** Shared map instance for scene, collision, and interactables. */
export const FIXED_PROTOTYPE_MAP: MapDefinition = generateBranchingMap(
  PROTOTYPE_BRANCHING_MAP_OPTIONS,
)

/** @deprecated Use FIXED_PROTOTYPE_MAP (now a branching map). Keep for comparison. */
export const FIXED_LINEAR_MAP: MapDefinition = generateLinearMap(
  PROTOTYPE_LINEAR_MAP_OPTIONS,
)

export function getPlacedRoom(
  map: MapDefinition,
  roomId: string,
): PlacedRoom | undefined {
  return map.rooms.find((r) => r.id === roomId)
}

export function findPlacedRoomByKind(
  map: MapDefinition,
  kind: RoomKind,
): PlacedRoom | undefined {
  return map.rooms.find((room) => map.templates[room.templateId]?.kind === kind)
}

export function getRoomTemplate(
  map: MapDefinition,
  room: PlacedRoom,
): RoomTemplate | undefined {
  return map.templates[room.templateId]
}

export function findRoomObject(
  template: RoomTemplate,
  predicate: (obj: RoomObjectDefinition) => boolean,
): RoomObjectDefinition | undefined {
  return template.objects.find(predicate)
}

export function findMapObject(
  map: MapDefinition,
  predicate: (obj: RoomObjectDefinition) => boolean,
):
  | {
      room: PlacedRoom
      template: RoomTemplate
      object: RoomObjectDefinition
      worldPosition: [number, number, number]
    }
  | undefined {
  for (const room of map.rooms) {
    const template = getRoomTemplate(map, room)
    if (!template) continue

    const object = findRoomObject(template, predicate)
    if (!object) continue

    return {
      room,
      template,
      object,
      worldPosition: localToWorldPosition(object.position, room),
    }
  }

  return undefined
}

export function getWorldObjectPosition(
  map: MapDefinition,
  roomId: string,
  objectId: string,
): [number, number, number] | undefined {
  const room = getPlacedRoom(map, roomId)
  if (!room) return undefined
  const template = getRoomTemplate(map, room)
  if (!template) return undefined
  const obj = findRoomObject(template, (o) => o.id === objectId)
  if (!obj) return undefined
  return localToWorldPosition(obj.position, room)
}

export function getWorldObjectByType(
  map: MapDefinition,
  roomId: string,
  type: RoomObjectType,
): { room: PlacedRoom; template: RoomTemplate; object: RoomObjectDefinition } | undefined {
  const room = getPlacedRoom(map, roomId)
  if (!room) return undefined
  const template = getRoomTemplate(map, room)
  if (!template) return undefined
  const object = findRoomObject(template, (o) => o.type === type)
  if (!object) return undefined
  return { room, template, object }
}

export function getPlayerStartWorld(map: MapDefinition): [number, number, number] {
  const startRoom = findPlacedRoomByKind(map, 'start')
  if (!startRoom) return [0, 0, 0]
  const template = map.templates[startRoom.templateId]
  const local = template?.playerStart ?? ([0, 0, 0] as const)
  return localToWorldPosition(local, startRoom)
}
