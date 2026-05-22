import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { Color, Fog } from 'three'
import { ATMOSPHERE_CONFIG } from './atmosphereConfig'

export function Atmosphere() {
  const { scene } = useThree()

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

  return (
    <>
      <ambientLight intensity={ATMOSPHERE_CONFIG.ambientLight.intensity} />
      <hemisphereLight
        args={[
          ATMOSPHERE_CONFIG.hemisphereLight.skyColor,
          ATMOSPHERE_CONFIG.hemisphereLight.groundColor,
          ATMOSPHERE_CONFIG.hemisphereLight.intensity,
        ]}
      />
      <directionalLight
        position={ATMOSPHERE_CONFIG.moonLight.position}
        intensity={ATMOSPHERE_CONFIG.moonLight.intensity}
        color={ATMOSPHERE_CONFIG.moonLight.color}
      />
    </>
  )
}
