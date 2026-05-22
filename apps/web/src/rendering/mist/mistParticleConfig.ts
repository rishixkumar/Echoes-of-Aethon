/**
 * Ground-hugging mist: many small, soft sprites with slow wind (vertex) and
 * noise-modulated alpha (fragment). Tune here before touching shaders.
 */
export const MIST_PARTICLE_CONFIG = {
  /** GPU points (many small quads read smoother than few large ones). */
  count: 11000,
  paddingXZ: 10,
  /** Most samples stay low; exponent biases height toward the floor. */
  yMin: 0.08,
  yMax: 3.25,
  /** Vertical bias exponent: higher = more mist near the floor. */
  yBiasExponent: 3.4,
  /** Base alpha (fragment also applies noise + radial softening). */
  baseAlpha: 0.085,
  lanternClearNear: 2.0,
  lanternClearFar: 7.0,
  bodyPushRadius: 2.35,
  bodyPushStrength: 0.38,
  /** World-space wind amplitudes (meters); visible drift at eye height. */
  windAmplitudeXZ: 0.52,
  windAmplitudeY: 0.22,
} as const
