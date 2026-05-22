export const INTERACTION_CONFIG = {
  key: 'e',
  worldPrompt: {
    /** Drei `<Html sprite />` scale vs camera distance (higher = smaller on screen). */
    distanceFactor: 10,
    /** Local Y offset above the interactable origin for the floating label. */
    yOffset: 1.6,
  },
} as const

export function isInteractKey(e: KeyboardEvent) {
  if (e.repeat) return false
  return e.key.toLowerCase() === INTERACTION_CONFIG.key
}
