import { useCameraStore } from './cameraStore'

/**
 * Shortest-path angle interpolation in radians (for yaw smoothing).
 */
export function lerpAngle(from: number, to: number, t: number): number {
  let delta = to - from
  while (delta > Math.PI) delta -= Math.PI * 2
  while (delta < -Math.PI) delta += Math.PI * 2
  return from + delta * t
}

export function smoothstep(t: number): number {
  return t * t * (3 - 2 * t)
}

/** Smooth transition progress in [0, 1] while a mode transition is active; otherwise 1. */
export function getCameraTransitionT(): number {
  const tr = useCameraStore.getState().transition
  if (!tr.isTransitioning) return 1
  const rawT = (performance.now() - tr.startedAt) / (tr.duration * 1000)
  return smoothstep(Math.min(rawT, 1))
}

/** Capsule + label visibility rules during FP/TP transitions. */
export function isPlayerBodyVisible(): boolean {
  const s = useCameraStore.getState()
  const { mode, transition } = s
  if (!transition.isTransitioning) {
    return mode === 'third-person'
  }
  const rawT =
    (performance.now() - transition.startedAt) / (transition.duration * 1000)
  const t = smoothstep(Math.min(rawT, 1))
  const { fromMode, toMode } = transition
  return (
    mode === 'third-person' ||
    (toMode === 'third-person' && t > 0.1) ||
    (fromMode === 'third-person' && t < 0.5)
  )
}
