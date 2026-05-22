import { Canvas } from '@react-three/fiber'
import { PrototypeScene } from '../scenes/PrototypeScene'

export function App() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas shadows camera={{ position: [3, 2, 4], fov: 50 }}>
        <PrototypeScene />
      </Canvas>
    </div>
  )
}
