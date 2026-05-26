import type { CSSProperties } from 'react'
import { usePrefsStore } from '../../core/prefsStore'

const panelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  padding: '16px 0',
}

const headingStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  fontWeight: 700,
  color: 'rgba(232, 236, 245, 0.95)',
  letterSpacing: 0.04,
  textTransform: 'uppercase',
  marginBottom: 4,
}

const rowStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 12,
}

const labelGroupStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  flex: 1,
}

const labelStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: 'rgba(232, 236, 245, 0.92)',
  lineHeight: 1.3,
}

const descStyle: CSSProperties = {
  fontSize: 11,
  color: 'rgba(232, 236, 245, 0.5)',
  lineHeight: 1.4,
}

function getTrackStyle(checked: boolean): CSSProperties {
  return {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    width: 40,
    height: 22,
    borderRadius: 11,
    border: '1px solid rgba(232, 236, 245, 0.25)',
    background: checked
      ? 'rgba(180, 140, 255, 0.65)'
      : 'rgba(232, 236, 245, 0.08)',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background 0.15s ease',
    outline: 'none',
    padding: 0,
  }
}

function getThumbStyle(checked: boolean): CSSProperties {
  return {
    position: 'absolute',
    top: 3,
    left: checked ? 20 : 3,
    width: 14,
    height: 14,
    borderRadius: '50%',
    background: checked
      ? 'rgba(232, 236, 245, 1)'
      : 'rgba(232, 236, 245, 0.45)',
    transition: 'left 0.15s ease, background 0.15s ease',
    pointerEvents: 'none',
  }
}

type ToggleRowProps = {
  id: string
  label: string
  description: string
  checked: boolean
  onChange(v: boolean): void
}

function ToggleRow({ id, label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div style={rowStyle}>
      <div style={labelGroupStyle}>
        <label htmlFor={id} style={labelStyle}>
          {label}
        </label>
        <span style={descStyle}>{description}</span>
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={getTrackStyle(checked)}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            onChange(!checked)
          }
        }}
      >
        <span style={getThumbStyle(checked)} />
      </button>
    </div>
  )
}

export function AccessibilityPanel() {
  const reducedMotion = usePrefsStore((s) => s.reducedMotion)
  const highContrast = usePrefsStore((s) => s.highContrast)
  const largeText = usePrefsStore((s) => s.largeText)
  const setReducedMotion = usePrefsStore((s) => s.setReducedMotion)
  const setHighContrast = usePrefsStore((s) => s.setHighContrast)
  const setLargeText = usePrefsStore((s) => s.setLargeText)

  return (
    <div style={panelStyle}>
      <h3 style={headingStyle}>Accessibility</h3>
      <ToggleRow
        id="pref-reduced-motion"
        label="Reduced Motion"
        description="Disables animations and easing transitions"
        checked={reducedMotion}
        onChange={setReducedMotion}
      />
      <ToggleRow
        id="pref-high-contrast"
        label="High Contrast HUD"
        description="Increases text and border contrast in HUD panels"
        checked={highContrast}
        onChange={setHighContrast}
      />
      <ToggleRow
        id="pref-large-text"
        label="Large Text"
        description="Increases HUD font size by 20%"
        checked={largeText}
        onChange={setLargeText}
      />
    </div>
  )
}
