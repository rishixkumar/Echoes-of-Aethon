import { useEffect } from 'react'
import { useAppShellStore } from './appShellStore'

export function ShellKeyHandler() {
  const pauseGame = useAppShellStore((s) => s.pauseGame)
  const resumeGame = useAppShellStore((s) => s.resumeGame)
  const screen = useAppShellStore((s) => s.screen)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      if (screen === 'playing') {
        pauseGame()
      } else if (screen === 'paused') {
        resumeGame()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [screen, pauseGame, resumeGame])

  return null
}
