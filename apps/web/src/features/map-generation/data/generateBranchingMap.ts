import { MAP_CONFIG } from './mapConfig'
import {
  BRANCH_ROOM_TEMPLATE_IDS,
  CONNECTOR_ROOM_TEMPLATE_IDS,
  EXIT_ROOM_TEMPLATE_IDS,
  OBJECTIVE_ROOM_TEMPLATE_IDS,
  ROOM_TEMPLATES,
  START_ROOM_TEMPLATE_IDS,
} from './roomTemplates'
import { createSeededRandom } from './seededRandom'
import { assertValidMapDefinition } from './validateMapDefinition'
import { buildRoomGraph, describeRoomGraph, OPPOSITE_DIRECTION } from '../graph/roomGraph'
import type {
  Direction,
  MapDefinition,
  PlacedRoom,
  RoomConnection,
  RoomTemplate,
} from './mapTypes'

export type GenerateBranchingMapOptions = {
  seed: string
  mainPathRoomCount: number
  branchCount: number
  maxBranchLength: number
}

type GridCoord = {
  gx: number
  gz: number
}

function gridKey(coord: GridCoord): string {
  return `${coord.gx},${coord.gz}`
}

function stepCoord(coord: GridCoord, direction: Direction): GridCoord {
  switch (direction) {
    case 'north':
      return { gx: coord.gx, gz: coord.gz - 1 }
    case 'south':
      return { gx: coord.gx, gz: coord.gz + 1 }
    case 'east':
      return { gx: coord.gx + 1, gz: coord.gz }
    case 'west':
      return { gx: coord.gx - 1, gz: coord.gz }
  }
}

function gridToWorldPosition(
  coord: GridCoord,
  spacing: { x: number; z: number },
): [number, number, number] {
  return [coord.gx * spacing.x, 0, coord.gz * spacing.z]
}

function padIndex(n: number): string {
  return String(n).padStart(3, '0')
}

function getTemplate(templateId: string): RoomTemplate {
  return ROOM_TEMPLATES[templateId as keyof typeof ROOM_TEMPLATES]
}

function makeConnection(
  fromRoomId: string,
  fromDirection: Direction,
  toRoomId: string,
): RoomConnection {
  return {
    id: `connection-${fromRoomId}-to-${toRoomId}`,
    fromRoomId,
    fromDirection,
    toRoomId,
    toDirection: OPPOSITE_DIRECTION[fromDirection],
  }
}

/**
 * Deterministic branching map.
 * Main path: east/west chain (Start → Connectors → Objective → Exit).
 * Branches: north/south side rooms from main connector rooms.
 * Same seed + options → same layout and template picks every time.
 */
export function generateBranchingMap(
  options: GenerateBranchingMapOptions,
): MapDefinition {
  const { seed, mainPathRoomCount, branchCount, maxBranchLength } = options

  if (mainPathRoomCount < 3) {
    throw new Error('generateBranchingMap requires mainPathRoomCount >= 3.')
  }
  if (branchCount < 0) {
    throw new Error('generateBranchingMap requires branchCount >= 0.')
  }
  if (maxBranchLength < 1) {
    throw new Error('generateBranchingMap requires maxBranchLength >= 1.')
  }

  const rng = createSeededRandom(seed)
  const spacing = {
    x: MAP_CONFIG.connection.defaultCorridorLength + 20,
    z: MAP_CONFIG.connection.defaultCorridorLength + 20,
  }

  const mainConnectorCount = mainPathRoomCount - 3
  const startTemplateId = rng.pick(START_ROOM_TEMPLATE_IDS)
  const objectiveTemplateId = rng.pick(OBJECTIVE_ROOM_TEMPLATE_IDS)
  const exitTemplateId = rng.pick(EXIT_ROOM_TEMPLATE_IDS)
  const mainConnectorTemplateIds = Array.from(
    { length: mainConnectorCount },
    () => rng.pick(CONNECTOR_ROOM_TEMPLATE_IDS),
  )

  const usedTemplateIds = new Set<string>([
    startTemplateId,
    objectiveTemplateId,
    exitTemplateId,
    ...mainConnectorTemplateIds,
  ])

  const templates: Record<string, RoomTemplate> = {}
  const rooms: PlacedRoom[] = []
  const connections: RoomConnection[] = []
  const occupiedGrid = new Set<string>()
  const coordByRoomId = new Map<string, GridCoord>()

  function ensureTemplate(templateId: string): void {
    if (!templates[templateId]) {
      templates[templateId] = getTemplate(templateId)
    }
  }

  function placeRoom(
    id: string,
    templateId: string,
    coord: GridCoord,
  ): PlacedRoom {
    const worldPos = gridToWorldPosition(coord, spacing)
    const room: PlacedRoom = { id, templateId, worldPosition: worldPos, rotationY: 0 }
    rooms.push(room)
    occupiedGrid.add(gridKey(coord))
    coordByRoomId.set(id, coord)
    usedTemplateIds.add(templateId)
    ensureTemplate(templateId)
    return room
  }

  // ── Main path ──────────────────────────────────────────────────────────────

  ensureTemplate(startTemplateId)
  ensureTemplate(objectiveTemplateId)
  ensureTemplate(exitTemplateId)
  mainConnectorTemplateIds.forEach((id) => ensureTemplate(id))

  placeRoom('room-start', startTemplateId, { gx: 0, gz: 0 })

  const mainConnectorRooms: PlacedRoom[] = []
  for (let i = 1; i <= mainConnectorCount; i += 1) {
    const roomId = `room-main-connector-${padIndex(i)}`
    const room = placeRoom(
      roomId,
      mainConnectorTemplateIds[i - 1],
      { gx: i, gz: 0 },
    )
    connections.push(
      makeConnection(
        i === 1 ? 'room-start' : `room-main-connector-${padIndex(i - 1)}`,
        'east',
        roomId,
      ),
    )
    mainConnectorRooms.push(room)
  }

  const objectiveGx = mainConnectorCount + 1
  placeRoom('room-objective', objectiveTemplateId, { gx: objectiveGx, gz: 0 })
  connections.push(
    makeConnection(
      mainConnectorCount === 0
        ? 'room-start'
        : `room-main-connector-${padIndex(mainConnectorCount)}`,
      'east',
      'room-objective',
    ),
  )

  const exitGx = objectiveGx + 1
  placeRoom('room-exit', exitTemplateId, { gx: exitGx, gz: 0 })
  connections.push(makeConnection('room-objective', 'east', 'room-exit'))

  // ── Branches ───────────────────────────────────────────────────────────────

  const BRANCH_DIRECTIONS: Direction[] = ['north', 'south']

  // Track which directions each room has already committed so we can check
  // before the graph is finalized.
  const usedDirections = new Map<string, Set<Direction>>()
  function reserveDirection(roomId: string, dir: Direction): void {
    if (!usedDirections.has(roomId)) usedDirections.set(roomId, new Set())
    usedDirections.get(roomId)!.add(dir)
  }
  // Mark main-path connections.
  for (const conn of connections) {
    reserveDirection(conn.fromRoomId, conn.fromDirection)
    reserveDirection(conn.toRoomId, conn.toDirection)
  }

  const eligibleParents = rng.shuffle([...mainConnectorRooms])
  let branchesPlaced = 0

  for (const parent of eligibleParents) {
    if (branchesPlaced >= branchCount) break

    const parentCoord = coordByRoomId.get(parent.id)!
    const usedByParent = usedDirections.get(parent.id) ?? new Set()

    // Find a free branch direction for this parent.
    const availableDirections = rng.shuffle(
      BRANCH_DIRECTIONS.filter((d) => !usedByParent.has(d)),
    )
    if (availableDirections.length === 0) continue

    const branchDir = availableDirections[0]
    const branchLength = rng.int(1, maxBranchLength)

    let currentParentId = parent.id
    let currentCoord = parentCoord
    let currentDir = branchDir
    let placedInBranch = 0

    for (let depth = 1; depth <= branchLength; depth += 1) {
      const nextCoord = stepCoord(currentCoord, currentDir)

      // Collision check — skip entire branch if first step is blocked.
      if (occupiedGrid.has(gridKey(nextCoord))) {
        if (depth === 1) break
        break
      }

      const branchRoomId = `room-branch-${padIndex(branchesPlaced + 1)}-${padIndex(depth)}`
      const branchTemplateId = rng.pick(BRANCH_ROOM_TEMPLATE_IDS)

      placeRoom(branchRoomId, branchTemplateId, nextCoord)

      const conn = makeConnection(currentParentId, currentDir, branchRoomId)
      connections.push(conn)
      reserveDirection(conn.fromRoomId, conn.fromDirection)
      reserveDirection(conn.toRoomId, conn.toDirection)

      currentParentId = branchRoomId
      currentCoord = nextCoord
      // Continue deeper in the same direction.
      currentDir = branchDir
      placedInBranch += 1
    }

    if (placedInBranch > 0) branchesPlaced += 1
  }

  // ── Build map ──────────────────────────────────────────────────────────────

  const map: MapDefinition = {
    id: `branching-map-${seed}-mp${mainPathRoomCount}-b${branchCount}-bl${maxBranchLength}`,
    templates,
    rooms,
    connections,
  }

  assertValidMapDefinition(map)

  if (import.meta.env.DEV) {
    console.info(
      `[branching-map] seed=${seed}, mainPath=${mainPathRoomCount}, branches=${branchesPlaced}/${branchCount}, maxBranchLen=${maxBranchLength}`,
    )
    const layoutLines = map.rooms.map((r) => {
      const tpl = map.templates[r.templateId]
      const coord = coordByRoomId.get(r.id)
      const coordStr = coord ? `(${coord.gx},${coord.gz})` : '(?)'
      return `  ${r.id.padEnd(36)} ${r.templateId.padEnd(26)} grid=${coordStr} world=(${r.worldPosition[0].toFixed(0)}, ${r.worldPosition[2].toFixed(0)})`
    })
    console.info('[branching-map] layout:\n' + layoutLines.join('\n'))
    console.info('[room-graph]\n' + describeRoomGraph(buildRoomGraph(map)))
  }

  return map
}
