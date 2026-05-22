/**
 * Long, low cloud-streak planes — the visible rolling fog banks near the floor.
 * Higher alpha than curtains; their stacked+drifting nature creates cloud shapes.
 */
export const ROLLING_FOG_BANDS_CONFIG = {
  enabled: true,

  debug: {
    showRollingBands: true,
    forceHighVisibility: false,
  },

  count: 26,

  y: {
    min: 0.16,
    max: 0.62,
  },

  width: {
    min: 20,
    max: 42,
  },

  depth: {
    min: 4,
    max: 9,
  },

  alpha: {
    min: 0.055,
    max: 0.12,
  },

  color: {
    primary: '#7c3563',
    secondary: '#5a2448',
  },

  noise: {
    scaleMin: 0.09,
    scaleMax: 0.18,
    speedMin: 0.018,
    speedMax: 0.045,
  },

  drift: {
    speed: 0.055,
    amplitude: 0.65,
  },

  playerClear: {
    radius: 1.0,
    softness: 2.8,
    minimumFogNearPlayer: 0.85,
  },

  mapPadding: 8,
} as const
