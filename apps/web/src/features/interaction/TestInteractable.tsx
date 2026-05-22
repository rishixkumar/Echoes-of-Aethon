import { WorldLabel } from '../../components/world-labels/WorldLabel'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { MeshStandardMaterial } from 'three'
import {
  pickNearestInteractable,
  type InteractableRole,
} from './interactableRegistry'
import { OBJECTIVES } from '../objectives/objectiveRegistry'
import { useObjectiveStore } from '../objectives/objectiveStore'
import { useWorldStateStore } from '../world-state/worldStateStore'
import { isInteractKey } from './interactionConfig'
import { useInteractionHudStore } from './interactionHudStore'
import { usePlayerStore } from '../player/playerStore'

const OBJECTIVE_ORB_INACTIVE = '#ff9446'
const OBJECTIVE_ORB_ACTIVE = '#5ce1c1'
const ECHO_ORB_INACTIVE = '#5d5468'
const ECHO_ORB_ACTIVE = '#4ecf7a'

function materialForRole(role: InteractableRole, activated: boolean) {
  switch (role) {
    case 'objective-orb':
      return {
        color: activated ? OBJECTIVE_ORB_ACTIVE : OBJECTIVE_ORB_INACTIVE,
        emissiveIntensity: activated ? 0.78 : 0.55,
      }
    case 'echo-orb':
    case 'lore-object':
      return {
        color: activated ? ECHO_ORB_ACTIVE : ECHO_ORB_INACTIVE,
        emissiveIntensity: activated ? 0.62 : 0.35,
      }
  }
}

export type TestInteractableProps = Readonly<{
  id: string
  label: string
  role: InteractableRole
  position: readonly [number, number, number]
  radius: number
}>

/**
 * Proximity interactable with **role-based** visuals and objective wiring.
 * Nearest in range owns HUD / world prompt and **E** (toggle persists in world store).
 */
export function TestInteractable({
  id,
  label,
  role,
  position,
  radius,
}: TestInteractableProps) {
  const materialRef = useRef<MeshStandardMaterial>(null)

  const meshRadius = Math.min(0.45, Math.max(0.12, radius * 0.19))

  const lastFocusedForWorldUi = useRef(false)
  const [showWorldPrompt, setShowWorldPrompt] = useState(false)
  const lastPromptRef = useRef<string | null>(null)

  const applyOrbMaterial = (r: InteractableRole, activated: boolean) => {
    const mat = materialRef.current
    if (!mat) return
    const { color, emissiveIntensity } = materialForRole(r, activated)
    mat.color.set(color)
    mat.emissive.set(color)
    mat.emissiveIntensity = emissiveIntensity
  }

  useFrame(() => {
    const activated = useWorldStateStore.getState().isInteractableActivated(id)
    applyOrbMaterial(role, activated)

    const [px, , pz] = usePlayerStore.getState().playerPosition
    const nearest = pickNearestInteractable(px, pz)
    const focused = nearest?.id === id

    if (focused !== lastFocusedForWorldUi.current) {
      lastFocusedForWorldUi.current = focused
      setShowWorldPrompt(focused)
    }

    if (nearest === null) {
      if (lastPromptRef.current !== null) {
        lastPromptRef.current = null
        useInteractionHudStore.getState().setInteractionPrompt(null)
      }
      return
    }

    if (!focused) return

    const verb = activated ? 'deactivate' : 'activate'
    const next = `Press E to ${verb} ${label}`

    if (next !== lastPromptRef.current) {
      lastPromptRef.current = next
      useInteractionHudStore.getState().setInteractionPrompt(next)
    }
  })

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (!isInteractKey(e)) return
      const [px, , pz] = usePlayerStore.getState().playerPosition
      const nearest = pickNearestInteractable(px, pz)
      if (nearest?.id !== id) return
      console.info(`[EchoesOfAethon] Interactable toggled: ${id} (${label})`)

      useWorldStateStore.getState().toggleInteractable(id)
      const on = useWorldStateStore.getState().isInteractableActivated(id)
      if (on) {
        for (const obj of OBJECTIVES) {
          if (obj.requiredInteractableId === id) {
            useObjectiveStore.getState().completeObjective(obj.id)
          }
        }
      }
    }
    window.addEventListener('keydown', onDown)
    return () => window.removeEventListener('keydown', onDown)
  }, [id, label])

  const [px, py, pz] = position
  const isNearby = showWorldPrompt

  return (
    <group position={[px, py, pz]} name={`interactable-${id}`}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[meshRadius, 24, 24]} />
        <meshStandardMaterial
          ref={materialRef}
          color={ECHO_ORB_INACTIVE}
          emissive={ECHO_ORB_INACTIVE}
          emissiveIntensity={0.35}
          metalness={0.22}
          roughness={0.32}
        />
      </mesh>
      <WorldLabel
        text={label}
        variant="name"
        position={[0, 0.95, 0]}
        visible={isNearby}
      />
      <WorldLabel
        text="Press E"
        variant="prompt"
        position={[0, 1.35, 0]}
        visible={isNearby}
      />
    </group>
  )
}
