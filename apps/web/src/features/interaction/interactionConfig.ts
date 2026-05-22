export const INTERACTION_CONFIG = {
  key: 'e',
} as const

export function isInteractKey(e: KeyboardEvent) {
  if (e.repeat) return false
  return e.key.toLowerCase() === INTERACTION_CONFIG.key
}
