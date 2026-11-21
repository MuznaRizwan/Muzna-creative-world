/**
 * World-wide constants for the 3D environment. Units are metres-ish: 1 unit is
 * roughly the cat's height, and every space is sized for a four-legged character.
 */

/** Island shape, terrace heights and water levels. North is −z. */
export const WORLD = Object.freeze({
  islandBaseRadius: 39,
  /** Direction of the north-west headland that carries the Contact Station. */
  headlandAngle: Math.atan2(-31, -14),
  headlandBulge: 3,
  beachWidth: 3.5,
  /** Distance of the boundary wall inside the grass edge. */
  wallInset: 0.9,
  waterLevel: -0.35,
  beachLevel: -0.15,
  /**
   * Terraces rise toward the north in steps the cat climbs automatically.
   * A tier applies where z < zBelow (and x < xBelow when given).
   */
  tiers: Object.freeze([
    Object.freeze({ height: 0 }),
    Object.freeze({ height: 0.3, zBelow: 19.75 }),
    Object.freeze({ height: 0.6, zBelow: -6 }),
    Object.freeze({ height: 0.9, zBelow: -25.5, xBelow: -6 }),
  ]),
  spawn: Object.freeze({ x: 0, z: 31 }),
});

/**
 * Cat metrics. Phase 2 planned a cat about 1 unit tall; next to the world's
 * benches, lamps and signs the real model read too small at that size, so it
 * stands 1.6 to the ear tips. Collision, steps, jump, reach, speeds and the
 * camera are all sized from these values.
 */
export const CAT_METRICS = Object.freeze({
  height: 1.6,
  length: 2.3,
  width: 0.64,
  /** The body is two circles of this radius, ±bodyOffset along the spine. */
  collisionRadius: 0.42,
  bodyOffset: 0.5,
  stepHeight: 0.4,
  jumpApex: 1.2,
  minDoorWidth: 1.4,
  interactRadius: 2.4,
});

/**
 * Player controller tuning. Speeds are in units per second. The running clip
 * carries root motion of 13.1 model units per cycle: 7.75 units/s at the
 * cat's world scale, where the run clip plays at normal speed. The walking clip
 * has none; by paw travel per second it is ~0.46× the run, ~3.4 units/s.
 * Playback speed follows the actual speed, so the chosen speeds (a little below
 * those) play the clips at ~0.85–0.9×.
 */
export const CAT_PLAYER = Object.freeze({
  /** Physics runs at a fixed 60 Hz; rendering interpolates between steps. */
  fixedStep: 1 / 60,
  maxSubSteps: 5,
  walkSpeed: 2.9,
  /** Ground speed the walking clip's stride matches at normal playback speed. */
  walkClipSpeed: 3.4,
  runSpeed: 7.0,
  backSpeed: 1.3,
  /** Exponential approach rate towards the target speed (1/s). */
  acceleration: 9,
  deceleration: 12,
  /** Turning (radians per second, and how fast that rate is reached). */
  turnSpeed: 2.7,
  runTurnSpeed: 2.2,
  turnAcceleration: 14,
  /** Turn rate used when facing an object before interacting. */
  faceSpeed: 6,
  gravity: 20,
  /** √(2 · gravity · jumpApex) ≈ 6.9. */
  jumpVelocity: 7,
  /** Grace periods that make jumping feel forgiving. */
  coyoteTime: 0.1,
  jumpBuffer: 0.12,
  /** How far inside a box footprint the centre must be before it stands on it. */
  supportMargin: 0.25,
  /** Lower than this and the cat respawns at the spawn point. */
  fallLimit: -5,
});

/**
 * Third-person follow camera. Phase 2 approved an offset of 4.5 up and 6.5
 * behind; with the real cat (0.95 tall) that framed it too small, so the boom
 * is shorter and lower, looking further ahead to keep the path in view.
 */
export const CAT_CAMERA = Object.freeze({
  distance: 6.6,
  height: 4.0,
  /** The boom starts here above the cat's feet (about its shoulders). */
  pivotHeight: 1.2,
  /** Look-at point: above the cat and ahead of it. */
  lookHeight: 1.1,
  lookAhead: 2.8,
  /** Smoothing rates (1/s): position, heading, and pulling in on collision. */
  followRate: 6,
  yawRate: 3.2,
  collisionRate: 18,
  /** Keep this far in front of a wall the camera would otherwise enter. */
  collisionPadding: 0.35,
  minDistance: 2.2,
  /** Never closer to the ground than this. */
  groundClearance: 0.7,
  /** Seconds to blend from the dev camera into the follow position. */
  blendTime: 0.9,
});

/** World palette (golden hour). Interface colours live in globals.css. */
export const PALETTE = Object.freeze({
  zenith: "#6F7BD0",
  lavenderBand: "#BFA3E0",
  horizon: "#F4C59E",
  sun: "#FFE0A8",
  haze: "#E7C7C2",
  shadowTint: "#5A4C7A",
  meadow: "#A3B26B",
  meadowShade: "#6E8456",
  earth: "#B39069",
  beach: "#E9D3A8",
  sandstone: "#E6CFA6",
  kerb: "#C7AC82",
  honey: "#D9B77E",
  limewash: "#F1E6D2",
  terracotta: "#C4673F",
  terracottaDeep: "#8F452B",
  timber: "#7D5238",
  timberDark: "#5A3A28",
  iron: "#3B3542",
  lagoon: "#7FB2BF",
  lagoonDeep: "#3F6F86",
  shallows: "#A5D2D2",
  verdigris: "#5FA39A",
  brass: "#C9A24A",
  lamp: "#FFD27A",
  bougainvillea: "#C2367A",
  truckTeal: "#1E8C8C",
  marigold: "#E9A93B",
  lavenderFlower: "#9A7FC8",
  paper: "#F4EFE6",
  ink: "#2B2733",
  inkBlue: "#46598C",
  crimson: "#A83A4B",
  periwinkle: "#7F88E0",
  coral: "#E8664F",
  postRed: "#C8423A",
  rose: "#E07AA0",
});

/** Rendering limits and budgets. */
export const RENDER = Object.freeze({
  maxPixelRatio: 2,
  /** Longest frame step the simulation accepts, in seconds. */
  maxDelta: 0.1,
  shadowMapSize: 2048,
  shadowMapSizeMobile: 1024,
  fogNear: 70,
  fogFar: 250,
});
