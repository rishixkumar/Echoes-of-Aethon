import { Canvas } from '@react-three/fiber'
import { ObjectiveHud } from '../features/objectives/ObjectiveHud'
import { GameHud } from '../features/ui/GameHud'
import { useAppShellStore } from '../features/ui/appShellStore'
import { CreditsScreen } from '../features/ui/CreditsScreen'
import { MainMenuScreen } from '../features/ui/MainMenuScreen'
import { PauseMenuScreen } from '../features/ui/PauseMenuScreen'
import { PrefsBodySync } from '../features/ui/PrefsBodySync'
import { ShellKeyHandler } from '../features/ui/ShellKeyHandler'
import { PrototypeScene } from '../scenes/PrototypeScene'

export function App() {
  const screen = useAppShellStore((s) => s.screen)

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <PrefsBodySync />
      <Canvas shadows camera={{ position: [3, 2, 4], fov: 50 }}>
        <PrototypeScene />
      </Canvas>
      <ShellKeyHandler />
      {screen === 'playing' && <ObjectiveHud />}
      {screen === 'playing' && <GameHud />}
      {screen === 'main-menu' && <MainMenuScreen />}
      {screen === 'credits' && <CreditsScreen />}
      {screen === 'paused' && <PauseMenuScreen />}
    </div>
  )
}
