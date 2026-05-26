export const PLAYER_AURA_CONFIG = {
  coreLight: {
    baseIntensity: 3.0,
    baseDistance: 5.2,
    decay: 1.45,
    color: '#ffd2ad',
  },

  fillLight: {
    baseIntensity: 0.9,
    baseDistance: 8.0,
    decay: 1.75,
    color: '#ff6abd',
  },

  flicker: {
    enabled: true,

    slowWaveSpeed: 1.2,
    mediumWaveSpeed: 3.4,
    fastWaveSpeed: 8.7,

    surgeChancePerSecond: 0.12,
    surgeDurationMin: 0.9,
    surgeDurationMax: 1.8,

    normalDistanceMultiplierMin: 0.82,
    normalDistanceMultiplierMax: 1.18,

    surgeDistanceMultiplierMin: 1.45,
    surgeDistanceMultiplierMax: 2.15,

    intensityMultiplierMin: 0.82,
    intensityMultiplierMax: 1.28,

    smoothing: 4.8,
  },
} as const
