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

/** Level-design metrics for the future cat (see the Phase 2 creative direction). */
export const CAT_METRICS = Object.freeze({
  height: 1,
  length: 1.1,
  width: 0.4,
  collisionRadius: 0.4,
  stepHeight: 0.35,
  jumpApex: 0.9,
  minDoorWidth: 1.4,
  interactRadius: 2,
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
