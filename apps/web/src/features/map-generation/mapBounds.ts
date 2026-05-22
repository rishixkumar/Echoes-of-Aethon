import type { MapDefinition } from './mapTypes'

export type MapBounds = {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

/** Axis-aligned playable footprint for all placed rooms (includes wall thickness on outer skins). */
export function getMapBounds(map: MapDefinition): MapBounds {
  let minX = Infinity
  let maxX = -Infinity
  let minZ = Infinity
  let maxZ = -Infinity

  for (const room of map.rooms) {
    const template = map.templates[room.templateId]
    if (!template) continue
    const [cx, , cz] = room.worldPosition
    const halfW = template.width / 2
    const halfD = template.depth / 2
    const skin = template.wallThickness / 2
    minX = Math.min(minX, cx - halfW - skin)
    maxX = Math.max(maxX, cx + halfW + skin)
    minZ = Math.min(minZ, cz - halfD - skin)
    maxZ = Math.max(maxZ, cz + halfD + skin)
  }

  return { minX, maxX, minZ, maxZ }
}
