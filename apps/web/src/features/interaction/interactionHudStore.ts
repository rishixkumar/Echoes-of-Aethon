import { create } from 'zustand'

/** DOM HUD copy driven by proximity to interactables (Iteration 2). */
type InteractionHudState = {
  interactionPrompt: string | null
  setInteractionPrompt: (prompt: string | null) => void
}

export const useInteractionHudStore = create<InteractionHudState>((set) => ({
  interactionPrompt: null,
  setInteractionPrompt: (interactionPrompt) => set({ interactionPrompt }),
}))
