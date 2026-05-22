import type { MapDefinition } from '../data/mapTypes'
import type { RoomGraphValidationResult } from './roomGraphTypes'
import { buildRoomGraph, OPPOSITE_DIRECTION } from './roomGraph'
import {
  breadthFirstRoomTraversal,
  findShortestRoomPath,
} from './graphTraversal'

export function validateRoomGraph(map: MapDefinition): RoomGraphValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const graph = buildRoomGraph(map)
  const roomIds = new Set(map.rooms.map((room) => room.id))
  const sideUse = new Set<string>()

  for (const connection of map.connections) {
    if (
      !roomIds.has(connection.fromRoomId) ||
      !roomIds.has(connection.toRoomId)
    ) continue

    if (connection.toDirection !== OPPOSITE_DIRECTION[connection.fromDirection]) {
      errors.push(
        `Connection ${connection.id} directions are not opposite: ${connection.fromDirection} → ${connection.toDirection}`,
      )
    }

    const fromKey = `${connection.fromRoomId}:${connection.fromDirection}`
    if (sideUse.has(fromKey)) {
      errors.push(
        `Room ${connection.fromRoomId} has multiple graph connections on ${connection.fromDirection}.`,
      )
    } else {
      sideUse.add(fromKey)
    }

    const toKey = `${connection.toRoomId}:${connection.toDirection}`
    if (sideUse.has(toKey)) {
      errors.push(
        `Room ${connection.toRoomId} has multiple graph connections on ${connection.toDirection}.`,
      )
    } else {
      sideUse.add(toKey)
    }
  }

  for (const [roomId, adjacency] of graph.adjacency.entries()) {
    const usedDirections = Object.keys(adjacency)

    if (usedDirections.length === 0) {
      warnings.push(`Room ${roomId} has no graph connections.`)
    }
  }

  const startRoom = map.rooms.find((room) => {
    const template = map.templates[room.templateId]
    return template?.kind === 'start'
  })

  const objectiveRoom = map.rooms.find((room) => {
    const template = map.templates[room.templateId]
    return template?.kind === 'objective'
  })

  if (startRoom) {
    const reachable = breadthFirstRoomTraversal(graph, startRoom.id)

    for (const room of map.rooms) {
      if (!reachable.includes(room.id)) {
        errors.push(
          `Room ${room.id} is not reachable from start room ${startRoom.id}.`,
        )
      }
    }

    if (objectiveRoom) {
      const path = findShortestRoomPath(graph, startRoom.id, objectiveRoom.id)

      if (!path) {
        errors.push(
          `Objective room ${objectiveRoom.id} is not reachable from start room ${startRoom.id}.`,
        )
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}
