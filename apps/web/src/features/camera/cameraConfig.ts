export const CAMERA_CONFIG = {
  modeToggleKey: 'KeyC',

  zoomInKey: 'Comma',
  zoomOutKey: 'Period',

  /** Max yaw rate (rad/s) when A/D held; actual rate eases toward this. */
  rotationSpeed: 2.4,

  /** Cap `delta` for turn integration to avoid spikes after tab switch / hitch. */
  maxTurnDeltaSeconds: 0.05,

  smoothing: {
    position: 14,
    /** Angular-velocity ease: higher = snappier spin-up/down; lower = smoother. */
    rotation: 9,
    fov: 10,
  },

  transition: {
    duration: 0.4,
    positionSmoothing: 24,
    fovSmoothing: 18,
  },

  firstPerson: {
    height: 1.15,
    forwardOffset: 0.08,

    minFov: 45,
    maxFov: 80,
    defaultFov: 65,
    fovStep: 3,
  },

  thirdPerson: {
    height: 2.1,
    lookAtHeight: 0.95,

    minDistance: 2.4,
    maxDistance: 8.5,
    defaultDistance: 5.2,
    distanceStep: 0.45,

    shoulderOffsetX: 0.35,

    wallPadding: 0.25,
    collisionMinDistance: 1.2,

    defaultFov: 58,

    obstructionFallback: {
      enabled: true,
      obstructionThreshold: 0.55,
      normalHeight: 2.1,
      normalLookAtHeight: 0.95,
      topDownHeight: 6.5,
      topDownDistance: 2.2,
      topDownLookAtHeight: 0.4,
      blendSpeedIn: 10,
      blendSpeedOut: 6,
    },
  },
} as const
