import type { DoorwayDefinition, RoomTemplate } from '../data/mapTypes'
import { getDoorwayForDirection } from './mapDoorwayUtils'
import { wallFromBounds } from './mapWallGeometry'

export type WallSlabWithKey = {
  key: string
  position: readonly [number, number, number]
  args: readonly [number, number, number]
}

/**
 * Bounds-based wall slabs in **room-local** space (origin room center on XZ, floor y = 0).
 * North = −Z, south = +Z, east = +X, west = −X. Uses outer-skin X joins for north splits.
 */
export function buildWallSlabsForRoom({
  template,
  doorways,
}: {
  template: RoomTemplate
  doorways: readonly DoorwayDefinition[]
}): WallSlabWithKey[] {
  const halfW = template.width / 2
  const halfD = template.depth / 2
  const t = template.wallThickness
  const ov = template.visualOverlap
  const h = template.wallHeight

  const outerXL = -halfW - t / 2
  const outerXR = halfW + t / 2

  const northDoor = getDoorwayForDirection(doorways, 'north')
  const southDoor = getDoorwayForDirection(doorways, 'south')
  const eastDoor = getDoorwayForDirection(doorways, 'east')
  const westDoor = getDoorwayForDirection(doorways, 'west')

  const slabs: WallSlabWithKey[] = []

  const southZ = halfD
  if (!southDoor) {
    slabs.push({
      key: 'south',
      ...wallFromBounds(
        -halfW - ov,
        halfW + ov,
        southZ - t / 2,
        southZ + t / 2,
        h,
      ),
    })
  } else {
    const dh = southDoor.width / 2
    slabs.push({
      key: 'south-left',
      ...wallFromBounds(
        -halfW - ov,
        -dh + ov,
        southZ - t / 2,
        southZ + t / 2,
        h,
      ),
    })
    slabs.push({
      key: 'south-right',
      ...wallFromBounds(
        dh - ov,
        halfW + ov,
        southZ - t / 2,
        southZ + t / 2,
        h,
      ),
    })
  }

  const northZ = -halfD
  if (!northDoor) {
    slabs.push({
      key: 'north',
      ...wallFromBounds(
        -halfW - ov,
        halfW + ov,
        northZ - t / 2,
        northZ + t / 2,
        h,
      ),
    })
  } else {
    const dh = northDoor.width / 2
    slabs.push({
      key: 'north-left',
      ...wallFromBounds(
        outerXL - ov,
        -dh + ov,
        northZ - t / 2,
        northZ + t / 2,
        h,
      ),
    })
    slabs.push({
      key: 'north-right',
      ...wallFromBounds(
        dh - ov,
        outerXR + ov,
        northZ - t / 2,
        northZ + t / 2,
        h,
      ),
    })
  }

  if (!westDoor) {
    slabs.push({
      key: 'west',
      ...wallFromBounds(
        outerXL,
        outerXL + t,
        -halfD - ov,
        halfD + ov,
        h,
      ),
    })
  } else {
    const dh = westDoor.width / 2
    slabs.push({
      key: 'west-south',
      ...wallFromBounds(
        outerXL,
        outerXL + t,
        -halfD - ov,
        -dh + ov,
        h,
      ),
    })
    slabs.push({
      key: 'west-north',
      ...wallFromBounds(
        outerXL,
        outerXL + t,
        dh - ov,
        halfD + ov,
        h,
      ),
    })
  }

  if (!eastDoor) {
    slabs.push({
      key: 'east',
      ...wallFromBounds(
        outerXR - t,
        outerXR,
        -halfD - ov,
        halfD + ov,
        h,
      ),
    })
  } else {
    const dh = eastDoor.width / 2
    slabs.push({
      key: 'east-south',
      ...wallFromBounds(
        outerXR - t,
        outerXR,
        -halfD - ov,
        -dh + ov,
        h,
      ),
    })
    slabs.push({
      key: 'east-north',
      ...wallFromBounds(
        outerXR - t,
        outerXR,
        dh - ov,
        halfD + ov,
        h,
      ),
    })
  }

  return slabs
}

/** @deprecated Use {@link buildWallSlabsForRoom} with effective doorways. */
export function buildWallSlabsForTemplate(template: RoomTemplate): WallSlabWithKey[] {
  return buildWallSlabsForRoom({ template, doorways: template.doorways })
}
