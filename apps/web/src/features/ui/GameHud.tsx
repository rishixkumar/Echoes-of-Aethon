import type { CSSProperties } from 'react'
import { isNearAnyInteractable } from '../interaction/interactableRegistry'
import { useInteractionHudStore } from '../interaction/interactionHudStore'
import { usePlayerStore } from '../player/playerStore'
import { useWorldStateStore } from '../world-state/worldStateStore'

const panel: CSSProperties = {
  position: 'absolute',
  left: 12,
  bottom: 12,
  padding: '8px 10px',
  borderRadius: 8,
  background: 'rgba(10, 12, 18, 0.55)',
  border: '1px solid rgba(232, 236, 245, 0.12)',
  color: 'rgba(232, 236, 245, 0.85)',
  fontSize: 12,
  lineHeight: 1.35,
  maxWidth: 320,
  pointerEvents: 'none',
  userSelect: 'none',
}

/**
 * DOM overlay above the Canvas: movement hints + proximity interaction prompt + dev readouts.
 */
export function GameHud() {
  const interactionPrompt = useInteractionHudStore((s) => s.interactionPrompt)
  const [px, , pz] = usePlayerStore((s) => s.playerPosition)
  const nearInteractable = isNearAnyInteractable(px, pz)
  const activatedMap = useWorldStateStore((s) => s.activatedInteractables)
  const activeObjectCount = Object.values(activatedMap).filter(Boolean).length

  return (
    <div style={panel}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>Prototype controls</div>
      <div>WASD — move (camera-relative)</div>
      <div>Mouse — orbit (inspect)</div>
      <div
        style={{
          marginTop: 10,
          paddingTop: 10,
          borderTop: '1px solid rgba(232, 236, 245, 0.12)',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: 11,
          color: 'rgba(232, 236, 245, 0.7)',
        }}
      >
        <div>
          Player: x {px.toFixed(2)}, z {pz.toFixed(2)}
        </div>
        <div>Near interactable: {nearInteractable ? 'yes' : 'no'}</div>
        <div>Active objects: {activeObjectCount}</div>
      </div>
      {interactionPrompt ? (
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: '1px solid rgba(232, 236, 245, 0.12)',
            fontWeight: 600,
            color: '#bfe8ff',
          }}
        >
          {interactionPrompt}
        </div>
      ) : null}
    </div>
  )
}
