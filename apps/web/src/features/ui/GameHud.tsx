import type { CSSProperties } from 'react'
import { useCameraStore } from '../camera/cameraStore'
import { isNearAnyInteractable } from '../interaction/interactableRegistry'
import { useInteractionHudStore } from '../interaction/interactionHudStore'
import { usePlayerStore } from '../player/playerStore'
import { useAreaStateStore } from '../world-state/areaStateStore'
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

const areaCompleteBanner: CSSProperties = {
  position: 'absolute',
  top: 56,
  left: '50%',
  transform: 'translateX(-50%)',
  padding: '10px 20px',
  borderRadius: 10,
  background: 'rgba(20, 48, 36, 0.85)',
  border: '1px solid rgba(120, 255, 190, 0.45)',
  color: '#c8ffe8',
  fontSize: 15,
  fontWeight: 700,
  letterSpacing: 0.04,
  textAlign: 'center',
  pointerEvents: 'none',
  userSelect: 'none',
  boxShadow: '0 6px 24px rgba(0, 0, 0, 0.35)',
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
  const areaComplete = useAreaStateStore((s) => s.isPrototypeAreaComplete)

  const cameraMode = useCameraStore((s) => s.mode)
  const thirdPersonDistance = useCameraStore((s) => s.thirdPersonDistance)
  const firstPersonFov = useCameraStore((s) => s.firstPersonFov)
  const cameraObstruction = useCameraStore((s) => s.debugObstructionLabel)
  const topDownBlend = useCameraStore((s) => s.debugTopDownBlend)

  const cameraLabel =
    cameraMode === 'first-person' ? 'First Person' : 'Third Person'

  return (
    <>
      {areaComplete ? (
        <div style={areaCompleteBanner} role="status">
          Area Complete
        </div>
      ) : null}
      <div style={panel}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Prototype controls</div>
        <div>W/S — move forward/back</div>
        <div>A/D — turn</div>
        <div>C — switch camera</div>
        <div>, / . — zoom</div>
        <div style={{ marginTop: 6, fontWeight: 600 }}>
          Camera: {cameraLabel}
        </div>
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
          {cameraMode === 'third-person' ? (
            <div>Zoom (dist): {thirdPersonDistance.toFixed(2)}</div>
          ) : (
            <div>FOV: {firstPersonFov.toFixed(0)}</div>
          )}
          <div>
            Player: x {px.toFixed(2)}, z {pz.toFixed(2)}
          </div>
          <div>Near interactable: {nearInteractable ? 'yes' : 'no'}</div>
          <div>Active objects: {activeObjectCount}</div>
          <div>Camera obstruction: {cameraObstruction}</div>
          <div>Top-down blend: {topDownBlend.toFixed(2)}</div>
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
    </>
  )
}
