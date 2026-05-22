import type { DoorwayDefinition, PlacedRoom, RoomTemplate } from './mapTypes'

/** Outer X of an east/west wall skin in world space (room-local alignment, no rotation yet). */
export function getOuterWallX(
  room: PlacedRoom,
  template: RoomTemplate,
  direction: 'east' | 'west',
): number {
  const halfW = template.width / 2
  const t = template.wallThickness
  const [cx] = room.worldPosition
  return direction === 'east' ? cx + halfW + t / 2 : cx - halfW - t / 2
}

/** Outer Z of a north/south wall skin in world space. */
export function getOuterWallZ(
  room: PlacedRoom,
  template: RoomTemplate,
  direction: 'north' | 'south',
): number {
  const halfD = template.depth / 2
  const t = template.wallThickness
  const [, , cz] = room.worldPosition
  return direction === 'north' ? cz - halfD - t / 2 : cz + halfD + t / 2
}

/**
 * Gate box center in **room-local** space, flush with the inner face of the doorway wall slab.
 */
export function getDoorwayGatePosition(
  template: RoomTemplate,
  doorway: DoorwayDefinition,
  gateDepth: number,
  gateCenterY = 1.2,
): [number, number, number] {
  const halfW = template.width / 2
  const halfD = template.depth / 2
  const t = template.wallThickness

  switch (doorway.direction) {
    case 'north':
      return [0, gateCenterY, -halfD + t / 2 + gateDepth / 2]
    case 'south':
      return [0, gateCenterY, halfD - t / 2 - gateDepth / 2]
    case 'east':
      return [halfW - t / 2 - gateDepth / 2, gateCenterY, 0]
    case 'west':
      return [-halfW + t / 2 + gateDepth / 2, gateCenterY, 0]
    default:
      return [0, gateCenterY, 0]
  }
}
