import { Html } from '@react-three/drei'

export type WorldLabelProps = Readonly<{
  text: string
  position?: readonly [number, number, number]
  variant?: 'name' | 'prompt' | 'player'
  visible?: boolean
}>

const VARIANT_DISTANCE: Record<NonNullable<WorldLabelProps['variant']>, number> = {
  name: 12,
  prompt: 10,
  player: 11,
}

/**
 * Billboard-style world text via Drei `<Html sprite />` — camera-facing, anchored in world space.
 */
export function WorldLabel({
  text,
  position = [0, 0, 0],
  variant = 'name',
  visible = true,
}: WorldLabelProps) {
  if (!visible) return null

  const distanceFactor = VARIANT_DISTANCE[variant]

  return (
    <Html position={[...position]} center sprite distanceFactor={distanceFactor}>
      <div
        className={`worldLabel worldLabel--${variant}${
          variant === 'player' ? ' player-label' : ''
        }`}
      >
        {text}
      </div>
    </Html>
  )
}
