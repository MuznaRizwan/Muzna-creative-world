/**
 * Layout of Muzna's Creative World: where each portfolio location sits on the
 * island, how paths connect them, and where signposts stand.
 *
 * Coordinates are world units on the ground plane (x east, z south; north is −z).
 * The visitor spawns at the south gate and the terraces rise toward the north.
 * This file is shared by the 3D engine and (later) the React navigation/minimap.
 */

/**
 * @typedef {object} ZoneFootprint
 * @property {"circle" | "rect"} type
 * @property {number} [radius]
 * @property {number} [width]
 * @property {number} [depth]
 */

/**
 * @typedef {object} Zone
 * @property {string} id
 * @property {string} name
 * @property {string} section    Portfolio section the location will open later.
 * @property {number} x
 * @property {number} z
 * @property {ZoneFootprint} footprint
 * @property {string} accent     District accent colour.
 * @property {string} landmark
 * @property {{ yaw: number, distance: number, height: number }} view  Dev camera framing.
 */

/** @type {readonly Zone[]} */
export const ZONES = Object.freeze([
  {
    id: "plaza",
    name: "Welcome Plaza",
    section: "home",
    x: 0,
    z: 27,
    footprint: { type: "circle", radius: 7 },
    accent: "#E9A93B",
    landmark: "Signpost Tree",
    view: { yaw: 0.5, distance: 17, height: 10 },
  },
  {
    id: "studio",
    name: "Creative Studio",
    section: "about",
    x: -22,
    z: 13.5,
    footprint: { type: "rect", width: 12, depth: 12 },
    accent: "#E07AA0",
    landmark: "Giant easel",
    view: { yaw: 0.85, distance: 17, height: 10 },
  },
  {
    id: "lab",
    name: "Technology Lab",
    section: "skills",
    x: 22,
    z: 13.5,
    footprint: { type: "rect", width: 12, depth: 12 },
    accent: "#5FA39A",
    landmark: "Glasshouse",
    view: { yaw: -0.6, distance: 17, height: 10 },
  },
  {
    id: "gamedev",
    name: "Game Dev Zone",
    section: "projects",
    x: 0,
    z: 4,
    footprint: { type: "circle", radius: 7.5 },
    accent: "#A97FD8",
    landmark: "Arcade Hall",
    view: { yaw: 0.25, distance: 20, height: 11 },
  },
  {
    id: "campus",
    name: "University Campus",
    section: "education",
    x: -22,
    z: -14,
    footprint: { type: "rect", width: 12, depth: 12 },
    accent: "#46598C",
    landmark: "Clock tower",
    view: { yaw: 0.55, distance: 19, height: 11 },
  },
  {
    id: "cinema",
    name: "Cinema",
    section: "video",
    x: 0,
    z: -18,
    footprint: { type: "circle", radius: 6.5 },
    accent: "#A83A4B",
    landmark: "Open-air screen",
    view: { yaw: 0.15, distance: 18, height: 9 },
  },
  {
    id: "ai",
    name: "AI Station",
    section: "chat",
    x: 22,
    z: -14,
    footprint: { type: "rect", width: 12, depth: 12 },
    accent: "#7F88E0",
    landmark: "Observatory",
    view: { yaw: -0.5, distance: 17, height: 10 },
  },
  {
    id: "contact",
    name: "Contact Station",
    section: "contact",
    x: -14,
    z: -31,
    footprint: { type: "circle", radius: 4.5 },
    accent: "#E8664F",
    landmark: "Lighthouse",
    view: { yaw: 0.9, distance: 19, height: 11 },
  },
]);

/** @type {Readonly<Record<string, Zone>>} */
export const ZONE_BY_ID = Object.freeze(Object.fromEntries(ZONES.map((zone) => [zone.id, zone])));

/**
 * Walkable paths as smooth curves through [x, z] points. The boulevard is
 * 4 units wide, side lanes 3 units (7–10 cat widths).
 * @type {readonly { id: string, width: number, points: [number, number][] }[]}
 */
export const PATHS = Object.freeze([
  { id: "boulevard-south", width: 4, points: [[0, 34.5], [0, 27], [0, 19], [0, 11]] },
  { id: "boulevard-north", width: 4, points: [[3, -2.6], [3.4, -7], [2, -10.5], [0, -12]] },
  { id: "plaza-studio", width: 3, points: [[-5, 23], [-11, 20.6], [-16.2, 18.8]] },
  { id: "plaza-lab", width: 3, points: [[5, 23], [11, 20.6], [16.2, 18.8]] },
  { id: "studio-gamedev", width: 3, points: [[-16.2, 10.8], [-11, 8.4], [-7, 6]] },
  { id: "lab-gamedev", width: 3, points: [[16.2, 10.8], [11, 8.4], [7, 6]] },
  { id: "studio-campus", width: 3, points: [[-22, 7.6], [-22.6, 0], [-22, -7.8]] },
  { id: "lab-ai", width: 3, points: [[22, 7.6], [22.6, 0], [22, -7.8]] },
  { id: "campus-cinema", width: 3, points: [[-16.2, -15], [-11, -17.2], [-6.3, -19]] },
  { id: "ai-cinema", width: 3, points: [[16.2, -15], [11, -17.2], [6.3, -19]] },
  { id: "campus-contact", width: 3, points: [[-20, -20.2], [-18.6, -24], [-16.4, -27.2]] },
  { id: "cinema-contact", width: 3, points: [[-6.6, -21.2], [-8.6, -25], [-10.6, -28.9]] },
]);

/**
 * Junction signposts. Each arrow points at a zone.
 * @type {readonly { x: number, z: number, targets: string[] }[]}
 */
export const SIGNPOSTS = Object.freeze([
  { x: 6.6, z: -7.2, targets: ["cinema", "ai", "gamedev"] },
  { x: -19.8, z: 0.8, targets: ["campus", "studio"] },
  { x: 19.8, z: 0.8, targets: ["ai", "lab"] },
  { x: -5.8, z: -26.4, targets: ["contact", "cinema"] },
  { x: 3.6, z: 18.6, targets: ["gamedev", "plaza"] },
]);

/**
 * Hand-placed trees that frame districts (from the creative direction map).
 * Invalid positions (on paths or footprints) are skipped by the scatterer.
 * @type {readonly [number, number][]}
 */
export const LANDMARK_TREES = Object.freeze([
  [-9, 16.5], [-7.5, 14.5], [9, 16.5], [7.5, 14.5],
  [-29, 2], [-27, -2.5], [29, 2], [27.2, -2.5],
  [-11, -7.5], [11, -7.5], [13, -28], [19, -25],
  [-29, -6], [29.5, -6], [-12, 32], [12, 32],
]);
