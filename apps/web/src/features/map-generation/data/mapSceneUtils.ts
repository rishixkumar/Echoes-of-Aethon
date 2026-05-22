import { generateFixedPrototypeMap } from './generateFixedMap'
import { localToWorldPosition } from '../geometry/mapObjectPlacement'
import type {
  MapDefinition,
  PlacedRoom,
  RoomObjectDefinition,
  RoomObjectType,
  RoomTemplate,
} from './mapTypes'

/** Shared fixed map instance for scene, collision, and interactables. */
export const FIXED_PROTOTYPE_MAP: MapDefinition = generateFixedPrototypeMap()

export function getPlacedRoom(
  map: MapDefinition,
  roomId: string,
): PlacedRoom | undefined {
  return map.rooms.find((r) => r.id === roomId)
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
  const startRoom = map.rooms.find((r) => {
    const t = map.templates[r.templateId]
    return t?.kind === 'start'
  })
  if (!startRoom) return [0, 0, 0]
  const template = map.templates[startRoom.templateId]
  const local = template?.playerStart ?? ([0, 0, 0] as const)
  return localToWorldPosition(local, startRoom)
}
