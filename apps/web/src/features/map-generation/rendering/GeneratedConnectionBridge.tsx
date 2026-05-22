import type { ConnectionCorridor } from '../geometry/mapRoomConnectors'

type GeneratedConnectionBridgeProps = Readonly<{
  corridor: ConnectionCorridor
}>

/**
 * Floor + side barrier walls between connected rooms (full depth overlap).
 */
export function GeneratedConnectionBridge({
  corridor,
}: GeneratedConnectionBridgeProps) {
  const { floor, sideWalls, floorColor, wallColor } = corridor
  const width = floor.maxX - floor.minX
  const depth = floor.maxZ - floor.minZ
  const cx = (floor.minX + floor.maxX) / 2
  const cz = (floor.minZ + floor.maxZ) / 2

  return (
    <group name={corridor.id}>
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[cx, 0.015, cz]}
      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={floorColor} roughness={0.75} />
      </mesh>

      {sideWalls.map(({ key, position, args }) => (
        <mesh key={key} castShadow receiveShadow position={[...position]}>
          <boxGeometry args={[...args]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}
