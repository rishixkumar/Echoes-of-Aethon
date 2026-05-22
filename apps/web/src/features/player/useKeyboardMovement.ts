import { useEffect, useRef } from 'react'

export type KeyboardMovementAxes = Readonly<{
  x: number
  z: number
}>

/**
 * Tracks WASD on the window without re-rendering every keypress.
 * Clears state on blur/visibility loss to avoid "stuck" keys while alt-tabbing.
 */
export function useKeyboardMovement() {
  const axes = useRef<KeyboardMovementAxes>({ x: 0, z: 0 })

  useEffect(() => {
    const pressed = new Set<string>()

    const sync = () => {
      const left = pressed.has('KeyA') ? 1 : 0
      const right = pressed.has('KeyD') ? 1 : 0
      const up = pressed.has('KeyW') ? 1 : 0
      const down = pressed.has('KeyS') ? 1 : 0

      axes.current = { x: right - left, z: down - up }
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
  return code === 'KeyW' || code === 'KeyA' || code === 'KeyS' || code === 'KeyD'
}
