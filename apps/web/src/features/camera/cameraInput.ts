import { useEffect, useRef } from 'react'
import { CAMERA_CONFIG } from './cameraConfig'
import { useCameraStore } from './cameraStore'

/**
 * Window-level keys: C toggle, comma/period zoom, A/D held for turn (read `turnRef` each frame).
 */
export function useCameraInput() {
  const turnRef = useRef(0)

  useEffect(() => {
    const pressed = new Set<string>()

    const syncTurn = () => {
      turnRef.current = (pressed.has('KeyA') ? 1 : 0) - (pressed.has('KeyD') ? 1 : 0)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === CAMERA_CONFIG.modeToggleKey && !e.repeat) {
        useCameraStore.getState().toggleMode()
        return
      }
      if (e.code === CAMERA_CONFIG.zoomInKey) {
        useCameraStore.getState().zoomIn()
        return
      }
      if (e.code === CAMERA_CONFIG.zoomOutKey) {
        useCameraStore.getState().zoomOut()
        return
      }
      if (e.code === 'KeyA' || e.code === 'KeyD') {
        if (e.repeat) return
        pressed.add(e.code)
        syncTurn()
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' || e.code === 'KeyD') {
        pressed.delete(e.code)
        syncTurn()
      }
    }

    const clear = () => {
      pressed.clear()
      syncTurn()
    }

    const onVisibility = () => {
      if (document.visibilityState !== 'visible') clear()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', clear)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', clear)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return turnRef
}
