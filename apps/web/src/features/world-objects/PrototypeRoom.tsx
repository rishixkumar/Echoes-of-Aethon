import { FIXED_PROTOTYPE_MAP } from '../map-generation/mapSceneUtils'
import { GeneratedRoom } from '../map-generation/GeneratedRoom'

const placedRoom = FIXED_PROTOTYPE_MAP.rooms[0]
const startTemplate = FIXED_PROTOTYPE_MAP.templates[placedRoom.templateId]

/**
 * @deprecated Prefer `<GeneratedMap map={FIXED_PROTOTYPE_MAP} />` in scenes.
 */
export function PrototypeRoom() {
  return (
    <GeneratedRoom
      map={FIXED_PROTOTYPE_MAP}
      room={placedRoom}
      template={startTemplate}
    />
  )
}
