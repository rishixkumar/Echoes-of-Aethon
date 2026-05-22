export type SeededRandom = {
  readonly seed: string
  next: () => number
  range: (min: number, max: number) => number
  int: (min: number, maxInclusive: number) => number
  bool: (probability?: number) => boolean
  pick: <T>(items: readonly T[]) => T
  shuffle: <T>(items: readonly T[]) => T[]
}

function hashStringToUint32(seed: string): number {
  let hash = 2166136261

  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0

  return function next() {
    state += 0x6d2b79f5

    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createSeededRandom(seed: string): SeededRandom {
  const nextRaw = mulberry32(hashStringToUint32(seed))

  return {
    seed,

    next: () => nextRaw(),

    range: (min, max) => min + (max - min) * nextRaw(),

    int: (min, maxInclusive) =>
      Math.floor(min + nextRaw() * (maxInclusive - min + 1)),

    bool: (probability = 0.5) => nextRaw() < probability,

    pick: (items) => {
      if (items.length === 0) {
        throw new Error('Cannot pick from an empty array.')
      }

      return items[Math.floor(nextRaw() * items.length)]
    },

    shuffle: (items) => {
      const result = [...items]

      for (let i = result.length - 1; i > 0; i -= 1) {
        const j = Math.floor(nextRaw() * (i + 1))
        const current = result[i]
        result[i] = result[j]
        result[j] = current
      }

      return result
    },
  }
}

export function assertSeededRandomDeterminism(): void {
  const a = createSeededRandom('test-seed-001')
  const b = createSeededRandom('test-seed-001')

  const aValues = [a.next(), a.next(), a.next(), a.int(1, 10), a.bool()]
  const bValues = [b.next(), b.next(), b.next(), b.int(1, 10), b.bool()]

  if (JSON.stringify(aValues) !== JSON.stringify(bValues)) {
    throw new Error('Seeded random determinism test failed.')
  }
}
