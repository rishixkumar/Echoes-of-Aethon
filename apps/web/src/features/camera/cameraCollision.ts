import { Vector3 } from 'three'
import type { RectCollider } from '../collision/collisionTypes'
import type { CameraCollisionResult } from './cameraTypes'

/**
 * Clip segment p0→p1 (param u∈[0,1], p(u)=p0+u*(p1-p0)) to scalar slab [minV, maxV].
 * Returns u-interval within [0,1] where the segment lies inside the slab, or null if disjoint.
 */
function clipSlab1D(
  p0: number,
  p1: number,
  minV: number,
  maxV: number,
): [number, number] | null {
  const d = p1 - p0
  let u0 = 0
  let u1 = 1
  if (Math.abs(d) < 1e-10) {
    if (p0 < minV || p0 > maxV) return null
    return [u0, u1]
  }
  const inv = 1 / d
  let t0 = (minV - p0) * inv
  let t1 = (maxV - p0) * inv
  if (t0 > t1) [t0, t1] = [t1, t0]
  u0 = Math.max(u0, t0)
  u1 = Math.min(u1, t1)
  if (u0 > u1) return null
  return [u0, u1]
}

/** Overlap of segment (ax,az)→(bx,bz) with XZ rect in u∈[0,1]. */
function segmentOverlapRectXZ(
  ax: number,
  az: number,
  bx: number,
  bz: number,
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number,
): { u0: number; u1: number } | null {
  const xClip = clipSlab1D(ax, bx, minX, maxX)
  if (!xClip) return null
  const zClip = clipSlab1D(az, bz, minZ, maxZ)
  if (!zClip) return null
  const u0 = Math.max(0, xClip[0], zClip[0])
  const u1 = Math.min(1, xClip[1], zClip[1])
  if (u0 > u1) return null
  return { u0, u1 }
}

function rectXzBounds(rect: RectCollider) {
  const [cx, , cz] = rect.position
  const [fw, fd] = rect.size
  const hx = fw / 2
  const hz = fd / 2
  return {
    minX: cx - hx,
    maxX: cx + hx,
    minZ: cz - hz,
    maxZ: cz + hz,
  }
}

/**
 * Pulls the third-person camera toward `lookTarget` when the segment to the desired eye
 * intersects wall (XZ) footprints. Only `kind: 'rect'` entries are used.
 */
export function resolveThirdPersonCameraCollision({
  lookTarget,
  desiredCameraPosition,
  rectColliders,
  padding,
  collisionMinDistance,
}: {
  lookTarget: Vector3
  desiredCameraPosition: Vector3
  rectColliders: readonly RectCollider[]
  padding: number
  collisionMinDistance: number
}): CameraCollisionResult {
  const desiredDistance = lookTarget.distanceTo(desiredCameraPosition)
  if (desiredDistance < 1e-6) {
    return {
      position: desiredCameraPosition.clone(),
      desiredDistance,
      safeDistance: desiredDistance,
      isObstructed: false,
    }
  }

  const ax = lookTarget.x
  const az = lookTarget.z
  const bx = desiredCameraPosition.x
  const bz = desiredCameraPosition.z

  let uMax = 1

  for (const rect of rectColliders) {
    if (rect.kind !== 'rect') continue
    const { minX, maxX, minZ, maxZ } = rectXzBounds(rect)
    const clip = segmentOverlapRectXZ(ax, az, bx, bz, minX, maxX, minZ, maxZ)
    if (!clip) continue

    const { u0, u1 } = clip
    if (u1 < 0 || u0 > 1) continue

    const uEnter = Math.max(0, u0)
    if (uEnter > 1) continue

    const hitDist = uEnter * desiredDistance
    const allowedDist = Math.max(collisionMinDistance, hitDist - padding)
    const uAllowed = allowedDist / desiredDistance
    uMax = Math.min(uMax, uAllowed)
  }

  const uFinal = Math.max(0, Math.min(1, uMax))
  const position = lookTarget
    .clone()
    .lerpVectors(lookTarget, desiredCameraPosition, uFinal)
  const safeDistance = lookTarget.distanceTo(position)
  const isObstructed = safeDistance < desiredDistance - 1e-3

  return {
    position,
    desiredDistance,
    safeDistance,
    isObstructed,
  }
}
