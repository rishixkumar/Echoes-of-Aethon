import { useEffect } from 'react'
import { useEffectiveReducedMotion, usePrefsStore } from '../../core/prefsStore'

export function PrefsBodySync() {
  const highContrast = usePrefsStore((s) => s.highContrast)
  const largeText = usePrefsStore((s) => s.largeText)
  const effectiveReducedMotion = useEffectiveReducedMotion()

  useEffect(() => {
    document.body.classList.toggle('high-contrast', highContrast)
  }, [highContrast])

  useEffect(() => {
    document.body.classList.toggle('large-text', largeText)
  }, [largeText])

  useEffect(() => {
    document.body.classList.toggle('reduced-motion', effectiveReducedMotion)
  }, [effectiveReducedMotion])

  return null
}
