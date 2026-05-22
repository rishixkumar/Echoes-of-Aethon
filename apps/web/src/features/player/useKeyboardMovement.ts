import { useEffect, useRef } from 'react'

export type KeyboardMovementAxes = Readonly<{
  /** +1 forward (W), −1 back (S), 0 idle. */
  forward: number
}>

/**
 * Tracks W/S for forward/back (camera system uses A/D for yaw elsewhere).
 * Clears state on blur/visibility loss to avoid stuck keys while alt-tabbing.
 */
export function useKeyboardMovement() {
  const axes = useRef<KeyboardMovementAxes>({ forward: 0 })

  useEffect(() => {
    const pressed = new Set<string>()

    const sync = () => {
      const up = pressed.has('KeyW') ? 1 : 0
      const down = pressed.has('KeyS') ? 1 : 0
      axes.current = { forward: up - down }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      if (!isMovementCode(e.code)) return
      pressed.add(e.code)
      sync()
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (!isMovementCode(e.code)) return
      pressed.delete(e.code)
      sync()
    }

    const clear = () => {
      pressed.clear()
      sync()
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

  return axes
}

function isMovementCode(code: string) {
  return code === 'KeyW' || code === 'KeyS'
}
