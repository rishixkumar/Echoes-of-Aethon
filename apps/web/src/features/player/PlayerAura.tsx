import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { MathUtils, PointLight } from 'three'
import { PLAYER_AURA_CONFIG } from './playerAuraConfig'

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

type SurgeState = {
  active: boolean
  startedAt: number
  duration: number
  multiplier: number
}

/**
 * Lantern lights — warm core + pink fill, with smooth wave flicker and rare surges.
 */
export function PlayerAura() {
  const coreLightRef = useRef<PointLight>(null)
  const fillLightRef = useRef<PointLight>(null)

  const currentDistanceMultiplier = useRef(1)
  const currentIntensityMultiplier = useRef(1)
  const surgeRef = useRef<SurgeState>({
    active: false,
    startedAt: 0,
    duration: 0,
    multiplier: 1,
  })

  const cfg = PLAYER_AURA_CONFIG
  const flick = cfg.flicker

  useFrame(({ clock }, delta) => {
    const core = coreLightRef.current
    const fill = fillLightRef.current
    if (!core || !fill) return

    const time = clock.elapsedTime
    const dt = delta

    if (!flick.enabled) {
      core.intensity = cfg.coreLight.baseIntensity
      core.distance = cfg.coreLight.baseDistance
      fill.intensity = cfg.fillLight.baseIntensity
      fill.distance = cfg.fillLight.baseDistance
      return
    }

    if (!surgeRef.current.active) {
      const chanceThisFrame = flick.surgeChancePerSecond * dt
      if (Math.random() < chanceThisFrame) {
        surgeRef.current = {
          active: true,
          startedAt: time,
          duration: randomRange(flick.surgeDurationMin, flick.surgeDurationMax),
          multiplier: randomRange(
            flick.surgeDistanceMultiplierMin,
            flick.surgeDistanceMultiplierMax,
          ),
        }
      }
    }

    let surgeMultiplier = 1
    if (surgeRef.current.active) {
      const t = (time - surgeRef.current.startedAt) / surgeRef.current.duration
      if (t >= 1) {
        surgeRef.current.active = false
      } else {
        const pulse = Math.sin(Math.PI * t)
        surgeMultiplier = 1 + (surgeRef.current.multiplier - 1) * pulse
      }
    }

    const wave =
      0.5 +
      0.26 * Math.sin(time * flick.slowWaveSpeed) +
      0.16 * Math.sin(time * flick.mediumWaveSpeed + 1.7) +
      0.08 * Math.sin(time * flick.fastWaveSpeed + 4.1)

    const clampedWave = MathUtils.clamp(wave, 0, 1)

    const normalDistanceMultiplier = MathUtils.lerp(
      flick.normalDistanceMultiplierMin,
      flick.normalDistanceMultiplierMax,
      clampedWave,
    )

    const targetDistanceMultiplier = normalDistanceMultiplier * surgeMultiplier

    const targetIntensityMultiplier = MathUtils.lerp(
      flick.intensityMultiplierMin,
      flick.intensityMultiplierMax,
      clampedWave,
    )

    const alpha = 1 - Math.exp(-flick.smoothing * dt)

    currentDistanceMultiplier.current = MathUtils.lerp(
      currentDistanceMultiplier.current,
      targetDistanceMultiplier,
      alpha,
    )

    currentIntensityMultiplier.current = MathUtils.lerp(
      currentIntensityMultiplier.current,
      targetIntensityMultiplier,
      alpha,
    )

    core.distance =
      cfg.coreLight.baseDistance * currentDistanceMultiplier.current
    core.intensity =
      cfg.coreLight.baseIntensity * currentIntensityMultiplier.current

    fill.distance =
      cfg.fillLight.baseDistance * currentDistanceMultiplier.current
    fill.intensity =
      cfg.fillLight.baseIntensity * currentIntensityMultiplier.current
  })

  return (
    <>
      <pointLight
        ref={coreLightRef}
        position={[0, 1.15, 0]}
        color={cfg.coreLight.color}
        intensity={cfg.coreLight.baseIntensity}
        distance={cfg.coreLight.baseDistance}
        decay={cfg.coreLight.decay}
      />
      <pointLight
        ref={fillLightRef}
        position={[0, 0.45, 0]}
        color={cfg.fillLight.color}
        intensity={cfg.fillLight.baseIntensity}
        distance={cfg.fillLight.baseDistance}
        decay={cfg.fillLight.decay}
      />
      <mesh position={[0.38, 0.95, 0.25]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial
          color="#ffd6a3"
          emissive="#a86830"
          emissiveIntensity={1.8}
        />
      </mesh>
    </>
  )
}
