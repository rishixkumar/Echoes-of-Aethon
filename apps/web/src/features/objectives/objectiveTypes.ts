export type ObjectiveId = string

export type ObjectiveDefinition = {
  id: ObjectiveId
  title: string
  /** Only activating this interactable id can complete the objective. */
  requiredInteractableId: string
}
