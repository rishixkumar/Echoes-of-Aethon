import { GATE_ORB_ID } from '../interaction/interactableRegistry'
import { useWorldStateStore } from '../world-state/worldStateStore'
import { PROTOTYPE_SCENE_CONFIG } from '../../scenes/prototypeSceneConfig'

const gate = PROTOTYPE_SCENE_CONFIG.gate

/**
 * Simple gate that disappears when the objective orb (`gate-orb`) is activated.
 */
export function EchoGate() {
  const open = useWorldStateStore((s) =>
    s.isInteractableActivated(GATE_ORB_ID),
  )

  const [x, y, z] = gate.position
  const [w, h, d] = gate.size

  if (open) return null

  return (
    <group position={[x, y, z]} name={gate.id}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#1b1020" roughness={0.7} />
      </mesh>
    </group>
  )
}
