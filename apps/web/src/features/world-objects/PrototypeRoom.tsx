import { PROTOTYPE_ROOM_CONFIG } from '../../scenes/prototypeSceneConfig'

const [floorW, floorD] = PROTOTYPE_ROOM_CONFIG.floor.size
const { height: wallH, thickness: t, color: wallColor, visualOverlap: ov } =
  PROTOTYPE_ROOM_CONFIG.walls
const halfW = floorW / 2
const halfD = floorD / 2
const L = ov * 2

/**
 * Hand-built prototype room: floor + four walls with a front opening for the gate.
 * Visual wall boxes are slightly longer than collision (`visualOverlap`) so corners
 * and borders do not show cracks; colliders stay in `staticColliders.ts`.
 */
export function PrototypeRoom() {
  return (
    <group name="prototype-room">
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
      >
        <planeGeometry args={[floorW, floorD]} />
        <meshStandardMaterial color="#211020" roughness={0.75} />
      </mesh>

      <mesh castShadow receiveShadow position={[0, wallH / 2, halfD]}>
        <boxGeometry args={[floorW + L, wallH, t]} />
        <meshStandardMaterial color={wallColor} roughness={0.7} />
      </mesh>

      <mesh castShadow receiveShadow position={[-halfW, wallH / 2, 0]}>
        <boxGeometry args={[t, wallH, floorD + L]} />
        <meshStandardMaterial color={wallColor} roughness={0.7} />
      </mesh>

      <mesh castShadow receiveShadow position={[halfW, wallH / 2, 0]}>
        <boxGeometry args={[t, wallH, floorD + L]} />
        <meshStandardMaterial color={wallColor} roughness={0.7} />
      </mesh>

      <mesh castShadow receiveShadow position={[-4.25, wallH / 2, -halfD]}>
        <boxGeometry args={[5.5 + L, wallH, t]} />
        <meshStandardMaterial color={wallColor} roughness={0.7} />
      </mesh>

      <mesh castShadow receiveShadow position={[4.25, wallH / 2, -halfD]}>
        <boxGeometry args={[5.5 + L, wallH, t]} />
        <meshStandardMaterial color={wallColor} roughness={0.7} />
      </mesh>
    </group>
  )
}
