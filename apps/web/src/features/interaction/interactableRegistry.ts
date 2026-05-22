import {
  FIXED_PROTOTYPE_MAP,
  findMapObject,
} from '../map-generation'

export type InteractableRole = 'objective-orb' | 'echo-orb' | 'lore-object'

export type InteractableDefinition = {
  id: string
  label: string
  role: InteractableRole
  position: readonly [number, number, number]
  radius: number
  colliderRadius: number
  /** When this objective-orb is activated, complete this objective id. */
  completesObjectiveId?: string
  /** World object id that should react (e.g. gate) when this orb activates. */
  unlocksObjectId?: string
}

/** Objective orb in the objective room — unlocks optional gate if present. */
export const GATE_ORB_ID = 'ancient-echo-orb' as const

const ancientOrb = findMapObject(
  FIXED_PROTOTYPE_MAP,
  (object) => object.id === GATE_ORB_ID,
)
const regularOrb = findMapObject(
  FIXED_PROTOTYPE_MAP,
  (object) => object.type === 'echo-orb',
)

if (!ancientOrb) {
  throw new Error('Generated map missing ancient-echo-orb')
}

const interactables: InteractableDefinition[] = [
  {
    id: GATE_ORB_ID,
    label: 'Ancient Echo Orb',
    role: 'objective-orb',
    position: ancientOrb.worldPosition,
    radius: 1.5,
    colliderRadius: 0.75,
    completesObjectiveId: 'activate-ancient-echo-orb',
    unlocksObjectId: 'prototype-gate',
  },
]

if (regularOrb) {
  interactables.push({
    id: regularOrb.object.id,
    label: 'Echo Orb',
    role: 'echo-orb',
    position: regularOrb.worldPosition,
    radius: 1.5,
    colliderRadius: 0.75,
  })
}

export const INTERACTABLES: readonly InteractableDefinition[] = interactables

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
