import * as THREE from "three";

import { PALETTE } from "@/constants/world";

/**
 * Small reusable props built from the shared kit. All helpers add to `parent`
 * at local coordinates and return the created group.
 */

/** @typedef {import("../kit").Kit} Kit */

/**
 * @param {THREE.Object3D} parent
 * @param {number} x @param {number} z @param {number} [ry]
 */
function placed(parent, x, z, ry = 0) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = ry;
  parent.add(group);
  return group;
}

/** Timber bench (seat at 0.45: an easy hop for the cat). @param {Kit} kit @param {THREE.Object3D} parent @param {number} x @param {number} z @param {number} [ry] */
export function bench(kit, parent, x, z, ry = 0) {
  const g = placed(parent, x, z, ry);
  const timber = kit.material("timber");
  const iron = kit.material("iron");
  kit.block(g, { w: 1.8, h: 0.08, d: 0.5, mat: timber, y: 0.42 });
  kit.block(g, { w: 1.8, h: 0.35, d: 0.07, mat: timber, y: 0.55, z: -0.24 });
  for (const sx of [-0.75, 0.75]) kit.block(g, { w: 0.08, h: 0.42, d: 0.45, mat: iron, x: sx });
  return g;
}

/** Terracotta planter; flowers or lavender are added as instances. @param {Kit} kit @param {THREE.Object3D} parent @param {import("../instances").InstanceBuckets} instances @param {{ x: number, z: number, origin: { x: number, y: number, z: number }, r?: number, plant?: "lavender" | "flower" }} options */
export function planter(kit, parent, instances, { x, z, origin, r = 0.45, plant = "lavender" }) {
  kit.cylinder(parent, { r, h: 0.45, mat: kit.material("terracotta"), taper: 1.15, x, z, segments: 12 });
  const count = plant === "lavender" ? 7 : 6;
  for (let i = 0; i < count; i += 1) {
    const a = (i / count) * Math.PI * 2;
    const rr = i === 0 ? 0 : r * 0.55;
    const px = origin.x + x + Math.cos(a) * rr;
    const pz = origin.z + z + Math.sin(a) * rr;
    instances.add("shrub", px, origin.y + 0.5, pz, { size: [0.2, 0.18, 0.2], color: PALETTE.meadowShade });
    instances.add(plant, px, origin.y + 0.72, pz, {
      size: plant === "lavender" ? [0.1, 0.2, 0.1] : [0.09, 0.09, 0.09],
      color: plant === "lavender" ? PALETTE.lavenderFlower : PALETTE.bougainvillea,
    });
  }
}

/** Notice board on two posts. @param {Kit} kit @param {THREE.Object3D} parent @param {number} x @param {number} z @param {number} [ry] */
export function noticeBoard(kit, parent, x, z, ry = 0) {
  const g = placed(parent, x, z, ry);
  for (const sx of [-0.7, 0.7]) kit.block(g, { w: 0.1, h: 1.6, d: 0.1, mat: kit.material("timberDark"), x: sx });
  kit.block(g, { w: 1.6, h: 0.95, d: 0.08, mat: kit.colour("#B98A5E"), y: 0.6 });
  const notes = [PALETTE.paper, PALETTE.lavenderBand, PALETTE.marigold, PALETTE.paper, PALETTE.rose];
  notes.forEach((colour, i) => {
    g.add(
      kit.mesh(kit.geo.plane(), kit.colour(colour), {
        x: -0.5 + (i % 3) * 0.5,
        y: 0.85 + Math.floor(i / 3) * -0.4 + 0.15,
        z: 0.045,
        rz: (i - 2) * 0.05,
        sx: 0.36,
        sy: 0.3,
        cast: false,
      })
    );
  });
  return g;
}

/** Table with legs. @param {Kit} kit @param {THREE.Object3D} parent @param {{ x: number, z: number, ry?: number, w?: number, d?: number, h?: number, mat?: THREE.Material }} options */
export function table(kit, parent, { x, z, ry = 0, w = 1.6, d = 0.8, h = 0.85, mat }) {
  const g = placed(parent, x, z, ry);
  const top = mat ?? kit.material("timber");
  kit.block(g, { w, h: 0.07, d, mat: top, y: h - 0.07 });
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      kit.block(g, { w: 0.07, h: h - 0.07, d: 0.07, mat: kit.material("timberDark"), x: sx * (w / 2 - 0.08), z: sz * (d / 2 - 0.08) });
    }
  }
  return g;
}

/** Flat jaali (pierced lattice) panel that casts patterned shadows. @param {Kit} kit @param {import("../textures").Textures} textures @param {THREE.Object3D} parent @param {{ x: number, y: number, z: number, w: number, h: number, ry?: number }} options */
export function jaaliPanel(kit, textures, parent, { x, y, z, w, h, ry = 0 }) {
  const material = kit.textured("jaali", textures.jaali, {
    alphaTest: 0.5,
    side: THREE.DoubleSide,
    color: PALETTE.limewash,
  });
  const map = /** @type {THREE.Texture} */ (material.map);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  const geometry = kit.geometry(`jaaliPlane:${w}:${h}`, () => {
    const g = new THREE.PlaneGeometry(w, h);
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i += 1) uv.setXY(i, uv.getX(i) * w * 1.2, uv.getY(i) * h * 1.2);
    return g;
  });
  const panel = kit.mesh(geometry, material, { x, y: y + h / 2, z, ry, receive: true });
  parent.add(panel);
  return panel;
}

/** Bougainvillea clump draped over an edge (instanced). @param {import("../instances").InstanceBuckets} instances @param {{ x: number, y: number, z: number }} at World position. @param {number} spread @param {number} seed */
export function bougainvillea(instances, at, spread, seed) {
  for (let i = 0; i < 6; i += 1) {
    const a = seed * 1.7 + i * 1.1;
    const r = (i % 3) * spread * 0.35;
    instances.add("bougainvillea", at.x + Math.cos(a) * r, at.y - (i % 2) * 0.25, at.z + Math.sin(a) * r, {
      scale: 0.32 + (i % 3) * 0.06,
      color: i % 4 === 0 ? PALETTE.meadowShade : PALETTE.bougainvillea,
    });
  }
}
