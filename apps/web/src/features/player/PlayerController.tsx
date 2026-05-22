import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import { Group, Mesh, Vector3 } from 'three'
import { useCameraStore } from '../camera/cameraStore'
import { isPlayerBodyVisible } from '../camera/useGameCamera'
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
 * Keyboard-driven avatar: W/S along camera yaw, A/D handled in `GameCamera` input (yaw).
 * Slab clamp + static XZ colliders unchanged.
 */
export function PlayerController({ spawn }: PlayerControllerProps) {
  const groupRef = useRef<Group>(null)
  const axes = useKeyboardMovement()
  const bodyRef = useRef<Mesh>(null)
  const [playerLabelVisible, setPlayerLabelVisible] = useState(true)
  const prevBodyVisible = useRef(true)

  const velocity = useRef(new Vector3())
  const scratch = useMemo(
    () => ({
      forward: new Vector3(),
      desired: new Vector3(),
    }),
    [],
  )

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return

    const { forward, desired } = scratch
    const yaw = useCameraStore.getState().yaw
    group.rotation.y = yaw

    forward.set(Math.sin(yaw), 0, Math.cos(yaw))

    const { forward: fIn } = axes.current
    desired.set(forward.x * fIn, 0, forward.z * fIn)

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

    const showBody = isPlayerBodyVisible()
    const mesh = bodyRef.current
    if (mesh) mesh.visible = showBody
    if (showBody !== prevBodyVisible.current) {
      prevBodyVisible.current = showBody
      setPlayerLabelVisible(showBody)
    }
  })

  const { capsule } = PLAYER_MOVEMENT_CONFIG
  const r = capsule.radius
  const len = capsule.length
  const height = len + 2 * r

  return (
    <group
      ref={groupRef}
      position={[spawn?.x ?? 0, 0, spawn?.z ?? 0]}
      rotation={[0, Math.PI, 0]}
      name="player"
    >
      <PlayerAura />
      <mesh
        ref={bodyRef}
        position={[0, height / 2, 0]}
        castShadow
        receiveShadow
        visible
      >
        <capsuleGeometry args={[r, len, 8, 16]} />
        <meshStandardMaterial
          color="#aeb8c8"
          emissive="#4d6f88"
          emissiveIntensity={0.15}
          roughness={0.65}
        />
      </mesh>
      <WorldLabel
        text="Player"
        variant="player"
        position={[0, 1.65, 0]}
        visible={playerLabelVisible}
      />
    </group>
  )
}
