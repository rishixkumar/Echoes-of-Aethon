/**
 * Volumetric-style mist: soft billboard particles + lantern / body interaction.
 * Tuned for large procedural maps; adjust counts if GPU-bound.
 */
export const MIST_PARTICLE_CONFIG = {
  /** Total GPU points in the mist volume. */
  count: 7200,
  /** Extra meters beyond `mapBounds` on XZ so edges stay hazy. */
  paddingXZ: 10,
  /** Vertical span (meters): low mist near floor, thin ceiling layer. */
  yMin: 0.15,
  yMax: 5.8,
  /** Base fragment alpha scale (multiplied by radial falloff + lantern clear). */
  baseAlpha: 0.16,
  /** Lantern clears mist inside this radius (meters), soft edge to `lanternClearFar`. */
  lanternClearNear: 2.1,
  lanternClearFar: 7.2,
  /** Player torso push: mist is nudged outward in XZ inside this radius. */
  bodyPushRadius: 2.35,
  bodyPushStrength: 0.42,
  /** Wind / swirl amplitudes (meters). */
  windAmplitudeXZ: 0.22,
  windAmplitudeY: 0.1,
} as const
