import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { GATE_ORB_ID } from '../interaction/interactableRegistry'
import { usePlayerStore } from '../player/playerStore'
import { useAreaStateStore } from '../world-state/areaStateStore'
import { useWorldStateStore } from '../world-state/worldStateStore'
import { PROTOTYPE_SCENE_CONFIG } from '../../scenes/prototypeSceneConfig'

const exitCfg = PROTOTYPE_SCENE_CONFIG.exitZone

/**
 * Exit strip behind the gate: invisible until the gate opens, then faint glow; completes the prototype area.
 */
export function ExitZone() {
  const gateOpen = useWorldStateStore((s) =>
    s.isInteractableActivated(GATE_ORB_ID),
  )
  const doneRef = useRef(false)

  useFrame(() => {
    if (doneRef.current) return
    if (!useWorldStateStore.getState().isInteractableActivated(GATE_ORB_ID)) {
      return
    }
    const [px, , pz] = usePlayerStore.getState().playerPosition
    const [exitX, , exitZ] = exitCfg.position
    const [exitWidth, , exitDepth] = exitCfg.size

    const insideExit =
      Math.abs(px - exitX) <= exitWidth / 2 &&
      Math.abs(pz - exitZ) <= exitDepth / 2

    if (insideExit) {
      doneRef.current = true
      useAreaStateStore.getState().setPrototypeAreaComplete(true)
    }
  })

  if (!gateOpen) return null

  const [x, y, z] = exitCfg.position
  const [w, , d] = exitCfg.size

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[x, y, z]}
      name={exitCfg.id}
    >
      <planeGeometry args={[w, d]} />
      <meshBasicMaterial
        color="#8fdcff"
        transparent
        opacity={0.18}
        depthWrite={false}
      />
    </mesh>
  )
}
