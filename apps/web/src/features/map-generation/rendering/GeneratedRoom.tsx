import { getEffectiveDoorwaysForRoom } from '../data/mapConnections'
import { buildWallSlabsForRoom } from '../geometry/mapRoomWallSlabs'
import type { DoorwayDefinition, MapDefinition, PlacedRoom, RoomTemplate } from '../data/mapTypes'
import { GeneratedDoorway } from './GeneratedDoorway'
import { localToWorldPosition } from '../geometry/mapObjectPlacement'

export type GeneratedRoomProps = Readonly<{
  map: MapDefinition
  room: PlacedRoom
  template: RoomTemplate
}>

/**
 * Data-driven room shell: floor + connection-aware walls + doorway trim.
 */
export function GeneratedRoom({ map, room, template }: GeneratedRoomProps) {
  const doorways = getEffectiveDoorwaysForRoom(map, room, template)
  const slabs = buildWallSlabsForRoom({ template, doorways })
  const [fx, fy, fz] = localToWorldPosition([0, 0, 0], room)

  return (
    <group name={`generated-room-${room.id}`}>
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[fx, fy, fz]}
      >
        <planeGeometry args={[template.width, template.depth]} />
        <meshStandardMaterial color={template.floorColor} roughness={0.75} />
      </mesh>

      {slabs.map(({ key, position, args }) => {
        const [px, py, pz] = localToWorldPosition(
          [position[0], position[1], position[2]],
          room,
        )
        return (
          <mesh key={key} castShadow receiveShadow position={[px, py, pz]}>
            <boxGeometry args={[...args]} />
            <meshStandardMaterial color={template.wallColor} roughness={0.7} />
          </mesh>
        )
      })}

      {doorways.map((doorway: DoorwayDefinition) => (
        <GeneratedDoorway
          key={doorway.id}
          room={room}
          template={template}
          doorway={doorway}
        />
      ))}
    </group>
  )
}
