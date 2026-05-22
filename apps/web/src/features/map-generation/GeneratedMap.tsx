import type { MapDefinition } from './mapTypes'
import { GeneratedConnectionBridge } from './GeneratedConnectionBridge'
import { GeneratedRoom } from './GeneratedRoom'
import { buildConnectionCorridors } from './mapRoomConnectors'

export type GeneratedMapProps = Readonly<{
  map: MapDefinition
}>

export function GeneratedMap({ map }: GeneratedMapProps) {
  const corridors = buildConnectionCorridors(map)

  return (
    <>
      {map.rooms.map((room) => {
        const template = map.templates[room.templateId]
        if (!template) {
          console.warn(`Missing template "${room.templateId}" for room "${room.id}"`)
          return null
        }
        return (
          <GeneratedRoom
            key={room.id}
            map={map}
            room={room}
            template={template}
          />
        )
      })}
      {corridors.map((corridor) => (
        <GeneratedConnectionBridge key={corridor.id} corridor={corridor} />
      ))}
    </>
  )
}
