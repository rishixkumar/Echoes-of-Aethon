import type { Vector3 } from 'three'

export type CameraMode = 'first-person' | 'third-person'

export type CameraCollisionResult = {
  position: Vector3
  desiredDistance: number
  safeDistance: number
  isObstructed: boolean
}
