type DebugMetricsPanelProps = Readonly<{
  cameraMode: 'first-person' | 'third-person'
  thirdPersonDistance: number
  firstPersonFov: number
  px: number
  pz: number
  nearInteractable: boolean
  activeObjectCount: number
  cameraObstruction: string
  topDownBlend: number
  mistLines: string[]
}>

/**
 * Collapsible prototype / mist debug readouts (DOM).
 */
export function DebugMetricsPanel({
  cameraMode,
  thirdPersonDistance,
  firstPersonFov,
  px,
  pz,
  nearInteractable,
  activeObjectCount,
  cameraObstruction,
  topDownBlend,
  mistLines,
}: DebugMetricsPanelProps) {
  return (
    <div className="debug-metrics">
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
      <div style={{ marginTop: 8, color: 'rgba(189, 162, 255, 0.95)' }}>
        {mistLines.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
    </div>
  )
}
