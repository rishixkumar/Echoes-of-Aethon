import { MAP_CONFIG } from './mapConfig'
import {
  CONNECTOR_ROOM_TEMPLATE_IDS,
  EXIT_ROOM_TEMPLATE_IDS,
  OBJECTIVE_ROOM_TEMPLATE_IDS,
  ROOM_TEMPLATES,
  START_ROOM_TEMPLATE_IDS,
} from './roomTemplates'
import { createSeededRandom } from './seededRandom'
import { assertValidMapDefinition } from './validateMapDefinition'
import { buildRoomGraph, describeRoomGraph } from '../graph/roomGraph'
import type {
  MapDefinition,
  PlacedRoom,
  RoomConnection,
  RoomTemplate,
} from './mapTypes'

export type GenerateLinearMapOptions = {
  seed: string
  roomCount: number
}

function padIndex(index: number): string {
  return String(index).padStart(3, '0')
}

function getEastNeighborX({
  previousRoomX,
  previousTemplate,
  nextTemplate,
  corridorLength,
}: {
  previousRoomX: number
  previousTemplate: RoomTemplate
  nextTemplate: RoomTemplate
  corridorLength: number
}): number {
  return (
    previousRoomX +
    previousTemplate.width / 2 +
    nextTemplate.width / 2 +
    corridorLength
  )
}

function createEastWestConnection(
  fromRoomId: string,
  toRoomId: string,
): RoomConnection {
  return {
    id: `connection-${fromRoomId}-to-${toRoomId}`,
    fromRoomId,
    fromDirection: 'east',
    toRoomId,
    toDirection: 'west',
  }
}

function getTemplate(templateId: string): RoomTemplate {
  return ROOM_TEMPLATES[templateId as keyof typeof ROOM_TEMPLATES]
}

/**
 * Deterministic east/west chain: Start → Connector(s) → Objective → Exit.
 * Same seed + roomCount always yields the same template picks and positions.
 */
export function generateLinearMap(
  options: GenerateLinearMapOptions,
): MapDefinition {
  const { seed, roomCount } = options

  if (roomCount < 3) {
    throw new Error('generateLinearMap requires roomCount >= 3.')
  }

  const rng = createSeededRandom(seed)
  const corridorLength = MAP_CONFIG.connection.defaultCorridorLength
  const connectorCount = roomCount - 3

  const startTemplateId = rng.pick(START_ROOM_TEMPLATE_IDS)
  const objectiveTemplateId = rng.pick(OBJECTIVE_ROOM_TEMPLATE_IDS)
  const exitTemplateId = rng.pick(EXIT_ROOM_TEMPLATE_IDS)
  const connectorTemplateIds = Array.from({ length: connectorCount }, () =>
    rng.pick(CONNECTOR_ROOM_TEMPLATE_IDS),
  )

  const usedTemplateIds = new Set<string>([
    startTemplateId,
    objectiveTemplateId,
    exitTemplateId,
    ...connectorTemplateIds,
  ])

  const templates: Record<string, RoomTemplate> = {}
  for (const templateId of usedTemplateIds) {
    templates[templateId] = getTemplate(templateId)
  }

  const rooms: PlacedRoom[] = []
  const connections: RoomConnection[] = []

  let previousRoomId = 'room-start'
  let previousRoomX = 0
  let previousTemplate = templates[startTemplateId]

  rooms.push({
    id: 'room-start',
    templateId: startTemplateId,
    worldPosition: [0, 0, 0],
    rotationY: 0,
  })

  for (let i = 1; i <= connectorCount; i += 1) {
    const roomId = `room-connector-${padIndex(i)}`
    const templateId = connectorTemplateIds[i - 1]
    const template = templates[templateId]
    const roomX = getEastNeighborX({
      previousRoomX,
      previousTemplate,
      nextTemplate: template,
      corridorLength,
    })

    rooms.push({
      id: roomId,
      templateId,
      worldPosition: [roomX, 0, 0],
      rotationY: 0,
    })
    connections.push(createEastWestConnection(previousRoomId, roomId))

    previousRoomId = roomId
    previousRoomX = roomX
    previousTemplate = template
  }

  const objectiveTemplate = templates[objectiveTemplateId]
  const objectiveX = getEastNeighborX({
    previousRoomX,
    previousTemplate,
    nextTemplate: objectiveTemplate,
    corridorLength,
  })

  rooms.push({
    id: 'room-objective',
    templateId: objectiveTemplateId,
    worldPosition: [objectiveX, 0, 0],
    rotationY: 0,
  })
  connections.push(createEastWestConnection(previousRoomId, 'room-objective'))

  previousRoomId = 'room-objective'
  previousRoomX = objectiveX
  previousTemplate = objectiveTemplate

  const exitTemplate = templates[exitTemplateId]
  const exitX = getEastNeighborX({
    previousRoomX,
    previousTemplate,
    nextTemplate: exitTemplate,
    corridorLength,
  })

  rooms.push({
    id: 'room-exit',
    templateId: exitTemplateId,
    worldPosition: [exitX, 0, 0],
    rotationY: 0,
  })
  connections.push(createEastWestConnection(previousRoomId, 'room-exit'))

  const map: MapDefinition = {
    id: `linear-map-${seed}-${roomCount}`,
    templates,
    rooms,
    connections,
  }

  assertValidMapDefinition(map)

  if (import.meta.env.DEV) {
    console.info(`[linear-map] seed=${seed}, roomCount=${roomCount}`)
    const layout = map.rooms
      .map((r) => {
        const tpl = map.templates[r.templateId]
        const w = tpl?.width ?? '?'
        const d = tpl?.depth ?? '?'
        return `  ${r.id}: ${r.templateId} (${w}×${d} @ x=${r.worldPosition[0].toFixed(2)})`
      })
      .join('\n')
    console.info(
      '[linear-map] topology is always an east/west line; seed only changes templates + spacing:\n' +
        layout,
    )
    console.info('[room-graph]\n' + describeRoomGraph(buildRoomGraph(map)))
  }

  return map
}
