import * as THREE from "three";

import { PALETTE } from "@/constants/world";

import { noticeBoard } from "../props/furniture";
import { PAVING_TOP, entranceSign, gableRoof, opening, pavingCircle } from "./common";

/**
 * Contact Station: a coral-and-cream lighthouse on the north-west headland
 * (the tallest landmark, a nod to Karachi's harbour), a small post office, a
 * red post box and a pier out over the lagoon.
 * @param {import("./common").LocationContext} ctx
 * @param {{ pierAngle: number }} options World angle (atan2) pointing out to sea.
 */
export function buildContactStation(ctx, { pierAngle }) {
  const { kit, group } = ctx;
  pavingCircle(ctx, 4.5);
  const y0 = PAVING_TOP;

  // Lighthouse: four tapered bands, gallery, lantern room and cap (≈13 units).
  const lh = { x: -1.6, z: -1.2 };
  const bands = 4;
  const bandHeight = 2.5;
  let radius = 1.4;
  for (let i = 0; i < bands; i += 1) {
    const next = radius - 0.11;
    kit.cylinder(group, {
      r: radius,
      taper: next / radius,
      h: bandHeight,
      mat: kit.material(i % 2 ? "limewash" : "coral"),
      x: lh.x,
      y: y0 + i * bandHeight,
      z: lh.z,
      segments: 28,
    });
    radius = next;
  }
  const galleryY = y0 + bands * bandHeight;
  kit.cylinder(group, { r: 1.35, h: 0.18, mat: kit.material("iron"), x: lh.x, y: galleryY, z: lh.z, segments: 28 });
  const railing = kit.geometry("railing", () => new THREE.TorusGeometry(1.3, 0.035, 6, 36).rotateX(Math.PI / 2));
  group.add(kit.mesh(railing, kit.material("iron"), { x: lh.x, y: galleryY + 0.75, z: lh.z, cast: false }));
  kit.cylinder(group, { r: 0.8, h: 1.3, mat: kit.material("lanternGlass"), x: lh.x, y: galleryY + 0.18, z: lh.z, segments: 16, cast: false });
  group.add(kit.mesh(kit.geo.cone(16), kit.material("postRed"), { x: lh.x, y: galleryY + 1.48 + 0.45, z: lh.z, sx: 1.0, sy: 0.9, sz: 1.0 }));
  kit.cylinder(group, { r: 0.06, h: 0.5, mat: kit.material("brass"), x: lh.x, y: galleryY + 2.38, z: lh.z, segments: 6, cast: false });
  opening(ctx, group, { x: lh.x + Math.sin(0.7) * 1.41, y: y0, z: lh.z + Math.cos(0.7) * 1.41, w: 1.0, h: 1.9, ry: 0.7, lit: true });
  ctx.collider(lh.x, lh.z, 2.8, 2.8, 13);

  // Sweeping beam (additive cone, dim: atmosphere, not a laser).
  const beam = new THREE.Group();
  beam.position.set(lh.x, galleryY + 0.85, lh.z);
  beam.userData.dynamic = true;
  const beamMaterial = kit.colour(PALETTE.lamp, {
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    emissive: PALETTE.lamp,
    emissiveIntensity: 0.6,
  });
  const beamGeometry = kit.geometry("beam", () => new THREE.ConeGeometry(2.4, 16, 20, 1, true).rotateZ(Math.PI / 2).translate(8, 0, 0));
  beam.add(kit.mesh(beamGeometry, beamMaterial, { cast: false, receive: false }));
  group.add(beam);
  ctx.animate((_delta, elapsed) => {
    beam.rotation.y = elapsed * 0.35;
  });

  // Post office hut.
  const post = { x: 2.2, z: -1.0 };
  kit.block(group, { w: 2.3, h: 2.0, d: 1.9, mat: kit.material("limewash"), x: post.x, y: y0, z: post.z });
  gableRoof(ctx, group, { x: post.x, y: y0 + 2.0, z: post.z, w: 2.6, h: 0.9, d: 2.2, ry: Math.PI / 2 });
  opening(ctx, group, { x: post.x, y: y0, z: post.z + 0.98, w: 0.9, h: 1.7, lit: true });
  kit.block(group, { w: 1.4, h: 0.32, d: 0.06, mat: kit.material("coral"), x: post.x, y: y0 + 1.95, z: post.z + 0.99 });
  ctx.collider(post.x, post.z, 2.3, 1.9, 2.9);

  // Red post box: the contact interaction point.
  const box = { x: 1.1, z: 1.9 };
  kit.cylinder(group, { r: 0.3, h: 1.05, mat: kit.material("postRed"), x: box.x, y: y0, z: box.z, segments: 16 });
  group.add(kit.mesh(kit.geo.sphere(1), kit.material("postRed"), { x: box.x, y: y0 + 1.05, z: box.z, sx: 0.3, sy: 0.18, sz: 0.3 }));
  kit.block(group, { w: 0.34, h: 0.05, d: 0.04, mat: kit.material("ink"), x: box.x, y: y0 + 0.8, z: box.z + 0.29, cast: false });
  ctx.collider(box.x, box.z, 0.7, 0.7, 1.25);
  ctx.interactable({ id: "contact-postbox", x: box.x + 0.9, y: 1.1, z: box.z + 0.6 });

  noticeBoard(kit, group, -2.9, 2.0, 0.6);
  ctx.collider(-2.9, 2.0, 1.6, 0.8, 1.6);

  // Pier out to sea: planks on posts, continuing the terrace level.
  const pier = new THREE.Group();
  const outX = Math.cos(pierAngle);
  const outZ = Math.sin(pierAngle);
  pier.position.set(outX * 4.2, 0, outZ * 4.2);
  pier.rotation.y = Math.atan2(outX, outZ);
  group.add(pier);
  const pierLength = 10;
  // The deck is walkable: it extends the cat's walkable area through the wall gap.
  ctx.walkway({ x: outX * 4.2, z: outZ * 4.2, angle: pierAngle, length: pierLength + 0.25, width: 2.2, y: y0 + 0.02 });
  for (let i = 0; i < pierLength / 0.32; i += 1) {
    kit.block(pier, { w: 2.2, h: 0.08, d: 0.27, mat: kit.material(i % 3 ? "timber" : "timberDark"), y: y0 - 0.06, z: 0.2 + i * 0.32 });
  }
  for (let i = 0; i <= pierLength; i += 2.5) {
    for (const dx of [-1.05, 1.05]) {
      kit.block(pier, { w: 0.16, h: 2.2, d: 0.16, mat: kit.material("timberDark"), x: dx, y: y0 - 2.1, z: 0.2 + i });
    }
  }
  kit.block(pier, { w: 0.08, h: 0.7, d: 0.08, mat: kit.material("timberDark"), x: 0.95, y: y0, z: pierLength });
  kit.block(pier, { w: 0.08, h: 0.7, d: 0.08, mat: kit.material("timberDark"), x: -0.95, y: y0, z: pierLength });
  kit.block(pier, { w: 2.0, h: 0.08, d: 0.08, mat: kit.material("timber"), y: y0 + 0.7, z: pierLength });

  entranceSign(ctx, { x: 3.4, z: 2.6, ry: -0.75 });
}
