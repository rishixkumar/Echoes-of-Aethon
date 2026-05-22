import { Cloud, Clouds } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import { CLOUD_FOG_CONFIG } from './cloudFogConfig'

type MapBoundsXZ = Readonly<{
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}>

type CloudFogVolumeProps = Readonly<{
  mapBounds: MapBoundsXZ
}>

/**
 * Drei <Cloud> layers — the main visual source of cloud-shaped fog volume.
 * Ground layer (y≈0.35) is heaviest; upper layers fade to background haze.
 */
export function CloudFogVolume({ mapBounds }: CloudFogVolumeProps) {
  if (!CLOUD_FOG_CONFIG.enabled) return null

  const { centerX, centerZ, width, depth } = useMemo(() => {
    const pad = CLOUD_FOG_CONFIG.bounds.xPadding
    const padZ = CLOUD_FOG_CONFIG.bounds.zPadding
    return {
      centerX: (mapBounds.minX + mapBounds.maxX) / 2,
      centerZ: (mapBounds.minZ + mapBounds.maxZ) / 2,
      width: mapBounds.maxX - mapBounds.minX + pad * 2,
      depth: mapBounds.maxZ - mapBounds.minZ + padZ * 2,
    }
  }, [mapBounds.minX, mapBounds.maxX, mapBounds.minZ, mapBounds.maxZ])

  return (
    <Clouds material={THREE.MeshBasicMaterial} renderOrder={5}>
      {CLOUD_FOG_CONFIG.layers.map((layer, index) => (
        <Cloud
          key={layer.id}
          seed={CLOUD_FOG_CONFIG.seed + index * 17}
          position={[centerX, layer.positionY, centerZ]}
          bounds={[width, layer.boundsHeight, depth]}
          volume={layer.volume}
          color={layer.color}
          opacity={layer.opacity}
          speed={layer.speed}
          growth={layer.growth}
          segments={layer.segments}
          fade={80}
        />
      ))}
    </Clouds>
  )
}
