import { create } from 'zustand'

type ObjectiveState = {
  completedById: Record<string, boolean>
  completeObjective: (id: string) => void
  isObjectiveComplete: (id: string) => boolean
}

export const useObjectiveStore = create<ObjectiveState>((set, get) => ({
  completedById: {},

  completeObjective: (id) =>
    set((s) => {
      if (s.completedById[id]) return s
      return { completedById: { ...s.completedById, [id]: true } }
    }),

  isObjectiveComplete: (id) => Boolean(get().completedById[id]),
}))
