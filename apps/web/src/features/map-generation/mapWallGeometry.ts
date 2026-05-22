/**
 * Shared axis-aligned wall slab math for {@link GeneratedRoom} and future {@link mapCollision}.
 * North = −Z, south = +Z, east = +X, west = −X.
 */

export type WallSlab = {
  position: readonly [number, number, number]
  args: readonly [number, number, number]
}

export function wallFromBounds(
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number,
  height: number,
): WallSlab {
  const sx = maxX - minX
  const sy = height
  const sz = maxZ - minZ
  return {
    position: [(minX + maxX) / 2, height / 2, (minZ + maxZ) / 2],
    args: [sx, sy, sz],
  }
}
