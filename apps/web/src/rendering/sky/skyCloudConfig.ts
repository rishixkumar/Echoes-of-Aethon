export const SKY_CLOUD_CONFIG = {
  enabled: true,

  seed: 'sky-clouds-v2-dense-360',

  mapPadding: 120,

  layers: [
    {
      id: 'far-horizon-clouds',
      y: 18,
      count: 70,
      radiusMin: 80,
      radiusMax: 160,
      width: [28, 70] as const,
      depth: [8, 22] as const,
      alpha: [0.025, 0.065] as const,
      color: '#271025',
      speed: 0.003,
    },
    {
      id: 'mid-sky-clouds',
      y: 13,
      count: 55,
      radiusMin: 55,
      radiusMax: 120,
      width: [24, 58] as const,
      depth: [7, 18] as const,
      alpha: [0.035, 0.085] as const,
      color: '#3b1736',
      speed: 0.006,
    },
    {
      id: 'near-large-clouds',
      y: 8.5,
      count: 28,
      radiusMin: 35,
      radiusMax: 85,
      width: [36, 95] as const,
      depth: [10, 28] as const,
      alpha: [0.04, 0.095] as const,
      color: '#4f2249',
      speed: 0.009,
    },
  ],
} as const
