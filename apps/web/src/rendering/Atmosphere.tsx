import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { Color, Fog } from 'three'
import { ATMOSPHERE_CONFIG } from './atmosphereConfig'

export function Atmosphere() {
  const { scene } = useThree()
  const L = ATMOSPHERE_CONFIG.lights

  useEffect(() => {
    scene.background = new Color(ATMOSPHERE_CONFIG.background)
    scene.fog = new Fog(
      ATMOSPHERE_CONFIG.fog.color,
      ATMOSPHERE_CONFIG.fog.near,
      ATMOSPHERE_CONFIG.fog.far,
    )

    return () => {
      scene.fog = null
      scene.background = null
    }
  }, [scene])

  const wf = ATMOSPHERE_CONFIG.worldFill

  return (
    <>
      <ambientLight intensity={L.ambient.intensity} />
      <hemisphereLight
        args={[L.hemisphere.skyColor, L.hemisphere.groundColor, L.hemisphere.intensity]}
      />
      <directionalLight
        position={L.main.position}
        intensity={L.main.intensity}
        color={L.main.color}
      />
      <directionalLight
        position={L.fill.position}
        intensity={L.fill.intensity}
        color={L.fill.color}
      />
      <pointLight
        position={wf.position}
        intensity={wf.intensity}
        distance={wf.distance}
        decay={wf.decay}
        color={wf.color}
      />
    </>
  )
}
