export const CLOUD_FOG_CONFIG = {
  enabled: true,

  seed: 12,

  bounds: {
    xPadding: 14,
    zPadding: 14,
  },

  layers: [
    {
      id: 'ground-heavy',
      positionY: 0.35,
      volume: 26,
      opacity: 0.42,
      speed: 0.08,
      growth: 3.8,
      segments: 48,
      color: '#9a3f73',
      boundsHeight: 1.4,
    },
    {
      id: 'mid-soft',
      positionY: 1.05,
      volume: 18,
      opacity: 0.22,
      speed: 0.045,
      growth: 3.2,
      segments: 36,
      color: '#6e345f',
      boundsHeight: 2.2,
    },
    {
      id: 'distant-haze',
      positionY: 1.7,
      volume: 14,
      opacity: 0.12,
      speed: 0.025,
      growth: 2.8,
      segments: 32,
      color: '#4a2446',
      boundsHeight: 3.2,
    },
  ],
} as const
