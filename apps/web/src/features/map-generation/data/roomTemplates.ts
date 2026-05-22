import type { RoomTemplate } from './mapTypes'
import { MAP_CONFIG } from './mapConfig'
import { getDoorwayGatePosition } from '../geometry/mapDoorwayPlacement'

const wallH = MAP_CONFIG.wall.defaultHeight
const t = MAP_CONFIG.wall.defaultThickness
const ov = MAP_CONFIG.wall.visualOverlap
const gateW = MAP_CONFIG.doorway.defaultWidth
const gateH = 2.2
const gateD = MAP_CONFIG.wall.defaultThickness

const roomShell: Pick<
  RoomTemplate,
  'wallHeight' | 'wallThickness' | 'visualOverlap' | 'wallColor' | 'floorColor'
> = {
  wallHeight: wallH,
  wallThickness: t,
  visualOverlap: ov,
  wallColor: '#1b1020',
  floorColor: '#211020',
}

const northExitDoorway = {
  id: 'objective-north-exit',
  direction: 'north' as const,
  width: gateW,
  isLocked: true,
  gateId: 'prototype-gate',
}

const legacyObjectiveShell: RoomTemplate = {
  id: 'prototype-objective-room',
  kind: 'objective',
  width: MAP_CONFIG.room.defaultWidth,
  depth: MAP_CONFIG.room.defaultDepth,
  ...roomShell,
  doorways: [northExitDoorway],
  objects: [],
}

const gateLocalPos = getDoorwayGatePosition(
  legacyObjectiveShell,
  northExitDoorway,
  gateD,
  1.2,
)

/**
 * Room shape templates. Doorway **openings** come from `MapDefinition.connections`;
 * explicit `doorways` here only override width / lock / gate (e.g. legacy north exit).
 */
export const ROOM_TEMPLATES = {
  'start-room-basic': {
    id: 'start-room-basic',
    kind: 'start',
    width: 14,
    depth: 18,
    ...roomShell,
    doorways: [],
    objects: [
      {
        id: 'regular-echo-orb',
        type: 'echo-orb',
        position: [2.5, 0.45, -2.5],
      },
    ],
    playerStart: [0, 0, 4],
  },
  'small-connector-room': {
    id: 'small-connector-room',
    kind: 'connector',
    width: 10,
    depth: 10,
    ...roomShell,
    doorways: [],
    objects: [],
  },
  'wide-connector-room': {
    id: 'wide-connector-room',
    kind: 'connector',
    width: 16,
    depth: 12,
    ...roomShell,
    doorways: [],
    objects: [],
  },
  'long-hall-room': {
    id: 'long-hall-room',
    kind: 'connector',
    width: 18,
    depth: 8,
    ...roomShell,
    doorways: [],
    objects: [],
  },
  'objective-room-a': {
    id: 'objective-room-a',
    kind: 'objective',
    width: 14,
    depth: 18,
    ...roomShell,
    doorways: [],
    objects: [
      {
        id: 'ancient-echo-orb',
        type: 'objective-orb',
        position: [3.8, 0.45, -4.2],
      },
    ],
  },
  'objective-room-b': {
    id: 'objective-room-b',
    kind: 'objective',
    width: 18,
    depth: 14,
    ...roomShell,
    doorways: [],
    objects: [
      {
        id: 'ancient-echo-orb',
        type: 'objective-orb',
        position: [-4, 0.45, 3],
      },
    ],
  },
  'exit-room-basic': {
    id: 'exit-room-basic',
    kind: 'exit',
    width: 12,
    depth: 12,
    ...roomShell,
    doorways: [],
    objects: [
      {
        id: 'prototype-exit-zone',
        type: 'exit-zone',
        position: [0, 0.02, 0],
        size: [3.5, 0.05, 1.2],
      },
    ],
  },
  'prototype-start-room': {
    id: 'prototype-start-room',
    kind: 'start',
    width: 14,
    depth: 18,
    ...roomShell,
    doorways: [],
    objects: [],
    playerStart: [0, 0, 4],
  },
  'prototype-connector-room': {
    id: 'prototype-connector-room',
    kind: 'connector',
    width: 12,
    depth: 12,
    ...roomShell,
    doorways: [],
    objects: [],
  },
  'prototype-objective-room': {
    id: 'prototype-objective-room',
    kind: 'objective',
    width: MAP_CONFIG.room.defaultWidth,
    depth: MAP_CONFIG.room.defaultDepth,
    ...roomShell,
    doorways: [northExitDoorway],
    objects: [
      {
        id: 'ancient-echo-orb',
        type: 'objective-orb',
        position: [3.8, 0.45, -4.2],
      },
      {
        id: 'prototype-gate',
        type: 'gate',
        position: gateLocalPos,
        size: [gateW, gateH, gateD],
      },
      {
        id: 'prototype-exit-zone',
        type: 'exit-zone',
        position: [0, 0.02, -10.4],
        size: [3.5, 0.05, 1.2],
      },
    ],
  },
} as const satisfies Record<string, RoomTemplate>

export const START_ROOM_TEMPLATE_IDS = ['start-room-basic'] as const

export const CONNECTOR_ROOM_TEMPLATE_IDS = [
  'small-connector-room',
  'wide-connector-room',
  'long-hall-room',
] as const

export const OBJECTIVE_ROOM_TEMPLATE_IDS = [
  'objective-room-a',
  'objective-room-b',
] as const

export const EXIT_ROOM_TEMPLATE_IDS = ['exit-room-basic'] as const

/** Branch rooms reuse connector templates for now. */
export const BRANCH_ROOM_TEMPLATE_IDS = [
  'small-connector-room',
  'wide-connector-room',
  'long-hall-room',
] as const

// TODO: When templates repeat, namespace object IDs by placed room id.
