/**
 * Floor-level mist — staged tuning.
 * Flip `MIST_DEBUG` to `false` for subtle ship values (Step 10) after visibility is proven.
 */
export const MIST_DEBUG = true

export const MIST_PARTICLE_CONFIG = {
  debug: MIST_DEBUG,

  count: MIST_DEBUG ? 1800 : 2500,

  height: {
    min: MIST_DEBUG ? 0.08 : 0.05,
    max: MIST_DEBUG ? 0.85 : 0.65,
  },

  size: {
    min: MIST_DEBUG ? 7 : 5,
    max: MIST_DEBUG ? 18 : 13,
  },

  alpha: {
    base: MIST_DEBUG ? 0.18 : 0.07,
    min: 0.02,
    max: MIST_DEBUG ? 0.28 : 0.12,
  },

  color: {
    near: MIST_DEBUG ? '#bda2ff' : '#8f76b8',
    far: MIST_DEBUG ? '#6b527f' : '#4c3a5f',
  },

  wind: {
    speed: 0.35,
    strength: 0.12,
  },

  playerClear: {
    radius: MIST_DEBUG ? 2.4 : 2.2,
    softness: MIST_DEBUG ? 1.4 : 1.6,
  },

  mapPadding: 8,
} as const

export function getMistHudLines(): string[] {
  const c = MIST_PARTICLE_CONFIG
  return [
    'Mist: on',
    `Mist count: ${c.count}`,
    `Mist alpha: ${c.alpha.base.toFixed(2)}`,
    `Mist debug: ${c.debug ? 'true' : 'false'}`,
  ]
}
