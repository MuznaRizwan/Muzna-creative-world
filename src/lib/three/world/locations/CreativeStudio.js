import * as THREE from "three";

import { ASSET_PATHS } from "@/constants/assets";
import { PALETTE } from "@/constants/world";

import { jaaliPanel, planter } from "../props/furniture";
import { PAVING_TOP, entranceSign, opening, pavingRect } from "./common";

/**
 * Creative Studio (About Me): an artist's atelier with a north-light sawtooth
 * roof, a giant easel, a sculpture stand and stacked sketchbooks.
 * The building faces east, towards the arrivals from the plaza and Game Dev Zone.
 * @param {import("./common").LocationContext} ctx
 */
export function buildCreativeStudio(ctx) {
  const { kit, textures, media, group, zone } = ctx;
  pavingRect(ctx, 12, 12);
  const y0 = PAVING_TOP;

  // Atelier: 6 × 5 footprint, 3.2 high walls.
  const b = { x: -2.6, z: -1.2, w: 6, d: 5, h: 3.2 };
  const limewash = kit.material("limewash");
  kit.block(group, { w: b.w, h: b.h, d: b.d, mat: limewash, x: b.x, y: y0, z: b.z });
  kit.block(group, { w: b.w + 0.2, h: 0.2, d: b.d + 0.2, mat: kit.material("terracotta"), x: b.x, y: y0 + b.h, z: b.z });
  ctx.collider(b.x, b.z, b.w, b.d, b.h + 1.3);

  // Sawtooth roof: three teeth, glazed vertical faces towards the north.
  const teeth = 3;
  const toothDepth = b.d / teeth;
  const glass = kit.colour("#5C6B8C", { roughness: 0.25 });
  for (let i = 0; i < teeth; i += 1) {
    const z = b.z - b.d / 2 + i * toothDepth;
    group.add(
      kit.mesh(kit.geo.tooth(), kit.material("terracotta"), {
        x: b.x,
        y: y0 + b.h + 0.2,
        z,
        ry: -Math.PI / 2,
        sx: toothDepth,
        sy: 1.1,
        sz: b.w,
      })
    );
    group.add(kit.mesh(kit.geo.plane(), glass, { x: b.x, y: y0 + b.h + 0.75, z: z - 0.01, ry: Math.PI, sx: b.w - 0.3, sy: 0.85, cast: false }));
  }

  // East façade: open door, two windows behind jaali screens.
  const east = b.x + b.w / 2 + 0.03;
  opening(ctx, group, { x: east, y: y0, z: b.z + 0.6, w: 1.6, h: 2.2, ry: Math.PI / 2, lit: true });
  kit.block(group, { w: 0.12, h: 2.35, d: 1.85, mat: kit.material("timber"), x: east + 0.02, y: y0, z: b.z + 0.6 - 1.85 });
  for (const dz of [-1.5]) opening(ctx, group, { x: east, y: y0 + 1.1, z: b.z + dz, w: 1.1, h: 1.2, ry: Math.PI / 2 });
  // South façade windows with jaali screens (patterned shadows inside the courtyard).
  for (const dx of [-1.6, 0.8]) {
    opening(ctx, group, { x: b.x + dx, y: y0 + 0.9, z: b.z + b.d / 2 + 0.03, w: 1.3, h: 1.4 });
    jaaliPanel(kit, textures, group, { x: b.x + dx, y: y0 + 0.85, z: b.z + b.d / 2 + 0.12, w: 1.5, h: 1.5 });
  }

  // Giant easel (≈5 units): the landmark, angled towards the paths.
  const easel = new THREE.Group();
  easel.position.set(2.9, y0, 2.2);
  easel.rotation.y = 0.75;
  group.add(easel);
  const timber = kit.material("timber");
  for (const side of [-1, 1]) {
    kit.block(easel, { w: 0.16, h: 5.3, d: 0.16, mat: timber, x: side * 1.15, z: 0.25, rz: side * -0.08, rx: -0.1 });
  }
  kit.block(easel, { w: 0.14, h: 5, d: 0.14, mat: timber, z: -0.9, rx: 0.22 });
  kit.block(easel, { w: 2.9, h: 0.14, d: 0.4, mat: timber, y: 1.1, z: 0.32 });
  if (media.studioPainting) {
    // Muzna's own acrylic painting (square canvas) on a board sized to it.
    kit.block(easel, { w: 2.8, h: 2.8, d: 0.1, mat: kit.material("paper"), y: 1.2, z: 0.2, rx: -0.1 });
    const canvas = kit.tracker.track(new THREE.MeshStandardMaterial({ color: PALETTE.paper, roughness: 0.85, metalness: 0 }));
    const painting = kit.mesh(kit.geo.plane(), canvas, { y: 2.6, z: 0.42, rx: -0.1, sx: 2.6, sy: 2.6, cast: false });
    painting.userData.dynamic = true; // its texture arrives after the world is built
    easel.add(painting);
    new THREE.TextureLoader().load(ASSET_PATHS.studioPainting, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      kit.tracker.track(texture);
      canvas.color.set("#ffffff");
      canvas.map = texture;
      // A little self-lighting (like a gallery spot) so a dark painting still reads in the scene.
      canvas.emissive.set("#ffffff");
      canvas.emissiveMap = texture;
      canvas.emissiveIntensity = 0.55;
      canvas.needsUpdate = true;
    });
  } else {
    kit.block(easel, { w: 2.7, h: 3.3, d: 0.1, mat: kit.material("paper"), y: 1.2, z: 0.2, rx: -0.1 });
    easel.add(
      kit.mesh(kit.geo.plane(), kit.textured("easel", textures.easelPainting), {
        y: 2.85,
        z: 0.42,
        rx: -0.1,
        sx: 2.5,
        sy: 3.1,
        cast: false,
      })
    );
  }
  ctx.collider(2.9, 2.2, 2.6, 2.0, 5);
  ctx.interactable({ id: "studio-easel", x: 1.6, y: 1.1, z: 3.4 });

  // Sculpture stand: an unfinished low-poly form, wireframe at the top.
  const plinth = { x: 1.3, z: -3.6 };
  kit.block(group, { w: 0.8, h: 1, d: 0.8, mat: kit.material("honey"), x: plinth.x, y: y0, z: plinth.z });
  group.add(kit.mesh(kit.geo.sphere(0), kit.material("clay"), { x: plinth.x, y: y0 + 1.35, z: plinth.z, sx: 0.36, sy: 0.4, sz: 0.36 }));
  const wire = kit.colour(zone.accent, { wireframe: true, emissive: zone.accent, emissiveIntensity: 0.4 });
  const wireMesh = kit.mesh(kit.geo.sphere(1), wire, { x: plinth.x, y: y0 + 1.55, z: plinth.z, sx: 0.42, sy: 0.46, sz: 0.42, cast: false });
  group.add(wireMesh);
  ctx.collider(plinth.x, plinth.z, 0.8, 0.8, 1.8);

  // Stacked sketchbooks against the wall: steps of 0.3 the cat can climb.
  const books = [
    [1.4, 1.0, PALETTE.rose],
    [1.15, 0.85, PALETTE.marigold],
    [0.9, 0.7, PALETTE.inkBlue],
  ];
  books.forEach(([w, d, colour], i) => {
    kit.block(group, { w: /** @type {number} */ (w), h: 0.28, d: /** @type {number} */ (d), mat: kit.colour(/** @type {string} */ (colour)), x: -4.6 + i * 0.12, y: y0 + i * 0.3, z: 2.3 - i * 0.08, ry: i * 0.12 });
    kit.block(group, { w: /** @type {number} */ (w) - 0.08, h: 0.03, d: /** @type {number} */ (d) - 0.02, mat: kit.material("paper"), x: -4.6 + i * 0.12, y: y0 + i * 0.3 + 0.28, z: 2.3 - i * 0.08, ry: i * 0.12, cast: false });
  });
  ctx.collider(-4.5, 2.2, 1.4, 1.0, 0.3);

  // Paint-pot planters with coloured rims.
  [[4.4, -3.8, PALETTE.rose], [4.9, -2.6, PALETTE.marigold], [3.9, -4.8, PALETTE.periwinkle]].forEach(([x, z, colour], i) => {
    planter(kit, group, ctx.instances, { x: /** @type {number} */ (x), z: /** @type {number} */ (z), origin: { x: 0, y: y0, z: 0 }, r: 0.38, plant: i === 1 ? "flower" : "lavender" });
    kit.cylinder(group, { r: 0.44, h: 0.08, mat: kit.colour(/** @type {string} */ (colour)), x: /** @type {number} */ (x), y: 0.42, z: /** @type {number} */ (z), segments: 12, cast: false });
  });

  entranceSign(ctx, { x: 4.6, z: 4.9, ry: 0.6 });
}
