import { GROUND_FOG_CONFIG } from './groundFogConfig'
import { ROLLING_FOG_BANDS_CONFIG } from './rollingFogBandsConfig'
import { VOLUMETRIC_FOG_CONFIG } from './volumetricFogConfig'

/**
 * Floor-level mist — `MIST_DEBUG` exaggerates particles for tuning; ship uses dense grain wisps.
 */
export const MIST_DEBUG = false

export const MIST_PARTICLE_CONFIG = {
  debug: MIST_DEBUG,

  count: MIST_DEBUG ? 1800 : 18000,

  height: {
    min: MIST_DEBUG ? 0.08 : 0.1,
    max: MIST_DEBUG ? 0.85 : 2.4,
  },

  size: {
    min: MIST_DEBUG ? 7 : 0.8,
    max: MIST_DEBUG ? 18 : 2.2,
  },

  alpha: {
    base: MIST_DEBUG ? 0.18 : 0.003,
    min: 0.001,
    max: MIST_DEBUG ? 0.28 : 0.007,
  },

  color: {
    near: MIST_DEBUG ? '#bda2ff' : '#4a1e40',
    far: MIST_DEBUG ? '#6b527f' : '#1c0c18',
  },

  wind: {
    speed: MIST_DEBUG ? 0.35 : 0.09,
    strength: MIST_DEBUG ? 0.12 : 0.28,
  },

  playerClear: {
    radius: MIST_DEBUG ? 2.4 : 1.2,
    softness: MIST_DEBUG ? 1.4 : 3.0,
    minimumFogNearPlayer: MIST_DEBUG ? 0.2 : 0.55,
  },

  lanternClear: {
    radius: MIST_DEBUG ? 1.8 : 0.95,
    softness: MIST_DEBUG ? 1.2 : 2.2,
  },

  mapPadding: 10,
} as const

export function getMistHudLines(): string[] {
  const c = MIST_PARTICLE_CONFIG
  const g = GROUND_FOG_CONFIG
  const v = VOLUMETRIC_FOG_CONFIG
  const r = ROLLING_FOG_BANDS_CONFIG
  return [
    'Mist: on',
    `Ground fog: ${g.debug.showGroundFog ? 'on' : 'off'} (${g.layers.length} layers)`,
    `Rolling bands: ${r.debug.showRollingBands ? 'on' : 'off'} (${r.count})`,
    `Curtains: ${v.debug.showFogCurtains ? 'on' : 'off'} (${v.count})`,
    `Particles: ${g.debug.showParticles ? 'on' : 'off'} (${c.count})`,
    `Mist alpha: ${c.alpha.base.toFixed(4)}`,
    `Mist debug: ${c.debug ? 'true' : 'false'}`,
  ]
}
