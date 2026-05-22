import { PROTOTYPE_ROOM_CONFIG } from '../../scenes/prototypeSceneConfig'

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

/** Objective / gate orb — only this id should unlock the Echo Gate for the prototype. */
export const GATE_ORB_ID = 'gate-orb' as const

const orbPos = PROTOTYPE_ROOM_CONFIG.objectiveOrb.position

export const INTERACTABLES: readonly InteractableDefinition[] = [
  {
    id: GATE_ORB_ID,
    label: 'Ancient Echo Orb',
    role: 'objective-orb',
    position: [orbPos[0], orbPos[1], orbPos[2]],
    radius: 1.5,
    colliderRadius: 0.75,
    completesObjectiveId: 'activate-ancient-echo-orb',
    unlocksObjectId: 'echo-gate',
  },
  {
    id: 'test-orb',
    label: 'Echo Orb',
    role: 'echo-orb',
    position: [4.5, 0.5, -3],
    radius: 1.5,
    colliderRadius: 0.75,
  },
]

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
