import type { Direction, DoorwayDefinition } from '../data/mapTypes'

export function getDoorwayForDirection(
  doorways: readonly DoorwayDefinition[],
  direction: Direction,
) {
  return doorways.find((d) => d.direction === direction)
}
