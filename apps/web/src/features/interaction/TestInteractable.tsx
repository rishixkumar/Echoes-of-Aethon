import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MeshStandardMaterial, Vector3 } from 'three'
import { INTERACTION_CONFIG, isInteractKey } from './interactionConfig'
import { pickNearestInteractable } from './interactableRegistry'
import { useInteractionHudStore } from './interactionHudStore'
import { usePlayerStore } from '../player/playerStore'

const WARM = '#5ce1c1'
const ACTIVE = '#ff9446'

export type TestInteractableProps = Readonly<{
  id: string
  label: string
  position: readonly [number, number, number]
  radius: number
}>

/**
 * Generic proximity interactable (glow sphere). When several overlap in range,
 * the **nearest** one owns the HUD / world prompt and accepts **E**.
 */
export function TestInteractable({
  id,
  label,
  position,
  radius,
}: TestInteractableProps) {
  const materialRef = useRef<MeshStandardMaterial>(null)
  const objectWorld = useMemo(
    () => new Vector3(position[0], position[1], position[2]),
    [position],
  )

  const meshRadius = Math.min(0.45, Math.max(0.12, radius * 0.19))

  const wasSelfInRangeRef = useRef(false)
  const lastFocusedForWorldUi = useRef(false)
  const [showWorldPrompt, setShowWorldPrompt] = useState(false)
  const lastPromptRef = useRef<string | null>(null)
  const activatedUntilRef = useRef(0)

  const applyOrbColor = (hex: string) => {
    const mat = materialRef.current
    if (!mat) return
    mat.color.set(hex)
    mat.emissive.set(hex)
  }

  useFrame(() => {
    const [px, , pz] = usePlayerStore.getState().playerPosition
    const dx = px - objectWorld.x
    const dz = pz - objectWorld.z
    const horizontal = Math.hypot(dx, dz)
    const selfInRange = horizontal <= radius

    const nearest = pickNearestInteractable(px, pz)
    const focused = nearest?.id === id

    if (focused !== lastFocusedForWorldUi.current) {
      lastFocusedForWorldUi.current = focused
      setShowWorldPrompt(focused)
    }

    if (!selfInRange && wasSelfInRangeRef.current) {
      applyOrbColor(WARM)
    }
    wasSelfInRangeRef.current = selfInRange

    if (nearest === null) {
      if (lastPromptRef.current !== null) {
        lastPromptRef.current = null
        useInteractionHudStore.getState().setInteractionPrompt(null)
      }
      return
    }

    if (!focused) return

    const now = performance.now()
    const showingActivation = now < activatedUntilRef.current

    let next: string | null = null
    if (showingActivation) next = 'Object activated'
    else next = 'Press E to interact'

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
      console.info(`[EchoesOfAethon] Interactable activated: ${id} (${label})`)
      applyOrbColor(ACTIVE)
      activatedUntilRef.current = performance.now() + 2000
    }
    window.addEventListener('keydown', onDown)
    return () => window.removeEventListener('keydown', onDown)
  }, [id, label])

  const [px, py, pz] = position
  const { yOffset, distanceFactor } = INTERACTION_CONFIG.worldPrompt

  return (
    <group position={[px, py, pz]} name={`interactable-${id}`}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[meshRadius, 24, 24]} />
        <meshStandardMaterial
          ref={materialRef}
          color={WARM}
          emissive={WARM}
          emissiveIntensity={0.72}
          metalness={0.22}
          roughness={0.32}
        />
      </mesh>
      {showWorldPrompt ? (
        <Html
          position={[0, yOffset, 0]}
          center
          sprite
          distanceFactor={distanceFactor}
        >
          <div className="worldPrompt">Press E</div>
        </Html>
      ) : null}
    </group>
  )
}
