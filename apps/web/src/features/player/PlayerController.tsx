import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Group, Vector3 } from 'three'
import { WorldLabel } from '../../components/world-labels/WorldLabel'
import { PlayerAura } from './PlayerAura'
import { xzOverlapsAnyStaticCollider } from '../collision/staticColliders'
import { PLAYER_MOVEMENT_CONFIG } from './playerMovementConfig'
import { usePlayerStore } from './playerStore'
import { useKeyboardMovement } from './useKeyboardMovement'

type PlayerControllerProps = Readonly<{
  /** Optional spawn on the XZ plane (feet at y = 0). */
  spawn?: Readonly<{ x?: number; z?: number }>
}>

/**
 * Keyboard-driven placeholder avatar (no physics engine).
 * Movement is camera-relative on the XZ plane for sensible steering with OrbitControls.
 * World limits: axis-aligned slab clamp + static XZ circle colliders (no physics engine).
 */
export function PlayerController({ spawn }: PlayerControllerProps) {
  const groupRef = useRef<Group>(null)
  const axes = useKeyboardMovement()

  const velocity = useRef(new Vector3())
  const scratch = useMemo(
    () => ({
      forward: new Vector3(),
      right: new Vector3(),
      desired: new Vector3(),
      flatViewDir: new Vector3(),
    }),
    [],
  )

  useFrame((state, delta) => {
    const group = groupRef.current
    if (!group) return

    const { forward, right, desired, flatViewDir } = scratch

    state.camera.getWorldDirection(flatViewDir)
    flatViewDir.y = 0
    if (flatViewDir.lengthSq() < 1e-8) {
      flatViewDir.set(0, 0, -1)
    } else {
      flatViewDir.normalize()
    }

    right.copy(flatViewDir).cross(state.camera.up).normalize()
    forward.copy(flatViewDir)

    const { x, z } = axes.current
    desired.set(0, 0, 0)
    desired.addScaledVector(right, x)
    desired.addScaledVector(forward, -z)

    if (desired.lengthSq() > 1e-8) desired.normalize()

    const targetSpeed = desired.lengthSq() > 0 ? PLAYER_MOVEMENT_CONFIG.speed : 0
    desired.multiplyScalar(targetSpeed)

    const k = 1 - Math.exp(-PLAYER_MOVEMENT_CONFIG.response * delta)
    velocity.current.lerp(desired, k)

    const prevX = group.position.x
    const prevZ = group.position.z

    const rawX = group.position.x + velocity.current.x * delta
    const rawZ = group.position.z + velocity.current.z * delta

    const { minX, maxX, minZ, maxZ } = PLAYER_MOVEMENT_CONFIG.bounds
    const clampedX = Math.max(minX, Math.min(maxX, rawX))
    const clampedZ = Math.max(minZ, Math.min(maxZ, rawZ))

    if (rawX !== clampedX) velocity.current.x = 0
    if (rawZ !== clampedZ) velocity.current.z = 0

    const playerR = PLAYER_MOVEMENT_CONFIG.capsule.radius
    if (xzOverlapsAnyStaticCollider(clampedX, clampedZ, playerR)) {
      group.position.x = prevX
      group.position.z = prevZ
      velocity.current.x = 0
      velocity.current.z = 0
    } else {
      group.position.x = clampedX
      group.position.z = clampedZ
    }
    group.position.y = 0

    usePlayerStore
      .getState()
      .setPlayerPosition([group.position.x, group.position.y, group.position.z])
  })

  const { capsule } = PLAYER_MOVEMENT_CONFIG
  const r = capsule.radius
  const len = capsule.length
  const height = len + 2 * r

  return (
    <group
      ref={groupRef}
      position={[spawn?.x ?? 0, 0, spawn?.z ?? 0]}
      name="player"
    >
      <PlayerAura />
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[r, len, 8, 16]} />
        <meshStandardMaterial
          color="#aeb8c8"
          emissive="#4d6f88"
          emissiveIntensity={0.15}
          roughness={0.65}
        />
      </mesh>
      <WorldLabel text="Player" variant="player" position={[0, 1.65, 0]} />
    </group>
  )
}
