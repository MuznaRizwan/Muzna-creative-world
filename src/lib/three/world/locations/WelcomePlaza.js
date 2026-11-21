import * as THREE from "three";

import { PALETTE } from "@/constants/world";
import { ZONES } from "@/data/worldLayout";

import { bench, bougainvillea, jaaliPanel, planter, table } from "../props/furniture";
import { addArrowBoard } from "../props/signage";
import { PAVING_TOP, pavingCircle } from "./common";

/**
 * Welcome Plaza: the spawn area. A compass-rose floor names every place, the
 * Signpost Tree points the way, and the welcome arch frames the start.
 * @param {import("./common").LocationContext} ctx
 */
export function buildWelcomePlaza(ctx) {
  const { kit, textures, group, zone } = ctx;
  const R = 7;

  // Floor with an inlaid compass rose (labels point at each zone).
  const labels = ZONES.filter((z) => z.id !== zone.id).map((z) => ({
    name: z.name,
    angle: Math.atan2(z.z - zone.z, z.x - zone.x),
    accent: z.accent,
  }));
  pavingCircle(ctx, R);
  group.add(
    kit.mesh(kit.geo.disc(64), kit.textured("compass", textures.compassRose(labels)), {
      y: PAVING_TOP + 0.006,
      sx: 5.4,
      sz: 5.4,
      cast: false,
    })
  );

  // Signpost Tree on a round seat-wall planter (0.45 high: the cat can hop up).
  // It stands west of the centre line so the view north from the spawn point
  // stays open towards the Arcade Hall.
  const tree = new THREE.Group();
  tree.position.set(-3.0, 0, -1.4);
  group.add(tree);
  kit.cylinder(tree, { r: 1.25, h: 0.45, mat: kit.material("honey"), y: PAVING_TOP, segments: 24 });
  kit.cylinder(tree, { r: 1.05, h: 0.03, mat: kit.material("grassShade"), y: PAVING_TOP + 0.45, segments: 24, cast: false });
  kit.cylinder(tree, { r: 0.42, h: 4.4, mat: kit.material("timber"), taper: 0.7, y: PAVING_TOP + 0.4, segments: 9 });
  const canopy = [
    [0, 5.6, 0, 1.9],
    [1.3, 5.0, 0.6, 1.4],
    [-1.2, 5.1, -0.5, 1.5],
    [0.2, 6.4, -0.8, 1.3],
    [-0.4, 5.0, 1.3, 1.3],
  ];
  canopy.forEach(([x, y, z, s], i) =>
    ctx.instance("canopy", tree.position.x + x, PAVING_TOP + y, tree.position.z + z, { scale: s, ry: i, color: i % 2 ? "#6E8A4E" : "#7F9A5A" })
  );
  ZONES.filter((z) => z.id !== zone.id).forEach((target, i) => {
    addArrowBoard(kit, textures, tree, {
      text: target.name,
      dx: target.x - (zone.x + tree.position.x),
      dz: target.z - (zone.z + tree.position.z),
      y: PAVING_TOP + 1.7 + i * 0.36,
      offset: 0.3,
    });
  });
  ctx.collider(tree.position.x, tree.position.z, 2.5, 2.5, 0.45);
  ctx.collider(tree.position.x, tree.position.z, 0.9, 0.9, 5);

  // Welcome arch on the south edge, with jaali screens and bougainvillea.
  // The lintel sits above 5.2 so the follow camera (4.5 up, 6.5 behind the
  // spawn point) looks underneath it rather than through it.
  const archZ = R;
  const pillar = 5.0;
  const limewash = kit.material("limewash");
  for (const side of [-1, 1]) {
    kit.block(group, { w: 0.9, h: pillar, d: 0.9, mat: limewash, x: side * 2.2, y: PAVING_TOP, z: archZ });
    kit.block(group, { w: 1.1, h: 0.25, d: 1.1, mat: kit.material("terracotta"), x: side * 2.2, y: PAVING_TOP + pillar + 0.87, z: archZ });
    jaaliPanel(kit, textures, group, { x: side * 3.75, y: PAVING_TOP, z: archZ, w: 2.1, h: 2.3 });
    kit.block(group, { w: 0.2, h: 2.5, d: 0.3, mat: limewash, x: side * 4.9, y: PAVING_TOP, z: archZ });
    ctx.collider(side * 2.2, archZ, 0.9, 0.9, pillar + 0.9);
    ctx.collider(side * 3.75, archZ, 2.5, 0.3, 2.4);
    bougainvillea(ctx.instances, { x: side * 2.4, y: pillar + 1.25, z: archZ + 0.2 }, 1.2, side + 2);
  }
  kit.block(group, { w: 5.5, h: 0.75, d: 0.95, mat: limewash, y: PAVING_TOP + pillar, z: archZ });
  kit.block(group, { w: 5.7, h: 0.12, d: 1.05, mat: kit.material("terracotta"), y: PAVING_TOP + pillar + 0.75, z: archZ });
  const archSign = kit.textured("sign:arch", textures.signBoard("Muzna's Creative World", PALETTE.marigold));
  for (const side of [1, -1]) {
    group.add(
      kit.mesh(kit.geo.plane(), archSign, {
        y: PAVING_TOP + pillar + 0.37,
        z: archZ + side * 0.49,
        ry: side === 1 ? 0 : Math.PI,
        sx: 4.6,
        sy: 0.62,
        cast: false,
      })
    );
  }

  // Benches facing the centre, lamp-lit.
  for (const angle of [0.35, 2.79, 1.2, 1.94]) {
    const r = 5.6;
    bench(kit, group, Math.cos(angle) * r, Math.sin(angle) * r, -angle - Math.PI / 2);
    ctx.collider(Math.cos(angle) * r, Math.sin(angle) * r, 1.6, 1.6, 0.9);
  }
  for (const angle of [-0.4, 3.55, 0.75, 2.4]) {
    const r = 6.5;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    ctx.instance("lampPost", x, PAVING_TOP + 1.1, z, { size: [0.07, 2.2, 0.07] });
    ctx.instance("lampHead", x, PAVING_TOP + 2.35, z, { size: [0.26, 0.32, 0.26] });
    ctx.collider(x, z, 0.3, 0.3, 2.4);
  }

  // Lavender planters by the arch.
  planter(kit, group, ctx.instances, { x: -1.3, z: 5.9, origin: { x: 0, y: PAVING_TOP, z: 0 } });
  planter(kit, group, ctx.instances, { x: 1.3, z: 5.9, origin: { x: 0, y: PAVING_TOP, z: 0 }, plant: "flower" });

  // Welcome kiosk: the plaza's interaction point.
  const kiosk = { x: 3.9, z: 2.6 };
  kit.block(group, { w: 1.3, h: 1.15, d: 0.8, mat: kit.material("timber"), x: kiosk.x, y: PAVING_TOP, z: kiosk.z, ry: -0.5 });
  kit.block(group, { w: 1.45, h: 0.08, d: 0.95, mat: kit.colour(zone.accent), x: kiosk.x, y: PAVING_TOP + 1.15, z: kiosk.z, ry: -0.5 });
  ctx.collider(kiosk.x, kiosk.z, 1.4, 1.2, 1.2);
  ctx.interactable({ id: "plaza-kiosk", label: "Say hello", x: kiosk.x - 0.5, y: 1.35, z: kiosk.z + 0.6 });

  // Chai stall with a truck-art awning.
  const chai = { x: -4.2, z: 3.4 };
  table(kit, group, { x: chai.x, z: chai.z, ry: 0.6, w: 1.4, d: 0.7, h: 0.9 });
  for (let i = 0; i < 4; i += 1) {
    kit.block(group, {
      w: 0.4,
      h: 0.06,
      d: 1.0,
      mat: kit.material(i % 2 ? "marigold" : "truckTeal"),
      x: chai.x - 0.6 * Math.cos(0.6) + i * 0.4 * Math.cos(0.6),
      y: PAVING_TOP + 1.85,
      z: chai.z + 0.6 * Math.sin(0.6) - i * 0.4 * Math.sin(0.6),
      ry: 0.6,
      rx: 0.15,
    });
  }
  for (const [px, pz] of [[-0.75, -0.3], [0.75, 0.3]]) {
    kit.block(group, { w: 0.06, h: 1.85, d: 0.06, mat: kit.material("timberDark"), x: chai.x + px, z: chai.z + pz, y: PAVING_TOP });
  }
  kit.cylinder(group, { r: 0.16, h: 0.28, mat: kit.material("brass"), x: chai.x, y: PAVING_TOP + 0.85, z: chai.z, segments: 10 });
  for (let i = 0; i < 3; i += 1) {
    kit.cylinder(group, { r: 0.05, h: 0.09, mat: kit.material("paper"), x: chai.x + 0.3 + i * 0.12, y: PAVING_TOP + 0.85, z: chai.z - 0.1, segments: 8, cast: false });
  }
  ctx.collider(chai.x, chai.z, 1.6, 1.2, 1.9);

  // Story detail: a cat bed and bowl just inside the arch. This is home.
  const bed = { x: -2.9, z: 5.5 };
  kit.cylinder(group, { r: 0.55, h: 0.16, mat: kit.material("cushion"), x: bed.x, y: PAVING_TOP, z: bed.z, segments: 20 });
  kit.cylinder(group, { r: 0.42, h: 0.05, mat: kit.material("paper"), x: bed.x, y: PAVING_TOP + 0.16, z: bed.z, segments: 20, cast: false });
  kit.cylinder(group, { r: 0.16, h: 0.08, mat: kit.material("terracotta"), taper: 1.25, x: bed.x + 0.85, y: PAVING_TOP, z: bed.z + 0.1, segments: 12 });

}
