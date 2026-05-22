import { INTERACTABLES } from './interactableRegistry'
import { TestInteractable } from './TestInteractable'

/**
 * Instantiates every entry in {@link INTERACTABLES} as a scene interactable.
 */
export function InteractableRenderer() {
  return (
    <>
      {INTERACTABLES.map((item) => (
        <TestInteractable
          key={item.id}
          id={item.id}
          label={item.label}
          role={item.role}
          position={[item.position[0], item.position[1], item.position[2]]}
          radius={item.radius}
        />
      ))}
    </>
  )
}
