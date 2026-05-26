import { create } from 'zustand'

export type AppScreen = 'main-menu' | 'playing' | 'paused' | 'credits'

type AppShellState = {
  screen: AppScreen
  startGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  showCredits: () => void
  backToMenu: () => void
}

export const useAppShellStore = create<AppShellState>((set, get) => ({
  screen: 'main-menu',

  startGame: () => set({ screen: 'playing' }),

  pauseGame: () => {
    if (get().screen === 'playing') set({ screen: 'paused' })
  },

  resumeGame: () => {
    if (get().screen === 'paused') set({ screen: 'playing' })
  },

  showCredits: () => set({ screen: 'credits' }),

  backToMenu: () => set({ screen: 'main-menu' }),
}))
