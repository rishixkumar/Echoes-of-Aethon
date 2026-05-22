import { create } from 'zustand'

export type PlayerPosition = readonly [number, number, number]

type PlayerState = {
  playerPosition: PlayerPosition
  setPlayerPosition: (position: PlayerPosition) => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  playerPosition: [0, 0, 0],
  setPlayerPosition: (playerPosition) => set({ playerPosition }),
}))
