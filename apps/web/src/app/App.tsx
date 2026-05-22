import { Canvas } from '@react-three/fiber'
import { PrototypeScene } from '../scenes/PrototypeScene'

export function App() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas shadows camera={{ position: [3, 2, 4], fov: 50 }}>
        <PrototypeScene />
      </Canvas>
      <div
        style={{
          position: 'absolute',
          left: 12,
          bottom: 12,
          padding: '8px 10px',
          borderRadius: 8,
          background: 'rgba(10, 12, 18, 0.55)',
          border: '1px solid rgba(232, 236, 245, 0.12)',
          color: 'rgba(232, 236, 245, 0.85)',
          fontSize: 12,
          lineHeight: 1.35,
          maxWidth: 320,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Prototype controls</div>
        <div>WASD — move (camera-relative)</div>
        <div>Mouse — orbit (inspect)</div>
      </div>
    </div>
  )
}
