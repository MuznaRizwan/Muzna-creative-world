import * as THREE from "three";

import { WORLD } from "@/constants/world";

/**
 * Island shape and terrace heights. These functions are pure maths so the
 * custom physics (later) can use the same ground definition as the visuals.
 */

/** @param {number} a @param {number} b */
function angleDifference(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/**
 * Radius of the grass edge in a given direction (angle = atan2(z, x)).
 * @param {number} angle
 */
export function islandRadius(angle) {
  let r =
    WORLD.islandBaseRadius +
    1.6 * Math.sin(3 * angle + 0.6) +
    1.1 * Math.sin(5 * angle + 2.1) +
    0.6 * Math.sin(9 * angle + 0.3);
  const d = angleDifference(angle, WORLD.headlandAngle);
  r += WORLD.headlandBulge * Math.exp(-(d * d) / 0.06);
  return r;
}

/**
 * Is (x, z) on the grass, at least `margin` inside the edge?
 * @param {number} x @param {number} z @param {number} [margin]
 */
export function isOnIsland(x, z, margin = 0) {
  return Math.hypot(x, z) < islandRadius(Math.atan2(z, x)) - margin;
}

/**
 * Terrace index at (x, z): 0 (south) … 3 (north-west headland).
 * @param {number} x @param {number} z
 */
export function tierIndexAt(x, z) {
  const tiers = WORLD.tiers;
  const t3 = tiers[3];
  if (t3.zBelow !== undefined && t3.xBelow !== undefined && z < t3.zBelow && x < t3.xBelow) return 3;
  if (tiers[2].zBelow !== undefined && z < tiers[2].zBelow) return 2;
  if (tiers[1].zBelow !== undefined && z < tiers[1].zBelow) return 1;
  return 0;
}

/**
 * Ground height of the walkable surface (terraces are flat; steps are 0.3).
 * @param {number} x @param {number} z
 */
export function heightAt(x, z) {
  return WORLD.tiers[tierIndexAt(x, z)].height;
}

/**
 * Sample the island outline as points, optionally pushed outwards.
 * @param {number} [offset] @param {number} [segments]
 * @returns {{ x: number, z: number }[]}
 */
export function islandOutline(offset = 0, segments = 180) {
  const points = [];
  for (let i = 0; i < segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2;
    const r = islandRadius(angle) + offset;
    points.push({ x: Math.cos(angle) * r, z: Math.sin(angle) * r });
  }
  return points;
}

/**
 * Sutherland–Hodgman clip of a polygon against `point[axis] < limit`.
 * @param {{ x: number, z: number }[]} points
 * @param {"x" | "z"} axis
 * @param {number} limit
 */
function clipBelow(points, axis, limit) {
  /** @type {{ x: number, z: number }[]} */
  const out = [];
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const aIn = a[axis] < limit;
    const bIn = b[axis] < limit;
    if (aIn) out.push(a);
    if (aIn !== bIn) {
      const t = (limit - a[axis]) / (b[axis] - a[axis]);
      out.push({ x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t });
    }
  }
  return out;
}

/**
 * Outline of terrace `index` (the island clipped by that tier's limits).
 * @param {number} index
 */
export function tierOutline(index) {
  let points = islandOutline();
  const tier = WORLD.tiers[index];
  if (tier.zBelow !== undefined) points = clipBelow(points, "z", tier.zBelow);
  if (tier.xBelow !== undefined) points = clipBelow(points, "x", tier.xBelow);
  return points;
}

/**
 * Extrude a ground-plane polygon into a slab between two heights, with a
 * small bevel so terrace edges catch the light.
 * @param {{ x: number, z: number }[]} points
 * @param {number} bottom
 * @param {number} top
 * @param {number} [bevel]
 */
export function slabGeometry(points, bottom, top, bevel = 0.05) {
  const shape = new THREE.Shape(points.map((p) => new THREE.Vector2(p.x, -p.z)));
  const depth = Math.max(0.01, top - bottom - bevel * 2);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: -bevel,
    bevelSegments: 1,
    curveSegments: 1,
  });
  // Shape XY → ground XZ; extrusion → +Y.
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, bottom + bevel, 0);
  return geometry;
}
