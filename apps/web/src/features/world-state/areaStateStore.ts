import { create } from 'zustand'

type AreaState = {
  isPrototypeAreaComplete: boolean
  setPrototypeAreaComplete: (complete: boolean) => void
}

export const useAreaStateStore = create<AreaState>((set) => ({
  isPrototypeAreaComplete: false,
  setPrototypeAreaComplete: (complete) =>
    set({ isPrototypeAreaComplete: complete }),
}))
