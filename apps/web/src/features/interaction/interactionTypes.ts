export type InteractionId = string

export type Interactable = {
  id: InteractionId
  label: string
  position: [number, number, number]
  radius: number
  onInteract: () => void
}
