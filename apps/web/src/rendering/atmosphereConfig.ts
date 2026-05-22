export const ATMOSPHERE_CONFIG = {
  background: '#07020c',
  fog: {
    color: '#140614',
    near: 2.8,
    far: 42,
  },
  ambientLight: {
    intensity: 0.48,
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
