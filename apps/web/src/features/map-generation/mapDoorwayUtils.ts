import type { Direction, DoorwayDefinition } from './mapTypes'

export function getDoorwayForDirection(
  doorways: readonly DoorwayDefinition[],
  direction: Direction,
) {
  return doorways.find((d) => d.direction === direction)
}
