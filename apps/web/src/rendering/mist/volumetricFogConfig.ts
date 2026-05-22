/**
 * Vertical haze curtains — background depth only. Very low alpha.
 * Individual planes should not be readable as rectangles.
 */
export const VOLUMETRIC_FOG_CONFIG = {
  enabled: true,

  debug: {
    showFogCurtains: true,
    forceHighVisibility: false,
  },

  count: 18,

  height: {
    min: 0.35,
    max: 1.8,
  },

  scale: {
    minWidth: 10,
    maxWidth: 22,
    minHeight: 1.2,
    maxHeight: 2.8,
  },

  alpha: {
    min: 0.004,
    max: 0.012,
  },

  color: {
    primary: '#3a1535',
    secondary: '#2e1028',
  },

  noise: {
    scaleMin: 0.1,
    scaleMax: 0.22,
    speedMin: -0.018,
    speedMax: 0.022,
  },

  drift: {
    speed: 0.05,
    amplitude: 0.4,
  },

  playerClear: {
    radius: 1.0,
    softness: 2.8,
    minimumFogNearPlayer: 0.82,
  },

  mapPadding: 10,
} as const
