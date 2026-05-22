/**
 * Dev playground layout constants.
 * Interactable definitions: `features/interaction/interactableRegistry.ts`.
 */
export const PROTOTYPE_SCENE_CONFIG = {
  floor: {
    size: 12,
    halfExtent: 6,
  },
  gate: {
    id: 'echo-gate',
    position: [0, 0.75, -4] as const,
    size: [2.5, 1.5, 0.25] as const,
    colliderRadius: 1.3,
    unlocksWhen: 'gate-orb' as const,
  },
} as const
