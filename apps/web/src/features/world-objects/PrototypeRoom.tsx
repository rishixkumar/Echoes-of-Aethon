import { PROTOTYPE_ROOM_CONFIG } from '../../scenes/prototypeSceneConfig'

const [floorW, floorD] = PROTOTYPE_ROOM_CONFIG.floor.size
const {
  height: wallH,
  thickness: t,
  color: wallColor,
  visualOverlap: ov,
} = PROTOTYPE_ROOM_CONFIG.walls
const halfW = floorW / 2
const halfD = floorD / 2
/** Doorway clear width on X — matches gate `size[0]`. */
const doorW = PROTOTYPE_ROOM_CONFIG.gate.size[0]
const doorHalf = doorW / 2

/** Outer X of side wall prisms (wall centered on ±halfW, thickness t on X). */
const outerXLeft = -halfW - t / 2
const outerXRight = halfW + t / 2

/**
 * Axis-aligned wall slab from inclusive world AABB (XZ footprint, full height on Y).
 * Returns center and `boxGeometry` args so placement cannot drift from bounds math.
 */
function wallFromBounds(
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number,
  height: number,
): {
  position: readonly [number, number, number]
  args: readonly [number, number, number]
} {
  const sx = maxX - minX
  const sy = height
  const sz = maxZ - minZ
  return {
    position: [(minX + maxX) / 2, height / 2, (minZ + maxZ) / 2],
    args: [sx, sy, sz],
  }
}

/*
  Floor footprint (XZ): x ∈ [-halfW, halfW], z ∈ [-halfD, halfD].
  Wall skins: back z = +halfD, front z = -halfD; sides x = ±halfW with thickness t on X.

  Front split: only |x| < doorHalf stays open. Segments extend to outerXLeft/outerXRight
  so they meet the side prisms (fixes gap when front used to stop at ±halfW only).

  Bounds reference (floorW=14, floorD=18, t=0.35, doorW=3, ov=0.08):
  - room x: [-7, 7], z: [-9, 9] (floor)
  - outer side x: ±7.175
  - front left x: [-7.255, -1.42], front right x: [1.42, 7.255]
  - doorway inner x ≈ ±1.42 (slight visual overlap into opening)
*/

const backZ = halfD
const frontZ = -halfD

const backWall = wallFromBounds(
  -halfW - ov,
  halfW + ov,
  backZ - t / 2,
  backZ + t / 2,
  wallH,
)

const leftWall = wallFromBounds(
  outerXLeft,
  outerXLeft + t,
  frontZ - ov,
  backZ + ov,
  wallH,
)

const rightWall = wallFromBounds(
  outerXRight - t,
  outerXRight,
  frontZ - ov,
  backZ + ov,
  wallH,
)

const frontLeftWall = wallFromBounds(
  outerXLeft - ov,
  -doorHalf + ov,
  frontZ - t / 2,
  frontZ + t / 2,
  wallH,
)

const frontRightWall = wallFromBounds(
  doorHalf - ov,
  outerXRight + ov,
  frontZ - t / 2,
  frontZ + t / 2,
  wallH,
)

/**
 * Hand-built prototype room: floor + four walls with a front opening for the gate.
 * Walls are built from explicit XZ bounds so corners meet; colliders stay in `staticColliders.ts`.
 */
export function PrototypeRoom() {
  const walls = [
    { key: 'back', ...backWall },
    { key: 'left', ...leftWall },
    { key: 'right', ...rightWall },
    { key: 'front-left', ...frontLeftWall },
    { key: 'front-right', ...frontRightWall },
  ] as const

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

      {walls.map(({ key, position, args }) => (
        <mesh key={key} castShadow receiveShadow position={[...position]}>
          <boxGeometry args={[...args]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}
