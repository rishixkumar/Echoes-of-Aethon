import { ROOM_TEMPLATES } from './roomTemplates'
import type { MapDefinition } from './mapTypes'
import { assertValidMapDefinition } from './validateMapDefinition'

export function generateFixedPrototypeMap(): MapDefinition {
  const map: MapDefinition = {
    id: 'prototype-fixed-three-room-map',
    templates: { ...ROOM_TEMPLATES },
    rooms: [
      {
        id: 'room-start',
        templateId: 'prototype-start-room',
        worldPosition: [0, 0, 0],
        rotationY: 0,
      },
      {
        id: 'room-connector',
        templateId: 'prototype-connector-room',
        worldPosition: [17, 0, 0],
        rotationY: 0,
      },
      {
        id: 'room-objective',
        templateId: 'prototype-objective-room',
        worldPosition: [34, 0, 0],
        rotationY: 0,
      },
    ],
    connections: [
      {
        id: 'start-to-connector',
        fromRoomId: 'room-start',
        fromDirection: 'east',
        toRoomId: 'room-connector',
        toDirection: 'west',
      },
      {
        id: 'connector-to-objective',
        fromRoomId: 'room-connector',
        fromDirection: 'east',
        toRoomId: 'room-objective',
        toDirection: 'west',
      },
    ],
  }

  assertValidMapDefinition(map)
  return map
}
