import { Canvas } from '@react-three/fiber'
import { ObjectiveHud } from '../features/objectives/ObjectiveHud'
import { GameHud } from '../features/ui/GameHud'
import { PrototypeScene } from '../scenes/PrototypeScene'

export function App() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas shadows camera={{ position: [3, 2, 4], fov: 50 }}>
        <PrototypeScene />
      </Canvas>
      <ObjectiveHud />
      <GameHud />
    </div>
  )
}
