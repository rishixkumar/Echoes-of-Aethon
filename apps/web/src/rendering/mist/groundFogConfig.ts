export const GROUND_FOG_CONFIG = {
  enabled: true,

  layers: [
    {
      y: 0.035,
      alpha: 0.32,
      noiseScale: 7.5,
      noiseSpeed: 0.025,
      color: '#4a234f',
    },
    {
      y: 0.09,
      alpha: 0.24,
      noiseScale: 11,
      noiseSpeed: -0.018,
      color: '#6d3f78',
    },
    {
      y: 0.16,
      alpha: 0.16,
      noiseScale: 15,
      noiseSpeed: 0.014,
      color: '#9171aa',
    },
  ],

  playerClear: {
    radius: 1.7,
    softness: 2.4,
  },

  /** Slightly tighter pocket so the carried lantern reads as cutting haze. */
  lanternClear: {
    radius: 1.35,
    softness: 1.9,
  },

  edgeFade: 0.08,

  mapPadding: 8,

  debug: {
    showGroundFog: true,
    showParticles: true,
    forceHighVisibility: false,
  },
} as const
