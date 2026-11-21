import * as THREE from "three";

import { PALETTE } from "@/constants/world";
import { educationData, experienceData } from "@/data/portfolioData";

import { bench, bougainvillea, noticeBoard } from "../props/furniture";
import { PAVING_TOP, entranceSign, gableRoof, opening, pavingRect } from "./common";

/**
 * University Campus (Education & Experience): a quad framed by an L-shaped
 * colonnade, a clock tower reading 5:40, a timeline of stepping-stone plinths
 * and a giant book stack leading up to a reading terrace.
 * @param {import("./common").LocationContext} ctx
 */
export function buildUniversityCampus(ctx) {
  const { kit, textures, group, zone } = ctx;
  pavingRect(ctx, 12, 12);
  const y0 = PAVING_TOP;
  const honey = kit.material("honey");
  const limewash = kit.material("limewash");

  // L-shaped colonnade along the north and west edges, with a back wall.
  const columnHeight = 2.6;
  const north = -4.6;
  const west = -4.6;
  /** @type {[number, number, number][]} */
  const columns = [];
  for (let x = -3.4; x <= 4.6; x += 1.6) columns.push([x, north, 0]);
  for (let z = -3.0; z <= 3.4; z += 1.6) columns.push([west, z, Math.PI / 2]);
  for (const [x, z] of columns) {
    ctx.instance("column", x, y0 + columnHeight / 2, z, { size: [0.22, columnHeight, 0.22] });
    kit.block(group, { w: 0.5, h: 0.18, d: 0.5, mat: honey, x, y: y0, z });
    ctx.collider(x, z, 0.5, 0.5, columnHeight);
  }
  // Arches between columns.
  const arch = kit.geo.arch(0.8, 0.09);
  for (let x = -2.6; x <= 3.8; x += 1.6) group.add(kit.mesh(arch, limewash, { x, y: y0 + columnHeight - 0.25, z: north, cast: false }));
  for (let z = -2.2; z <= 2.6; z += 1.6) group.add(kit.mesh(arch, limewash, { x: west, y: y0 + columnHeight - 0.25, z, ry: Math.PI / 2, cast: false }));
  // Entablature, roof and back walls.
  kit.block(group, { w: 9.6, h: 0.5, d: 0.7, mat: limewash, x: 0.6, y: y0 + columnHeight, z: north });
  kit.block(group, { w: 0.7, h: 0.5, d: 8.4, mat: limewash, x: west, y: y0 + columnHeight, z: -0.2 });
  kit.block(group, { w: 9.6, h: 0.15, d: 1.9, mat: kit.material("terracotta"), x: 0.6, y: y0 + columnHeight + 0.5, z: north - 0.6 });
  kit.block(group, { w: 1.9, h: 0.15, d: 8.4, mat: kit.material("terracotta"), x: west - 0.6, y: y0 + columnHeight + 0.5, z: -0.2 });
  kit.block(group, { w: 9.6, h: columnHeight + 0.5, d: 0.3, mat: honey, x: 0.6, y: y0, z: north - 1.35 });
  kit.block(group, { w: 0.3, h: columnHeight + 0.5, d: 8.4, mat: honey, x: west - 1.35, y: y0, z: -0.2 });
  for (const x of [-1.8, 1.4, 4.0]) opening(ctx, group, { x, y: y0, z: north - 1.18, w: 1.0, h: 1.9, lit: x === 1.4 });
  ctx.collider(0.6, north - 1.35, 9.6, 0.3, 3.1);
  ctx.collider(west - 1.35, -0.2, 0.3, 8.4, 3.1);
  bougainvillea(ctx.instances, { x: 3.8, y: y0 + 3.2, z: north + 0.4 }, 1.4, 1);
  bougainvillea(ctx.instances, { x: west + 0.4, y: y0 + 3.2, z: 2.4 }, 1.4, 4);

  // Clock tower (≈11 units) in the north-west corner.
  const tower = { x: -4.7, z: -4.7, w: 2.4 };
  kit.block(group, { w: tower.w, h: 8.6, d: tower.w, mat: honey, x: tower.x, y: y0, z: tower.z });
  kit.block(group, { w: tower.w + 0.3, h: 0.3, d: tower.w + 0.3, mat: limewash, x: tower.x, y: y0 + 8.6, z: tower.z });
  group.add(kit.mesh(kit.geo.cone(4), kit.material("terracotta"), { x: tower.x, y: y0 + 8.9 + 1.1, z: tower.z, ry: Math.PI / 4, sx: 1.9, sy: 2.2, sz: 1.9 }));
  const clock = kit.textured("clockFace", textures.clockFace);
  const clockDisc = kit.geometry("discFront", () => new THREE.CircleGeometry(1, 32));
  for (let i = 0; i < 4; i += 1) {
    const a = (i * Math.PI) / 2;
    group.add(
      kit.mesh(clockDisc, clock, {
        x: tower.x + Math.sin(a) * (tower.w / 2 + 0.02),
        y: y0 + 7.4,
        z: tower.z + Math.cos(a) * (tower.w / 2 + 0.02),
        ry: a,
        sx: 0.8,
        sy: 0.8,
        cast: false,
      })
    );
  }
  for (let i = 0; i < 4; i += 1) {
    const a = (i * Math.PI) / 2;
    opening(ctx, group, {
      x: tower.x + Math.sin(a) * (tower.w / 2 + 0.02),
      y: y0 + 4.6,
      z: tower.z + Math.cos(a) * (tower.w / 2 + 0.02),
      w: 0.5,
      h: 1.2,
      ry: a,
    });
  }
  ctx.collider(tower.x, tower.z, tower.w, tower.w, 11);

  // Timeline walk: one stepping-stone plinth with an ink-blue flag per entry.
  const entries = educationData.length + experienceData.length;
  for (let i = 0; i < entries; i += 1) {
    const t = entries === 1 ? 0.5 : i / (entries - 1);
    const x = 3.6 - t * 5.6;
    const z = 3.8 - t * 5.4;
    kit.cylinder(group, { r: 0.55, h: 0.3, mat: kit.material("kerb"), x, y: y0, z, segments: 16 });
    kit.block(group, { w: 0.05, h: 1.3, d: 0.05, mat: kit.material("timberDark"), x: x + 0.38, y: y0 + 0.3, z });
    group.add(kit.mesh(kit.geo.plane(), kit.material("inkBlue"), { x: x + 0.62, y: y0 + 1.35, z, sx: 0.48, sy: 0.32 }));
    ctx.collider(x, z, 1.1, 1.1, 0.3);
  }

  // Giant books as stairs (0.3 per step) up to a reading terrace at 0.9.
  const books = [
    { w: 1.9, d: 1.3, colour: PALETTE.crimson },
    { w: 1.7, d: 1.15, colour: zone.accent },
    { w: 1.5, d: 1.0, colour: PALETTE.verdigris },
  ];
  books.forEach((book, i) => {
    const x = 1.6 + i * 0.75;
    const z = -1.6 - i * 0.2;
    kit.block(group, { w: book.w, h: 0.3, d: book.d, mat: kit.colour(book.colour), x, y: y0 + i * 0.3, z });
    kit.block(group, { w: book.w + 0.02, h: 0.22, d: book.d - 0.1, mat: kit.material("paper"), x: x + 0.02, y: y0 + i * 0.3 + 0.04, z: z + 0.03, cast: false });
    // One collider per book, so each 0.3 step can be climbed.
    ctx.collider(x, z, book.w, book.d, y0 + (i + 1) * 0.3);
  });
  const terrace = { x: 4.3, z: -2.4 };
  kit.block(group, { w: 2.2, h: 0.9, d: 2.6, mat: honey, x: terrace.x, y: y0, z: terrace.z });
  bench(kit, group, terrace.x + 0.3, terrace.z - 0.6, 0).position.y = 0.9;
  ctx.collider(terrace.x, terrace.z, 2.2, 2.6, y0 + 0.9);

  // Notice board: the campus interaction point.
  noticeBoard(kit, group, 4.4, 4.4, -0.5);
  ctx.collider(4.4, 4.4, 1.6, 0.6, 1.6);
  ctx.interactable({ id: "campus-noticeboard", label: "Education", x: 3.7, y: 1.1, z: 5.0 });

  // Bicycle-rack style railing and a small gatehouse roof over the south entry.
  gableRoof(ctx, group, { x: -1.0, y: y0 + 2.4, z: 5.4, w: 2.2, h: 0.8, d: 1.0, ry: 0 });
  for (const dx of [-1.95, -0.05]) kit.block(group, { w: 0.18, h: 2.4, d: 0.18, mat: kit.material("timberDark"), x: dx, y: y0, z: 5.4 });

  entranceSign(ctx, { x: 2.0, z: 5.5, ry: 0.1 });
}
