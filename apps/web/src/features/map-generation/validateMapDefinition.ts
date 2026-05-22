import { OPPOSITE_DIRECTION } from './mapConnections'
import { getRoomAdjacency } from './roomAdjacency'
import type { MapDefinition } from './mapTypes'

export type MapValidationResult = {
  ok: boolean
  errors: string[]
}

export function validateMapDefinition(map: MapDefinition): MapValidationResult {
  const errors: string[] = []
  const roomIds = new Set(map.rooms.map((r) => r.id))

  let hasPlayerStart = false
  let hasObjectiveOrb = false
  let hasExitZone = false

  for (const template of Object.values(map.templates)) {
    if (template.playerStart) hasPlayerStart = true
    for (const obj of template.objects) {
      if (obj.type === 'objective-orb') hasObjectiveOrb = true
      if (obj.type === 'exit-zone') hasExitZone = true
    }
  }

  if (!hasPlayerStart) {
    errors.push('Map has no playerStart on any room template.')
  }
  if (!hasObjectiveOrb) {
    errors.push('Map has no objective-orb object on any room template.')
  }
  if (!hasExitZone) {
    errors.push('Map has no exit-zone object on any room template.')
  }

  const sideUse = new Set<string>()

  for (const connection of map.connections) {
    if (!roomIds.has(connection.fromRoomId)) {
      errors.push(
        `Connection "${connection.id}" references unknown fromRoomId "${connection.fromRoomId}".`,
      )
    }
    if (!roomIds.has(connection.toRoomId)) {
      errors.push(
        `Connection "${connection.id}" references unknown toRoomId "${connection.toRoomId}".`,
      )
    }

    if (
      OPPOSITE_DIRECTION[connection.fromDirection] !== connection.toDirection
    ) {
      errors.push(
        `Connection "${connection.id}" directions are not opposite (${connection.fromDirection} ↔ ${connection.toDirection}).`,
      )
    }

    const fromKey = `${connection.fromRoomId}:${connection.fromDirection}`
    if (sideUse.has(fromKey)) {
      errors.push(
        `Room "${connection.fromRoomId}" has multiple connections on ${connection.fromDirection}.`,
      )
    } else {
      sideUse.add(fromKey)
    }

    const toKey = `${connection.toRoomId}:${connection.toDirection}`
    if (sideUse.has(toKey)) {
      errors.push(
        `Room "${connection.toRoomId}" has multiple connections on ${connection.toDirection}.`,
      )
    } else {
      sideUse.add(toKey)
    }
  }

  for (const room of map.rooms) {
    const template = map.templates[room.templateId]
    if (!template) {
      errors.push(
        `Room "${room.id}" references missing template "${room.templateId}".`,
      )
      continue
    }

    if (template.kind === 'connector') {
      const adjacency = getRoomAdjacency(map, room.id)
      if (Object.keys(adjacency).length === 0) {
        errors.push(`Connector room "${room.id}" has no connections.`)
      }
    }
  }

  return { ok: errors.length === 0, errors }
}

export function assertValidMapDefinition(map: MapDefinition): void {
  const result = validateMapDefinition(map)
  if (!result.ok) {
    throw new Error(`Invalid map definition:\n${result.errors.join('\n')}`)
  }
}
