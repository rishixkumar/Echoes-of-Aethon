import type { DoorwayDefinition, PlacedRoom, RoomTemplate } from '../data/mapTypes'
import { localToWorldPosition } from '../geometry/mapObjectPlacement'

type GeneratedDoorwayProps = Readonly<{
  room: PlacedRoom
  template: RoomTemplate
  doorway: DoorwayDefinition
}>

/**
 * Semantic doorway volume / trim placeholder. Later: locks, connectors, transition volumes.
 */
export function GeneratedDoorway({
  room,
  template,
  doorway,
}: GeneratedDoorwayProps) {
  const halfW = template.width / 2
  const halfD = template.depth / 2
  const t = template.wallThickness

  let localCenter: [number, number, number]
  let size: [number, number, number]
  switch (doorway.direction) {
    case 'north':
      localCenter = [0, 0.04, -halfD + t * 0.35]
      size = [doorway.width * 0.98, 0.06, 0.14]
      break
    case 'south':
      localCenter = [0, 0.04, halfD - t * 0.35]
      size = [doorway.width * 0.98, 0.06, 0.14]
      break
    case 'west':
      localCenter = [-halfW + t * 0.35, 0.04, 0]
      size = [0.14, 0.06, doorway.width * 0.98]
      break
    case 'east':
      localCenter = [halfW - t * 0.35, 0.04, 0]
      size = [0.14, 0.06, doorway.width * 0.98]
      break
    default:
      return null
  }

  const pos = localToWorldPosition(localCenter, room)

  return (
    <mesh position={pos} name={`doorway-${doorway.id}`} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color="#3a4a62"
        emissive="#1e2838"
        emissiveIntensity={0.12}
        roughness={0.85}
        transparent
        opacity={0.35}
      />
    </mesh>
  )
}
