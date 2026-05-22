export const ATMOSPHERE_CONFIG = {
  background: '#07020c',

  fog: {
    color: '#180715',
    near: 4,
    far: 13,
  },

  /** Very subtle warm fill — prevents total blackness without illuminating fog. */
  worldFill: {
    position: [0, 2.5, 0] as const,
    intensity: 0.08,
    distance: 30,
    decay: 2.0,
    color: '#3a1830',
  },

  lights: {
    hemisphere: {
      intensity: 0.28,
      skyColor: '#18071d',
      groundColor: '#080209',
    },
    ambient: {
      intensity: 0.08,
    },
    main: {
      intensity: 0.55,
      color: '#c86fa8',
      position: [4, 8, 2] as const,
    },
    fill: {
      intensity: 0.22,
      color: '#5a3878',
      position: [-6, 5, -4] as const,
    },
  },
} as const
