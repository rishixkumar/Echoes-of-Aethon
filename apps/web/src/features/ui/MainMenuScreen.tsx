import type { CSSProperties } from 'react'
import { useAppShellStore } from './appShellStore'

const KEYFRAMES = `
@keyframes aethon-pulse {
  0%, 100% { opacity: 0.7; }
  50%       { opacity: 1; }
}
@keyframes aethon-gradient-shift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes aethon-title-glow {
  0%, 100% { text-shadow: 0 0 24px rgba(232, 200, 224, 0.4), 0 2px 8px rgba(0,0,0,0.7); }
  50%       { text-shadow: 0 0 48px rgba(191, 232, 255, 0.6), 0 2px 8px rgba(0,0,0,0.7); }
}
@media (prefers-reduced-motion: reduce) {
  .aethon-main-bg    { animation: none !important; }
  .aethon-title      { animation: none !important; }
  .aethon-flavor     { animation: none !important; }
}
`

const overlay: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundSize: '300% 300%',
  background: 'linear-gradient(135deg, #09030f 0%, #120820 35%, #0d1a2a 65%, #09030f 100%)',
  animation: 'aethon-gradient-shift 12s ease infinite',
  zIndex: 100,
  userSelect: 'none',
}

const contentBlock: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 0,
  maxWidth: 480,
  width: '100%',
  padding: '0 24px',
}

const titleStyle: CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: 'clamp(2.2rem, 6vw, 3.6rem)',
  fontWeight: 700,
  letterSpacing: '0.06em',
  color: '#e8c8e0',
  margin: 0,
  textAlign: 'center',
  animation: 'aethon-title-glow 4s ease-in-out infinite',
}

const subtitleStyle: CSSProperties = {
  fontFamily: 'system-ui, sans-serif',
  fontSize: '0.85rem',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'rgba(191, 232, 255, 0.55)',
  marginTop: 8,
  marginBottom: 56,
  textAlign: 'center',
}

const divider: CSSProperties = {
  width: 80,
  height: 1,
  background: 'linear-gradient(90deg, transparent, rgba(232, 200, 224, 0.4), transparent)',
  marginBottom: 48,
}

const buttonBase: CSSProperties = {
  width: 220,
  padding: '13px 0',
  borderRadius: 6,
  border: '1px solid rgba(232, 200, 224, 0.35)',
  background: 'rgba(20, 10, 30, 0.6)',
  color: '#e8c8e0',
  fontSize: '0.95rem',
  fontFamily: 'system-ui, sans-serif',
  letterSpacing: '0.08em',
  cursor: 'pointer',
  transition: 'background 0.2s, border-color 0.2s, color 0.2s',
  outline: 'none',
}

const primaryButton: CSSProperties = {
  ...buttonBase,
  background: 'rgba(80, 30, 90, 0.5)',
  border: '1px solid rgba(232, 200, 224, 0.6)',
  color: '#f0dcf0',
  fontWeight: 600,
}

const secondaryButton: CSSProperties = {
  ...buttonBase,
  marginTop: 14,
  color: 'rgba(191, 232, 255, 0.8)',
  border: '1px solid rgba(191, 232, 255, 0.25)',
}

const flavorStyle: CSSProperties = {
  position: 'absolute',
  bottom: 28,
  left: 0,
  right: 0,
  textAlign: 'center',
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontStyle: 'italic',
  fontSize: '0.8rem',
  color: 'rgba(200, 210, 232, 0.4)',
  letterSpacing: '0.04em',
  animation: 'aethon-pulse 5s ease-in-out infinite',
}

function onHover(e: React.MouseEvent<HTMLButtonElement>, isPrimary: boolean) {
  const el = e.currentTarget
  el.style.background = isPrimary
    ? 'rgba(120, 50, 140, 0.65)'
    : 'rgba(30, 60, 90, 0.55)'
  el.style.borderColor = isPrimary
    ? 'rgba(232, 200, 224, 0.9)'
    : 'rgba(191, 232, 255, 0.5)'
}

function onLeave(e: React.MouseEvent<HTMLButtonElement>, isPrimary: boolean) {
  const el = e.currentTarget
  el.style.background = isPrimary
    ? 'rgba(80, 30, 90, 0.5)'
    : 'rgba(20, 10, 30, 0.6)'
  el.style.borderColor = isPrimary
    ? 'rgba(232, 200, 224, 0.6)'
    : 'rgba(191, 232, 255, 0.25)'
}

export function MainMenuScreen() {
  const startGame = useAppShellStore((s) => s.startGame)
  const showCredits = useAppShellStore((s) => s.showCredits)

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div
        style={overlay}
        className="aethon-main-bg"
        role="main"
        aria-label="Main menu"
      >
        <div style={contentBlock}>
          <h1 style={titleStyle} className="aethon-title">
            Echoes of Aethon
          </h1>
          <p style={subtitleStyle}>A prototype</p>

          <div style={divider} aria-hidden="true" />

          <button
            style={primaryButton}
            onClick={startGame}
            onMouseEnter={(e) => onHover(e, true)}
            onMouseLeave={(e) => onLeave(e, true)}
            aria-label="Begin Journey — start the game"
          >
            Begin Journey
          </button>

          <button
            style={secondaryButton}
            onClick={showCredits}
            onMouseEnter={(e) => onHover(e, false)}
            onMouseLeave={(e) => onLeave(e, false)}
            aria-label="Credits"
          >
            Credits
          </button>
        </div>

        <p style={flavorStyle} className="aethon-flavor" aria-hidden="true">
          A world between echoes awaits…
        </p>
      </div>
    </>
  )
}
