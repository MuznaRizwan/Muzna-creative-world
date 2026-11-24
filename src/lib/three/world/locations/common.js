import * as THREE from "three";

import { createNameBoard } from "../props/signage";

/**
 * @typedef {object} LocationContext
 * @property {import("../kit").Kit} kit
 * @property {import("../textures").Textures} textures
 * @property {import("@/constants/assets").MediaFlags} media  Which optional media files exist (cinema screen).
 * @property {import("@/data/worldLayout").Zone} zone
 * @property {THREE.Group} group        Root group placed at the zone centre (local origin on the terrace).
 * @property {{ x: number, y: number, z: number }} origin  World position of the local origin.
 * @property {(type: import("../instances").InstanceType, x: number, y: number, z: number, options?: import("../instances").InstanceOptions) => void} instance  Add an instance at local coordinates.
 * @property {{ add: (type: import("../instances").InstanceType, x: number, y: number, z: number, options?: import("../instances").InstanceOptions) => void }} instances  Same, shaped like InstanceBuckets for prop helpers.
 * @property {(x: number, z: number, w: number, d: number, h: number, y?: number) => void} collider  Register an axis-aligned collision box (local).
 * @property {(spec: { id: string, x: number, y: number, z: number }) => void} interactable  Place an interactable from data/interactables.js at this point (local).
 * @property {(update: (delta: number, elapsed: number, camera: THREE.Camera) => void) => void} animate  Per-frame update for dynamic objects.
 * @property {(spec: { x: number, z: number, angle: number, length: number, width: number, y: number }) => void} walkway  Walkable deck beyond the boundary (local start point, world angle).
 */

/** Paving surface height above the terrace. */
export const PAVING_TOP = 0.06;

/**
 * Round paved floor with an accent border.
 * @param {LocationContext} ctx
 * @param {number} radius
 * @param {THREE.Material} [surface]
 */
export function pavingCircle(ctx, radius, surface) {
  const { kit, group, zone } = ctx;
  kit.cylinder(group, { r: radius, h: 0.08, mat: kit.material("kerb"), y: -0.02, segments: 48, cast: false });
  group.add(
    kit.mesh(kit.geo.disc(48), surface ?? kit.material("path"), { y: PAVING_TOP + 0.002, sx: radius - 0.25, sz: radius - 0.25, cast: false })
  );
  const border = kit.geometry(`border:${radius}`, () => new THREE.RingGeometry(radius - 0.55, radius - 0.3, 64).rotateX(-Math.PI / 2));
  group.add(kit.mesh(border, kit.colour(zone.accent), { y: PAVING_TOP + 0.004, cast: false }));
}

/**
 * Rectangular paved floor with an accent border.
 * @param {LocationContext} ctx
 * @param {number} width
 * @param {number} depth
 * @param {THREE.Material} [surface]
 */
export function pavingRect(ctx, width, depth, surface) {
  const { kit, group, zone } = ctx;
  kit.block(group, { w: width, h: 0.08, d: depth, mat: kit.material("kerb"), y: -0.02, cast: false });
  group.add(
    kit.mesh(kit.geo.plane(), surface ?? kit.material("path"), {
      y: PAVING_TOP + 0.002,
      rx: -Math.PI / 2,
      sx: width - 0.5,
      sy: depth - 0.5,
      cast: false,
    })
  );
  const accent = kit.colour(zone.accent);
  const inset = 0.42;
  for (const [x, z, w, d] of [
    [0, -depth / 2 + inset, width - 2 * inset, 0.2],
    [0, depth / 2 - inset, width - 2 * inset, 0.2],
    [-width / 2 + inset, 0, 0.2, depth - 2 * inset],
    [width / 2 - inset, 0, 0.2, depth - 2 * inset],
  ]) {
    group.add(kit.mesh(kit.geo.plane(), accent, { x, z, y: PAVING_TOP + 0.004, rx: -Math.PI / 2, sx: w, sy: d, cast: false }));
  }
}

/**
 * Location name board.
 * @param {LocationContext} ctx
 * @param {{ x: number, z: number, ry?: number, width?: number, text?: string }} options
 */
export function entranceSign(ctx, { x, z, ry = 0, width, text }) {
  const board = createNameBoard(ctx.kit, ctx.textures, {
    text: text ?? ctx.zone.name,
    accent: ctx.zone.accent,
    width,
    x,
    y: PAVING_TOP,
    z,
    ry,
  });
  ctx.group.add(board);
  ctx.collider(x, z, 0.6, 0.6, 1.9);
  return board;
}

/**
 * Gable roof (triangular prism) on top of a block.
 * @param {LocationContext} ctx
 * @param {THREE.Object3D} parent
 * @param {{ x?: number, y: number, z?: number, w: number, h: number, d: number, ry?: number, mat?: THREE.Material }} options
 */
export function gableRoof(ctx, parent, { x = 0, y, z = 0, w, h, d, ry = 0, mat }) {
  const roof = ctx.kit.mesh(ctx.kit.geo.prism(), mat ?? ctx.kit.material("terracotta"), { x, y, z, ry, sx: w, sy: h, sz: d });
  parent.add(roof);
  return roof;
}

/**
 * Door or window opening drawn as a dark (or warmly lit) panel on a façade.
 * @param {LocationContext} ctx
 * @param {THREE.Object3D} parent
 * @param {{ x?: number, y?: number, z?: number, w: number, h: number, ry?: number, lit?: boolean }} options
 */
export function opening(ctx, parent, { x = 0, y = 0, z = 0, w, h, ry = 0, lit = false }) {
  const material = ctx.kit.material(lit ? "warmOpening" : "opening");
  const panel = ctx.kit.mesh(ctx.kit.geo.box(), material, { x, y: y + h / 2, z, ry, sx: w, sy: h, sz: 0.06, cast: false });
  parent.add(panel);
  return panel;
}
