import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type PrefsState = {
  reducedMotion: boolean
  highContrast: boolean
  largeText: boolean

  setReducedMotion(v: boolean): void
  setHighContrast(v: boolean): void
  setLargeText(v: boolean): void
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      reducedMotion: false,
      highContrast: false,
      largeText: false,

      setReducedMotion: (v) => set({ reducedMotion: v }),
      setHighContrast: (v) => set({ highContrast: v }),
      setLargeText: (v) => set({ largeText: v }),
    }),
    { name: 'echoes-prefs' },
  ),
)

export function useSystemReducedMotion(): boolean {
  const query =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null

  const [matches, setMatches] = useState<boolean>(query?.matches ?? false)

  useEffect(() => {
    if (!query) return
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    query.addEventListener('change', handler)
    return () => query.removeEventListener('change', handler)
  }, [query])

  return matches
}

export function useEffectiveReducedMotion(): boolean {
  const userPref = usePrefsStore((s) => s.reducedMotion)
  const systemPref = useSystemReducedMotion()
  return userPref || systemPref
}
