import type { CSSProperties } from 'react'
import { OBJECTIVES } from './objectiveRegistry'
import { useObjectiveStore } from './objectiveStore'

const wrap: CSSProperties = {
  position: 'absolute',
  top: 12,
  left: 12,
  maxWidth: 380,
  padding: '10px 12px',
  borderRadius: 8,
  background: 'rgba(10, 12, 18, 0.72)',
  border: '1px solid rgba(232, 236, 245, 0.14)',
  color: 'rgba(232, 236, 245, 0.92)',
  fontSize: 13,
  lineHeight: 1.45,
  pointerEvents: 'none',
  userSelect: 'none',
}

const title: CSSProperties = {
  fontWeight: 700,
  marginBottom: 8,
  letterSpacing: 0.02,
}

const row = (done: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
  opacity: done ? 0.75 : 1,
  textDecoration: done ? 'line-through' : 'none',
  color: done ? 'rgba(180, 200, 230, 0.75)' : 'rgba(232, 236, 245, 0.95)',
})

/**
 * Lightweight objective list for the prototype (single source: objectiveRegistry).
 */
export function ObjectiveHud() {
  const completedById = useObjectiveStore((s) => s.completedById)

  return (
    <div style={wrap}>
      <div style={title}>Objectives</div>
      {OBJECTIVES.map((obj) => {
        const done = Boolean(completedById[obj.id])
        return (
          <div key={obj.id} style={row(done)}>
            <span aria-hidden="true">{done ? '✓' : '○'}</span>
            <span>{obj.title}</span>
          </div>
        )
      })}
    </div>
  )
}
