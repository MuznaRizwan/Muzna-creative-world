import * as THREE from "three";

import { PALETTE } from "@/constants/world";
import { PATHS, ZONES } from "@/data/worldLayout";

import { heightAt, tierIndexAt } from "../terrain";

const SAMPLE_SPACING = 0.4;
const LAMP_SPACING = 6;

/**
 * @typedef {object} PathSample
 * @property {number} x @property {number} z @property {number} halfWidth
 */

/**
 * Sample every path curve on the ground plane.
 * @returns {{ id: string, width: number, samples: { x: number, z: number, tx: number, tz: number }[] }[]}
 */
export function samplePaths() {
  return PATHS.map((path) => {
    const curve = new THREE.CatmullRomCurve3(path.points.map(([x, z]) => new THREE.Vector3(x, 0, z)));
    const count = Math.max(2, Math.ceil(curve.getLength() / SAMPLE_SPACING));
    const samples = [];
    for (let i = 0; i <= count; i += 1) {
      const t = i / count;
      const p = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      samples.push({ x: p.x, z: p.z, tx: tangent.x, tz: tangent.z });
    }
    return { id: path.id, width: path.width, samples };
  });
}

/**
 * Point inside a zone footprint (plus margin)?
 * @param {number} x @param {number} z @param {number} margin
 */
export function isInZone(x, z, margin = 0) {
  return ZONES.some((zone) => {
    const dx = x - zone.x;
    const dz = z - zone.z;
    const f = zone.footprint;
    if (f.type === "circle") return Math.hypot(dx, dz) < (f.radius ?? 0) + margin;
    return Math.abs(dx) < (f.width ?? 0) / 2 + margin && Math.abs(dz) < (f.depth ?? 0) / 2 + margin;
  });
}

/**
 * Ribbon geometry along samples, lifted onto each terrace.
 * @param {{ x: number, z: number, tx: number, tz: number }[]} samples
 * @param {number} width
 * @param {number} lift
 */
function ribbon(samples, width, lift) {
  const positions = [];
  const uvs = [];
  const indices = [];
  let distance = 0;
  samples.forEach((s, i) => {
    if (i > 0) distance += Math.hypot(s.x - samples[i - 1].x, s.z - samples[i - 1].z);
    const nx = -s.tz;
    const nz = s.tx;
    const y = heightAt(s.x, s.z) + lift;
    positions.push(s.x + (nx * width) / 2, y, s.z + (nz * width) / 2, s.x - (nx * width) / 2, y, s.z - (nz * width) / 2);
    uvs.push(0, distance / width, 1, distance / width);
    if (i > 0) {
      const a = (i - 1) * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  // Ribbons must face up regardless of winding.
  const normals = geometry.attributes.normal;
  for (let i = 0; i < normals.count; i += 1) normals.setXYZ(i, 0, 1, 0);
  return geometry;
}

/**
 * Paths with kerb edging, steps where they cross a terrace, and lamp posts
 * with district banners that announce the next location.
 * @param {import("../kit").Kit} kit
 * @param {import("../instances").InstanceBuckets} instances
 * @param {ReturnType<typeof samplePaths>} sampled
 * @param {(collider: { x: number, z: number, w: number, d: number, h: number, y?: number }) => void} addCollider
 */
export function createPaths(kit, instances, sampled, addCollider) {
  const group = new THREE.Group();
  group.name = "paths";
  const pathParts = [];
  const kerbParts = [];

  for (const path of sampled) {
    pathParts.push(ribbon(path.samples, path.width, 0.035));
    kerbParts.push(ribbon(path.samples, path.width + 0.5, 0.025));

    // Steps where the path climbs onto the next terrace (each 0.15: the cat walks up).
    for (let i = 1; i < path.samples.length; i += 1) {
      const a = path.samples[i - 1];
      const b = path.samples[i];
      const tierA = tierIndexAt(a.x, a.z);
      const tierB = tierIndexAt(b.x, b.z);
      if (tierA === tierB) continue;
      const low = heightAt(a.x, a.z) < heightAt(b.x, b.z) ? a : b;
      const high = low === a ? b : a;
      const dirX = high.x - low.x;
      const dirZ = high.z - low.z;
      const length = Math.hypot(dirX, dirZ) || 1;
      const cx = (a.x + b.x) / 2 - (dirX / length) * 0.35;
      const cz = (a.z + b.z) / 2 - (dirZ / length) * 0.35;
      const lowY = heightAt(low.x, low.z);
      kit.block(group, {
        w: path.width + 0.5,
        h: 0.15 + 0.035,
        d: 0.8,
        mat: kit.material("kerb"),
        x: cx,
        y: lowY,
        z: cz,
        ry: Math.atan2(dirX, dirZ),
      });
    }

    // Lamp posts alternate sides along the way, skipped inside locations.
    let travelled = 0;
    let side = 1;
    for (let i = 1; i < path.samples.length; i += 1) {
      const s = path.samples[i];
      travelled += Math.hypot(s.x - path.samples[i - 1].x, s.z - path.samples[i - 1].z);
      if (travelled < LAMP_SPACING) continue;
      travelled = 0;
      const offset = path.width / 2 + 0.6;
      const nx = -s.tz * side;
      const nz = s.tx * side;
      const lx = s.x + nx * offset;
      const lz = s.z + nz * offset;
      side = -side;
      if (isInZone(lx, lz, 0.6)) continue;
      addLamp(instances, lx, lz, s.tx, s.tz, -nx, -nz);
      addCollider({ x: lx, z: lz, w: 0.3, d: 0.3, h: 2.4 });
    }
  }

  const { tracker } = kit;
  const merge = (/** @type {THREE.BufferGeometry[]} */ parts) => {
    const positions = [];
    const uvs = [];
    const indices = [];
    let offset = 0;
    for (const part of parts) {
      const p = part.attributes.position.array;
      const u = part.attributes.uv.array;
      positions.push(...p);
      uvs.push(...u);
      const index = /** @type {THREE.BufferAttribute} */ (part.index).array;
      for (let i = 0; i < index.length; i += 1) indices.push(index[i] + offset);
      offset += part.attributes.position.count;
      part.dispose();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    const normals = new Float32Array(positions.length);
    for (let i = 1; i < normals.length; i += 3) normals[i] = 1;
    geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
    geometry.setIndex(indices);
    return tracker.track(geometry);
  };

  const paths = new THREE.Mesh(merge(pathParts), kit.material("path"));
  paths.receiveShadow = true;
  paths.name = "path-surface";
  const kerbs = new THREE.Mesh(merge(kerbParts), kit.material("kerb"));
  kerbs.receiveShadow = true;
  kerbs.name = "path-kerbs";
  group.add(kerbs, paths);
  return group;
}

/**
 * Lamp post with a warm lantern; near a location it carries that district's banner.
 * @param {import("../instances").InstanceBuckets} instances
 * @param {number} x @param {number} z
 * @param {number} tx @param {number} tz Path direction.
 * @param {number} px @param {number} pz Direction from the lamp towards the path.
 */
function addLamp(instances, x, z, tx, tz, px, pz) {
  const y = heightAt(x, z);
  instances.add("lampPost", x, y + 1.1, z, { size: [0.07, 2.2, 0.07] });
  instances.add("lampHead", x, y + 2.35, z, { size: [0.26, 0.32, 0.26] });

  let colour = PALETTE.marigold;
  let best = 15;
  for (const zone of ZONES) {
    const d = Math.hypot(zone.x - x, zone.z - z);
    if (d < best) {
      best = d;
      colour = zone.accent;
    }
  }
  // Banner hangs on the path side of the post and faces along the path.
  instances.add("banner", x + px * 0.24, y + 1.6, z + pz * 0.24, {
    ry: Math.atan2(tx, tz),
    size: [0.34, 0.8, 1],
    color: colour,
  });
}
