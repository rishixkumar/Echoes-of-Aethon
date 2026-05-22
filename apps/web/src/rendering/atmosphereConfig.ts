export const ATMOSPHERE_CONFIG = {
  background: '#09030f',
  fog: {
    color: '#180817',
    near: 4,
    far: 16,
  },
  ambientLight: {
    intensity: 0.7,
  },
  hemisphereLight: {
    skyColor: '#9b3f7a',
    groundColor: '#2a1020',
    intensity: 2.2,
  },
  moonLight: {
    color: '#ff9bd6',
    intensity: 0.65,
    position: [4, 8, 2] as const,
  },
} as const
