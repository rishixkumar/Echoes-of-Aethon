import { create } from 'zustand'
import { CAMERA_CONFIG } from './cameraConfig'
import type { CameraMode } from './cameraTypes'

const { firstPerson, thirdPerson } = CAMERA_CONFIG

export type CameraTransitionState = {
  isTransitioning: boolean
  fromMode: CameraMode
  toMode: CameraMode
  startedAt: number
  duration: number
}

type CameraStoreState = {
  mode: CameraMode
  pitch: number
  yaw: number
  yawTarget: number
  thirdPersonDistance: number
  firstPersonFov: number

  transition: CameraTransitionState

  /** HUD debug (updated sparingly from `GameCamera`). */
  debugObstructionLabel: 'none' | 'mild' | 'severe'
  debugTopDownBlend: number

  toggleMode: () => void
  setMode: (mode: CameraMode) => void
  zoomIn: () => void
  zoomOut: () => void
  setYawSmoothing: (yaw: number, yawTarget: number) => void
  completeTransition: () => void
  setCameraDebugHud: (label: 'none' | 'mild' | 'severe', blend: number) => void
}

const idleTransition = (): CameraTransitionState => ({
  isTransitioning: false,
  fromMode: 'third-person',
  toMode: 'third-person',
  startedAt: 0,
  duration: CAMERA_CONFIG.transition.duration,
})

export const useCameraStore = create<CameraStoreState>((set, get) => ({
  mode: 'third-person',
  pitch: 0,
  yaw: Math.PI,
  yawTarget: Math.PI,
  thirdPersonDistance: thirdPerson.defaultDistance,
  firstPersonFov: firstPerson.defaultFov,

  transition: idleTransition(),

  debugObstructionLabel: 'none',
  debugTopDownBlend: 0,

  toggleMode: () => {
    if (get().transition.isTransitioning) return
    const from = get().mode
    const to: CameraMode =
      from === 'first-person' ? 'third-person' : 'first-person'
    set({
      mode: to,
      transition: {
        isTransitioning: true,
        fromMode: from,
        toMode: to,
        startedAt: performance.now(),
        duration: CAMERA_CONFIG.transition.duration,
      },
    })
  },

  setMode: (mode) => set({ mode }),

  zoomIn: () =>
    set((s) => {
      if (s.mode === 'third-person') {
        const next = Math.max(
          thirdPerson.minDistance,
          s.thirdPersonDistance - thirdPerson.distanceStep,
        )
        return { thirdPersonDistance: next }
      }
      const next = Math.max(
        firstPerson.minFov,
        s.firstPersonFov - firstPerson.fovStep,
      )
      return { firstPersonFov: next }
    }),

  zoomOut: () =>
    set((s) => {
      if (s.mode === 'third-person') {
        const next = Math.min(
          thirdPerson.maxDistance,
          s.thirdPersonDistance + thirdPerson.distanceStep,
        )
        return { thirdPersonDistance: next }
      }
      const next = Math.min(
        firstPerson.maxFov,
        s.firstPersonFov + firstPerson.fovStep,
      )
      return { firstPersonFov: next }
    }),

  setYawSmoothing: (yaw, yawTarget) => set({ yaw, yawTarget }),

  completeTransition: () =>
    set({
      transition: idleTransition(),
    }),

  setCameraDebugHud: (label, blend) =>
    set({ debugObstructionLabel: label, debugTopDownBlend: blend }),
}))
