export const GROUND_FOG_CONFIG = {
  enabled: true,

  debug: {
    showGroundFog: true,
    showParticles: true,
    forceHighVisibility: false,
  },

  /**
   * noiseScale drives world-space FBM sample size in the shader.
   * Values near 1.0 use the shader's fixed world-scale multipliers (0.055/0.13/0.31)
   * so config only needs a base multiplier.
   */
  layers: [
    {
      y: 0.035,
      alpha: 0.34,
      noiseScale: 1.0,
      noiseSpeed: 0.018,
      color: '#35122f',
    },
    {
      y: 0.12,
      alpha: 0.22,
      noiseScale: 1.0,
      noiseSpeed: -0.014,
      color: '#42183b',
    },
    {
      y: 0.28,
      alpha: 0.13,
      noiseScale: 1.0,
      noiseSpeed: 0.011,
      color: '#5a2850',
    },
  ],

  playerClear: {
    radius: 1.0,
    softness: 3.4,
    minimumFogNearPlayer: 0.82,
  },

  lanternClear: {
    radius: 0.8,
    softness: 1.8,
  },

  edgeFade: 0.04,

  mapPadding: 14,
} as const
