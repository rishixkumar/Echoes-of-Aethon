import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { MathUtils, PerspectiveCamera, Vector3 } from 'three'
import { getThirdPersonCameraObstructionRects } from '../collision/staticColliders'
import { usePlayerStore } from '../player/playerStore'
import { resolveThirdPersonCameraCollision } from './cameraCollision'
import { CAMERA_CONFIG } from './cameraConfig'
import { useCameraInput } from './cameraInput'
import { useCameraStore } from './cameraStore'
import { lerpAngle, smoothstep } from './useGameCamera'

const idealPos = new Vector3()
const idealLook = new Vector3()
const fromPos = new Vector3()
const fromLook = new Vector3()
const toPos = new Vector3()
const toLook = new Vector3()

const tpNormalDesired = new Vector3()
const tpNormalLook = new Vector3()
const tpTopDesired = new Vector3()
const tpTopLook = new Vector3()

type FpIdeal = { pos: Vector3; look: Vector3; fov: number }
type TpIdeal = { pos: Vector3; look: Vector3; fov: number }

function computeFirstPersonIdeal(
  px: number,
  py: number,
  pz: number,
  yaw: number,
  fov: number,
  out: FpIdeal,
): void {
  const fp = CAMERA_CONFIG.firstPerson
  const sinY = Math.sin(yaw)
  const cosY = Math.cos(yaw)
  const fwdX = sinY
  const fwdZ = cosY
  out.pos.set(
    px + fwdX * fp.forwardOffset,
    py + fp.height,
    pz + fwdZ * fp.forwardOffset,
  )
  out.look.copy(out.pos).add(new Vector3(fwdX, 0, fwdZ))
  out.fov = fov
}

type TpMeta = {
  collisionDesired: number
  collisionSafe: number
  isObstructed: boolean
  severe: boolean
}

function computeThirdPersonIdeal(
  px: number,
  py: number,
  pz: number,
  yaw: number,
  dist: number,
  obstructionBlend: number,
  out: TpIdeal,
): TpMeta {
  const tp = CAMERA_CONFIG.thirdPerson
  const fb = tp.obstructionFallback
  const sinY = Math.sin(yaw)
  const cosY = Math.cos(yaw)
  const fwdX = sinY
  const fwdZ = cosY
  const bx = -fwdX
  const bz = -fwdZ
  const rx = Math.cos(yaw)
  const rz = -sinY

  const rects = getThirdPersonCameraObstructionRects()

  tpNormalDesired.set(
    px + bx * dist + rx * tp.shoulderOffsetX,
    py + fb.normalHeight,
    pz + bz * dist + rz * tp.shoulderOffsetX,
  )
  tpNormalLook.set(px, py + fb.normalLookAtHeight, pz)

  const normalCol = resolveThirdPersonCameraCollision({
    lookTarget: tpNormalLook,
    desiredCameraPosition: tpNormalDesired,
    rectColliders: rects,
    padding: tp.wallPadding,
    collisionMinDistance: tp.collisionMinDistance,
  })

  const ratio =
    normalCol.desiredDistance > 1e-6
      ? normalCol.safeDistance / normalCol.desiredDistance
      : 1
  const severe =
    fb.enabled &&
    normalCol.isObstructed &&
    ratio < fb.obstructionThreshold

  tpTopDesired.set(
    px + bx * fb.topDownDistance,
    py + fb.topDownHeight,
    pz + bz * fb.topDownDistance,
  )
  tpTopLook.set(px, py + fb.topDownLookAtHeight, pz)

  const topCol = resolveThirdPersonCameraCollision({
    lookTarget: tpTopLook,
    desiredCameraPosition: tpTopDesired,
    rectColliders: rects,
    padding: tp.wallPadding,
    collisionMinDistance: tp.collisionMinDistance,
  })

  out.pos.copy(normalCol.position).lerp(topCol.position, obstructionBlend)
  out.look.copy(tpNormalLook).lerp(tpTopLook, obstructionBlend)
  out.fov = tp.defaultFov

  return {
    collisionDesired: normalCol.desiredDistance,
    collisionSafe: normalCol.safeDistance,
    isObstructed: normalCol.isObstructed,
    severe,
  }
}

function thirdPersonContextActive(
  mode: string,
  tr: { isTransitioning: boolean; fromMode: string; toMode: string },
): boolean {
  if (mode === 'third-person') return true
  if (!tr.isTransitioning) return false
  return tr.fromMode === 'third-person' || tr.toMode === 'third-person'
}

/**
 * Drives the R3F camera from player position, mode, yaw, zoom, and smoothing (no OrbitControls).
 */
export function GameCamera() {
  const { camera } = useThree()
  const turnRef = useCameraInput()
  const smoothedPos = useRef(new Vector3())
  const smoothedLook = useRef(new Vector3())
  const smoothedFov = useRef<number>(CAMERA_CONFIG.thirdPerson.defaultFov)
  const obstructionBlend = useRef(0)
  const first = useRef(true)
  const fpScratch = useRef<FpIdeal>({
    pos: new Vector3(),
    look: new Vector3(),
    fov: 65,
  })
  const tpScratch = useRef<TpIdeal>({
    pos: new Vector3(),
    look: new Vector3(),
    fov: 58,
  })
  const hudPrev = useRef({ label: 'none' as 'none' | 'mild' | 'severe', blend: 0 })

  useFrame((_, delta) => {
    const turn = turnRef.current
    const st = useCameraStore.getState()
    const yawTargetNext =
      st.yawTarget + turn * CAMERA_CONFIG.rotationSpeed * delta
    const alphaR =
      1 - Math.exp(-CAMERA_CONFIG.smoothing.rotation * delta)
    const yawNext = lerpAngle(st.yaw, yawTargetNext, alphaR)
    useCameraStore.getState().setYawSmoothing(yawNext, yawTargetNext)

    const [px, py, pz] = usePlayerStore.getState().playerPosition
    const mode = useCameraStore.getState().mode
    const yaw = useCameraStore.getState().yaw
    const tr = useCameraStore.getState().transition
    const fpFov = useCameraStore.getState().firstPersonFov
    const tpDist = useCameraStore.getState().thirdPersonDistance

    const fpIdeal = fpScratch.current
    const tpIdeal = tpScratch.current

    computeFirstPersonIdeal(px, py, pz, yaw, fpFov, fpIdeal)

    const fb = CAMERA_CONFIG.thirdPerson.obstructionFallback
    const tpActive = thirdPersonContextActive(mode, tr)

    if (tpActive) {
      let tpMeta = computeThirdPersonIdeal(
        px,
        py,
        pz,
        yaw,
        tpDist,
        obstructionBlend.current,
        tpIdeal,
      )

      const targetBlend = tpMeta.severe ? 1 : 0
      const blendSpeed =
        targetBlend > obstructionBlend.current
          ? fb.blendSpeedIn
          : fb.blendSpeedOut
      const alphaB = 1 - Math.exp(-blendSpeed * delta)
      obstructionBlend.current +=
        (targetBlend - obstructionBlend.current) * alphaB

      tpMeta = computeThirdPersonIdeal(
        px,
        py,
        pz,
        yaw,
        tpDist,
        obstructionBlend.current,
        tpIdeal,
      )

      let label: 'none' | 'mild' | 'severe' = 'none'
      if (!tpMeta.isObstructed) label = 'none'
      else if (tpMeta.severe) label = 'severe'
      else label = 'mild'
      const blendHud = obstructionBlend.current
      if (
        label !== hudPrev.current.label ||
        Math.abs(blendHud - hudPrev.current.blend) > 0.02
      ) {
        hudPrev.current = { label, blend: blendHud }
        useCameraStore.getState().setCameraDebugHud(label, blendHud)
      }
    } else {
      const alphaB = 1 - Math.exp(-fb.blendSpeedOut * delta)
      obstructionBlend.current +=
        (0 - obstructionBlend.current) * alphaB
      if (
        hudPrev.current.label !== 'none' ||
        Math.abs(obstructionBlend.current) > 0.02
      ) {
        hudPrev.current = { label: 'none', blend: 0 }
        useCameraStore.getState().setCameraDebugHud('none', 0)
      }
    }

    let fovIdeal: number

    if (tr.isTransitioning) {
      const rawTr = (performance.now() - tr.startedAt) / (tr.duration * 1000)
      const stTr = smoothstep(Math.min(rawTr, 1))

      if (tr.fromMode === 'first-person') {
        computeFirstPersonIdeal(px, py, pz, yaw, fpFov, fpIdeal)
        fromPos.copy(fpIdeal.pos)
        fromLook.copy(fpIdeal.look)
      } else {
        computeThirdPersonIdeal(
          px,
          py,
          pz,
          yaw,
          tpDist,
          obstructionBlend.current,
          tpIdeal,
        )
        fromPos.copy(tpIdeal.pos)
        fromLook.copy(tpIdeal.look)
      }

      if (tr.toMode === 'first-person') {
        computeFirstPersonIdeal(px, py, pz, yaw, fpFov, fpIdeal)
        toPos.copy(fpIdeal.pos)
        toLook.copy(fpIdeal.look)
      } else {
        computeThirdPersonIdeal(
          px,
          py,
          pz,
          yaw,
          tpDist,
          obstructionBlend.current,
          tpIdeal,
        )
        toPos.copy(tpIdeal.pos)
        toLook.copy(tpIdeal.look)
      }

      const fromFov =
        tr.fromMode === 'first-person'
          ? fpFov
          : CAMERA_CONFIG.thirdPerson.defaultFov
      const toFov =
        tr.toMode === 'first-person'
          ? fpFov
          : CAMERA_CONFIG.thirdPerson.defaultFov

      idealPos.copy(fromPos).lerp(toPos, stTr)
      idealLook.copy(fromLook).lerp(toLook, stTr)
      fovIdeal = MathUtils.lerp(fromFov, toFov, stTr)

      if (camera instanceof PerspectiveCamera) {
        camera.fov = fovIdeal
        camera.updateProjectionMatrix()
      }

      if (rawTr >= 1) {
        useCameraStore.getState().completeTransition()
        smoothedFov.current = fovIdeal
      }
    } else {
      const alphaF =
        1 -
        Math.exp(-CAMERA_CONFIG.transition.fovSmoothing * delta)
      if (mode === 'first-person') {
        idealPos.copy(fpIdeal.pos)
        idealLook.copy(fpIdeal.look)
        fovIdeal = fpFov
        smoothedFov.current += (fovIdeal - smoothedFov.current) * alphaF
        if (camera instanceof PerspectiveCamera) {
          camera.fov = smoothedFov.current
          camera.updateProjectionMatrix()
        }
      } else {
        idealPos.copy(tpIdeal.pos)
        idealLook.copy(tpIdeal.look)
        fovIdeal = CAMERA_CONFIG.thirdPerson.defaultFov
        smoothedFov.current += (fovIdeal - smoothedFov.current) * alphaF
        if (camera instanceof PerspectiveCamera) {
          camera.fov = smoothedFov.current
          camera.updateProjectionMatrix()
        }
      }
    }

    const posSmooth = tr.isTransitioning
      ? CAMERA_CONFIG.transition.positionSmoothing
      : CAMERA_CONFIG.smoothing.position
    const alphaP = 1 - Math.exp(-posSmooth * delta)

    if (first.current) {
      smoothedPos.current.copy(idealPos)
      smoothedLook.current.copy(idealLook)
      camera.position.copy(idealPos)
      camera.lookAt(idealLook)
      first.current = false
      return
    }

    smoothedPos.current.lerp(idealPos, alphaP)
    smoothedLook.current.lerp(idealLook, alphaP)
    camera.position.copy(smoothedPos.current)
    camera.lookAt(smoothedLook.current)
  })

  return null
}
