import type { CSSProperties } from 'react'
import { AccessibilityPanel } from './AccessibilityPanel'
import { useAppShellStore } from './appShellStore'

const KEYFRAMES = `
@keyframes aethon-pause-fadein {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .aethon-pause-panel { animation: none !important; }
}
`

const scrim: CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(9, 3, 15, 0.55)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 110,
}

const panel: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 0,
  padding: '40px 52px 44px',
  borderRadius: 12,
  background: 'rgba(12, 6, 22, 0.88)',
  border: '1px solid rgba(232, 200, 224, 0.18)',
  boxShadow: '0 16px 56px rgba(0,0,0,0.65)',
  minWidth: 280,
  animation: 'aethon-pause-fadein 0.18s ease-out both',
}

const headingStyle: CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '1.9rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  color: '#e8c8e0',
  margin: '0 0 32px',
  textAlign: 'center',
  textShadow: '0 0 20px rgba(232, 200, 224, 0.3)',
}

const buttonBase: CSSProperties = {
  width: 200,
  padding: '12px 0',
  borderRadius: 6,
  border: '1px solid rgba(232, 200, 224, 0.35)',
  background: 'rgba(40, 20, 55, 0.5)',
  color: '#e8c8e0',
  fontSize: '0.92rem',
  fontFamily: 'system-ui, sans-serif',
  letterSpacing: '0.07em',
  cursor: 'pointer',
  transition: 'background 0.2s, border-color 0.2s',
  outline: 'none',
  fontWeight: 600,
}

const secondaryButton: CSSProperties = {
  ...buttonBase,
  marginTop: 12,
  background: 'rgba(20, 10, 30, 0.4)',
  border: '1px solid rgba(191, 232, 255, 0.2)',
  color: 'rgba(191, 232, 255, 0.75)',
  fontWeight: 400,
}

function onHoverPrimary(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.background = 'rgba(100, 40, 120, 0.6)'
  e.currentTarget.style.borderColor = 'rgba(232, 200, 224, 0.7)'
}
function onLeavePrimary(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.background = 'rgba(40, 20, 55, 0.5)'
  e.currentTarget.style.borderColor = 'rgba(232, 200, 224, 0.35)'
}
function onHoverSecondary(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.background = 'rgba(20, 40, 65, 0.55)'
  e.currentTarget.style.borderColor = 'rgba(191, 232, 255, 0.45)'
}
function onLeaveSecondary(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.background = 'rgba(20, 10, 30, 0.4)'
  e.currentTarget.style.borderColor = 'rgba(191, 232, 255, 0.2)'
}

export function PauseMenuScreen() {
  const resumeGame = useAppShellStore((s) => s.resumeGame)
  const backToMenu = useAppShellStore((s) => s.backToMenu)

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div style={scrim} role="dialog" aria-modal="true" aria-label="Game paused">
        <div style={panel} className="aethon-pause-panel">
          <h2 style={headingStyle}>Paused</h2>

          <button
            style={buttonBase}
            onClick={resumeGame}
            onMouseEnter={onHoverPrimary}
            onMouseLeave={onLeavePrimary}
            aria-label="Resume game"
            autoFocus
          >
            Resume
          </button>

          <button
            style={secondaryButton}
            onClick={backToMenu}
            onMouseEnter={onHoverSecondary}
            onMouseLeave={onLeaveSecondary}
            aria-label="Return to main menu"
          >
            Main Menu
          </button>

          <div
            style={{
              width: '100%',
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(232,200,224,0.15), transparent)',
              margin: '24px 0 4px',
            }}
            aria-hidden="true"
          />

          <AccessibilityPanel />
        </div>
      </div>
    </>
  )
}
