import { create } from 'zustand'

export type WorldState = {
  activatedInteractables: Record<string, boolean>
  activateInteractable: (id: string) => void
  deactivateInteractable: (id: string) => void
  toggleInteractable: (id: string) => void
  isInteractableActivated: (id: string) => boolean
}

export const useWorldStateStore = create<WorldState>((set, get) => ({
  activatedInteractables: {},

  activateInteractable: (id) =>
    set((s) => ({
      activatedInteractables: { ...s.activatedInteractables, [id]: true },
    })),

  deactivateInteractable: (id) =>
    set((s) => ({
      activatedInteractables: { ...s.activatedInteractables, [id]: false },
    })),

  toggleInteractable: (id) =>
    set((s) => {
      const cur = Boolean(s.activatedInteractables[id])
      return {
        activatedInteractables: { ...s.activatedInteractables, [id]: !cur },
      }
    }),

  isInteractableActivated: (id) => Boolean(get().activatedInteractables[id]),
}))
