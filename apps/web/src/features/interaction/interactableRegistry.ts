export const INTERACTABLES = [
  {
    id: 'test-orb',
    label: 'Ancient Echo Orb',
    position: [2, 0.5, 2],
    radius: 1.5,
    colliderRadius: 0.75,
  },
  {
    id: 'test-orb-2',
    label: 'Shard of Quiet',
    position: [-2, 0.5, -2],
    radius: 1.5,
    colliderRadius: 0.75,
  },
] as const

export type InteractableDefinition = (typeof INTERACTABLES)[number]

/** Among entries whose proximity radius contains the player on XZ, return the closest one. */
export function pickNearestInteractable(
  px: number,
  pz: number,
): InteractableDefinition | null {
  let best: InteractableDefinition | null = null
  let bestD = Infinity
  for (const item of INTERACTABLES) {
    const d = Math.hypot(px - item.position[0], pz - item.position[2])
    if (d <= item.radius && d < bestD) {
      best = item
      bestD = d
    }
  }
  return best
}

export function isNearAnyInteractable(px: number, pz: number) {
  return pickNearestInteractable(px, pz) !== null
}
