import { GROUND_FOG_CONFIG } from './groundFogConfig'

/**
 * Floor-level mist — `MIST_DEBUG` exaggerates particles for tuning; ship uses dense subtle wisps.
 */
export const MIST_DEBUG = false

export const MIST_PARTICLE_CONFIG = {
  debug: MIST_DEBUG,

  count: MIST_DEBUG ? 1800 : 4500,

  height: {
    min: MIST_DEBUG ? 0.08 : 0.08,
    max: MIST_DEBUG ? 0.85 : 0.9,
  },

  size: {
    min: MIST_DEBUG ? 7 : 3,
    max: MIST_DEBUG ? 18 : 9,
  },

  alpha: {
    base: MIST_DEBUG ? 0.18 : 0.08,
    min: 0.02,
    max: MIST_DEBUG ? 0.28 : 0.12,
  },

  color: {
    near: MIST_DEBUG ? '#bda2ff' : '#9b7bc2',
    far: MIST_DEBUG ? '#6b527f' : '#4c315f',
  },

  wind: {
    speed: 0.35,
    strength: 0.12,
  },

  playerClear: {
    radius: MIST_DEBUG ? 2.4 : GROUND_FOG_CONFIG.playerClear.radius,
    softness: MIST_DEBUG ? 1.4 : GROUND_FOG_CONFIG.playerClear.softness,
  },

  lanternClear: {
    radius: GROUND_FOG_CONFIG.lanternClear.radius,
    softness: GROUND_FOG_CONFIG.lanternClear.softness,
  },

  mapPadding: 8,
} as const

export function getMistHudLines(): string[] {
  const c = MIST_PARTICLE_CONFIG
  const g = GROUND_FOG_CONFIG
  return [
    'Mist: on',
    `Ground fog: ${g.debug.showGroundFog ? 'on' : 'off'}`,
    `Particles: ${g.debug.showParticles ? 'on' : 'off'}`,
    `High visibility: ${g.debug.forceHighVisibility ? 'on' : 'off'}`,
    `Mist count: ${c.count}`,
    `Mist alpha: ${c.alpha.base.toFixed(2)}`,
    `Mist debug: ${c.debug ? 'true' : 'false'}`,
  ]
}
