import type { PlacedRoom } from '../data/mapTypes'

/**
 * Room-local → world translation. Rotation on `PlacedRoom.rotationY` reserved for later maps.
 */
export function localToWorldPosition(
  local: readonly [number, number, number],
  room: PlacedRoom,
): [number, number, number] {
  const [lx, ly, lz] = local
  const [ox, oy, oz] = room.worldPosition
  return [lx + ox, ly + oy, lz + oz]
}
