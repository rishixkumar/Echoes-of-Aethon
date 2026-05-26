import type { CSSProperties } from 'react'
import { useAppShellStore } from './appShellStore'

const CREDITS_LIST = [
  'Game Design & Development',
  'Echoes of Aethon Team',
  '',
  'Built with React Three Fiber',
  'Three.js · Zustand · Vite',
]

const KEYFRAMES = `
@keyframes aethon-credits-fadein {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .aethon-credits-overlay { animation: none !important; }
}
`

const overlay: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(9, 3, 15, 0.97)',
  zIndex: 100,
  animation: 'aethon-credits-fadein 0.3s ease-out both',
}

const panel: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: 440,
  width: '100%',
  padding: '0 24px',
}

const headingStyle: CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '2.2rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  color: '#e8c8e0',
  margin: '0 0 36px',
  textAlign: 'center',
  textShadow: '0 0 28px rgba(232, 200, 224, 0.35)',
}

const creditsDivider: CSSProperties = {
  width: 60,
  height: 1,
  background: 'linear-gradient(90deg, transparent, rgba(191, 232, 255, 0.3), transparent)',
  margin: '8px 0',
}

const creditsLineStyle: CSSProperties = {
  fontFamily: 'system-ui, sans-serif',
  fontSize: '0.9rem',
  color: 'rgba(200, 220, 245, 0.75)',
  textAlign: 'center',
  lineHeight: 1.9,
  letterSpacing: '0.03em',
}

const techLineStyle: CSSProperties = {
  ...creditsLineStyle,
  color: 'rgba(191, 232, 255, 0.55)',
  fontSize: '0.82rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  letterSpacing: '0.01em',
}

const backButton: CSSProperties = {
  marginTop: 44,
  padding: '12px 36px',
  borderRadius: 6,
  border: '1px solid rgba(191, 232, 255, 0.3)',
  background: 'rgba(20, 10, 30, 0.5)',
  color: 'rgba(191, 232, 255, 0.8)',
  fontSize: '0.9rem',
  fontFamily: 'system-ui, sans-serif',
  letterSpacing: '0.08em',
  cursor: 'pointer',
  transition: 'background 0.2s, border-color 0.2s',
  outline: 'none',
}

function onHover(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.background = 'rgba(20, 50, 80, 0.6)'
  e.currentTarget.style.borderColor = 'rgba(191, 232, 255, 0.6)'
}
function onLeave(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.background = 'rgba(20, 10, 30, 0.5)'
  e.currentTarget.style.borderColor = 'rgba(191, 232, 255, 0.3)'
}

export function CreditsScreen() {
  const backToMenu = useAppShellStore((s) => s.backToMenu)

  const dividerIndex = CREDITS_LIST.indexOf('')

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div
        style={overlay}
        className="aethon-credits-overlay"
        role="main"
        aria-label="Credits"
      >
        <div style={panel}>
          <h1 style={headingStyle}>Credits</h1>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {CREDITS_LIST.map((line, i) => {
              if (line === '') {
                return <div key={i} style={creditsDivider} aria-hidden="true" />
              }
              const isTechLine = i > dividerIndex
              return (
                <p key={i} style={isTechLine ? techLineStyle : creditsLineStyle}>
                  {line}
                </p>
              )
            })}
          </div>

          <button
            style={backButton}
            onClick={backToMenu}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            autoFocus
            aria-label="Back to main menu"
          >
            Back
          </button>
        </div>
      </div>
    </>
  )
}
