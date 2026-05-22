import type { RoomTemplate } from './mapTypes'
import { MAP_CONFIG } from './mapConfig'
import { getDoorwayGatePosition } from '../geometry/mapDoorwayPlacement'

const w = MAP_CONFIG.room.defaultWidth
const d = MAP_CONFIG.room.defaultDepth
const connectorSize = 12
const wallH = MAP_CONFIG.wall.defaultHeight
const t = MAP_CONFIG.wall.defaultThickness
const ov = MAP_CONFIG.wall.visualOverlap
const gateW = MAP_CONFIG.doorway.defaultWidth
const gateH = 2.2
const gateD = MAP_CONFIG.wall.defaultThickness

const northExitDoorway = {
  id: 'objective-north-exit',
  direction: 'north' as const,
  width: gateW,
  isLocked: true,
  gateId: 'prototype-gate',
}

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

const gateLocalPos = getDoorwayGatePosition(
  {
    id: 'prototype-objective-room',
    kind: 'objective',
    width: w,
    depth: d,
    doorways: [northExitDoorway],
    objects: [],
    ...roomShell,
  },
  northExitDoorway,
  gateD,
  1.2,
)

/**
 * Room shape templates. Doorway **openings** come from `MapDefinition.connections`;
 * explicit `doorways` here only override width / lock / gate (e.g. north exit).
 */
export const ROOM_TEMPLATES = {
  'prototype-start-room': {
    id: 'prototype-start-room',
    kind: 'start',
    width: w,
    depth: d,
    ...roomShell,
    doorways: [],
    objects: [],
    playerStart: [0, 0, 4],
  },
  'prototype-connector-room': {
    id: 'prototype-connector-room',
    kind: 'connector',
    width: connectorSize,
    depth: connectorSize,
    ...roomShell,
    doorways: [],
    objects: [],
  },
  'prototype-objective-room': {
    id: 'prototype-objective-room',
    kind: 'objective',
    width: w,
    depth: d,
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
