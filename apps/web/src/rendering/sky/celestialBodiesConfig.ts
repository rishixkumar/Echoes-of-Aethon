import { createSeededRandom } from '../../features/map-generation/data/seededRandom'

/** 30% larger than original prototype radii, spread in a loose spherical cluster. */
function buildMoonClusterItems(count: number) {
  const rng = createSeededRandom('celestial-moon-cluster-v2')
  const items: { offset: readonly [number, number, number]; radius: number }[] =
    []

  for (let i = 0; i < count; i += 1) {
    const theta = rng.range(0, Math.PI * 2)
    const phi = rng.range(0.12, Math.PI * 0.48)
    const spread = rng.range(2.2, 10.5)
    const yBias = rng.range(-1.3, 2.5)
    const baseR = rng.range(0.28, 1.05)
    items.push({
      offset: [
        Math.sin(phi) * Math.cos(theta) * spread,
        Math.cos(phi) * spread * 0.42 + yBias,
        Math.sin(phi) * Math.sin(theta) * spread,
      ] as const,
      radius: baseR * 1.3,
    })
  }

  return items
}

export const CELESTIAL_BODIES_CONFIG = {
  enabled: true,

  /** Billboard plane edge length; originals were 18 / 11 / 9 — kept at 5× for readability. */
  suns: [
    {
      id: 'hazy-sun-primary',
      angle: -0.75,
      radius: 130,
      y: 17,
      size: 90,
      alpha: 0.2,
      coreColor: '#ffc0d6',
      haloColor: '#8d315f',
      lightIntensity: 0.42,
    },
    {
      id: 'hazy-sun-secondary',
      angle: 1.1,
      radius: 155,
      y: 14,
      size: 55,
      alpha: 0.13,
      coreColor: '#eaa0c8',
      haloColor: '#6f2d62',
      lightIntensity: 0.22,
    },
    {
      id: 'hazy-sun-tertiary',
      angle: 2.85,
      radius: 145,
      y: 12,
      size: 45,
      alpha: 0.1,
      coreColor: '#ffd8b8',
      haloColor: '#7b365b',
      lightIntensity: 0.16,
    },
  ],

  saturn: {
    id: 'veiled-saturn',
    angle: -2.15,
    radius: 150,
    y: 16,
    planetRadius: 4.48,
    ringInnerRadius: 5.88,
    ringOuterRadius: 10.08,
    alpha: 0.2,
    color: '#8f668c',
    ringColor: '#b58cab',
    emissive: '#c9a0c4',
    emissiveIntensity: 1.35,
    ringEmissive: '#dcc4e8',
    ringEmissiveIntensity: 1.05,
    glowLightIntensity: 0.85,
    glowLightColor: '#d8b8e8',
  },

  moons: {
    id: 'moon-cluster',
    angle: 2.15,
    radius: 120,
    y: 13,
    alpha: 0.22,
    color: '#bda8c7',
    emissive: '#e8dcf5',
    emissiveIntensity: 1.6,
    glowLightIntensity: 0.95,
    glowLightColor: '#dcccf0',
    items: buildMoonClusterItems(28),
  },
} as const
