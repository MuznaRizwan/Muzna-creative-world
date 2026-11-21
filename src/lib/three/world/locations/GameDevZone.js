import * as THREE from "three";

import { PALETTE } from "@/constants/world";
import { projectsData } from "@/data/portfolioData";

import { PAVING_TOP, entranceSign, opening, pavingCircle } from "./common";

const CABINET_COLOURS = [PALETTE.periwinkle, PALETTE.coral, PALETTE.truckTeal, PALETTE.rose];

/**
 * Arcade cabinet (≈1.75 high) with the project title on its screen.
 * @param {import("./common").LocationContext} ctx
 * @param {THREE.Object3D} parent
 * @param {{ x: number, y: number, z: number, ry: number, title: string, colour: string }} options
 */
function cabinet(ctx, parent, { x, y, z, ry, title, colour }) {
  const { kit, textures } = ctx;
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  parent.add(g);
  const body = kit.colour(colour);
  kit.block(g, { w: 0.9, h: 1.75, d: 0.75, mat: body });
  kit.block(g, { w: 0.92, h: 0.28, d: 0.8, mat: kit.material("ink"), y: 1.75 });
  kit.block(g, { w: 0.86, h: 0.12, d: 0.38, mat: kit.material("ink"), y: 0.95, z: 0.45, rx: 0.35 });
  const screen = kit.textured(`arcade:${title}`, textures.screenText(title, "#1b1730", PALETTE.lamp), {
    emissive: "#ffffff",
    emissiveIntensity: 0.4,
  });
  g.add(kit.mesh(kit.geo.plane(), screen, { y: 1.38, z: 0.38, rx: -0.12, sx: 0.74, sy: 0.55, cast: false }));
  for (const bx of [-0.2, 0, 0.2]) {
    g.add(kit.mesh(kit.geo.sphere(0), kit.material("bulb"), { x: bx, y: 1.07, z: 0.58, sx: 0.04, sy: 0.04, sz: 0.04, cast: false }));
  }
  return g;
}

/**
 * Game Development Zone (Projects): the central hub. A stepped Arcade Hall
 * with a warm-bulb "PRESS START" marquee, one arcade cabinet per project,
 * and a spotlit stage for the featured project.
 * @param {import("./common").LocationContext} ctx
 */
export function buildGameDevZone(ctx) {
  const { kit, textures, group } = ctx;
  pavingCircle(ctx, 7.5, kit.textured("levelGrid", textures.levelGrid));
  const y0 = PAVING_TOP;

  // Arcade Hall: three stepped levels, entrance facing south.
  const hall = { x: -2.2, z: -3.6 };
  const levels = [
    { w: 6, d: 4, h: 3, mat: kit.material("limewash") },
    { w: 4.6, d: 3.2, h: 2.4, mat: kit.material("limewash") },
    { w: 3.2, d: 2.4, h: 2, mat: kit.material("limewash") },
  ];
  let top = y0;
  for (const level of levels) {
    kit.block(group, { w: level.w, h: level.h, d: level.d, mat: level.mat, x: hall.x, y: top, z: hall.z });
    kit.block(group, { w: level.w + 0.25, h: 0.22, d: level.d + 0.25, mat: kit.material("terracotta"), x: hall.x, y: top + level.h, z: hall.z });
    top += level.h + 0.22;
  }
  const front = hall.z + levels[0].d / 2 + 0.03;
  opening(ctx, group, { x: hall.x, y: y0, z: front, w: 2.2, h: 2.4, lit: true });
  for (const dx of [-2.1, 2.1]) opening(ctx, group, { x: hall.x + dx, y: y0 + 1.1, z: front, w: 0.9, h: 1.1, lit: true });
  ctx.collider(hall.x, hall.z, levels[0].w, levels[0].d, top);
  ctx.interactable({ id: "gamedev-hall", label: "Browse projects", x: hall.x + 1.6, y: 1.2, z: front + 0.8 });

  // Marquee with incandescent bulbs (warm, not neon).
  const marquee = { y: top + 0.5, w: 4.2, h: 1.3, z: hall.z + 0.2 };
  for (const dx of [-1.6, 1.6]) kit.block(group, { w: 0.12, h: 0.6, d: 0.12, mat: kit.material("iron"), x: hall.x + dx, y: top, z: marquee.z });
  kit.block(group, { w: marquee.w, h: marquee.h, d: 0.2, mat: kit.colour("#3a2552"), x: hall.x, y: marquee.y, z: marquee.z });
  group.add(
    kit.mesh(kit.geo.plane(), kit.textured("marquee", textures.marquee, { emissive: "#ffffff", emissiveIntensity: 0.25 }), {
      x: hall.x,
      y: marquee.y + marquee.h / 2,
      z: marquee.z + 0.105,
      sx: marquee.w - 0.1,
      sy: marquee.h - 0.1,
      cast: false,
    })
  );
  const perimeter = 2 * (marquee.w + marquee.h);
  const bulbs = 34;
  for (let i = 0; i < bulbs; i += 1) {
    let d = (i / bulbs) * perimeter;
    let bx;
    let by;
    if (d < marquee.w) {
      bx = -marquee.w / 2 + d;
      by = marquee.h;
    } else if ((d -= marquee.w) < marquee.h) {
      bx = marquee.w / 2;
      by = marquee.h - d;
    } else if ((d -= marquee.h) < marquee.w) {
      bx = marquee.w / 2 - d;
      by = 0;
    } else {
      d -= marquee.w;
      bx = -marquee.w / 2;
      by = d;
    }
    ctx.instance("bulb", hall.x + bx, marquee.y + by, marquee.z + 0.14, { scale: 0.07 });
  }

  // One cabinet per non-featured project, along the west side of the courtyard.
  const featured = projectsData.find((p) => p.featured) ?? projectsData[0];
  const others = projectsData.filter((p) => p !== featured);
  const cabinetSpots = [
    [-5.6, 0.6],
    [-5.9, 2.5],
    [-5.5, 4.4],
  ];
  others.slice(0, cabinetSpots.length).forEach((project, i) => {
    const [x, z] = cabinetSpots[i];
    cabinet(ctx, group, { x, y: y0, z, ry: Math.PI / 2 - 0.1 * (i - 1), title: project.title, colour: CABINET_COLOURS[i % CABINET_COLOURS.length] });
    ctx.collider(x, z, 1.0, 1.0, 2.0);
    ctx.interactable({ id: `gamedev-${project.id}`, label: `Play: ${project.title}`, x: x + 1.0, y: 1.0, z });
  });

  // Featured project on a raised, spotlit stage behind a velvet rope.
  const stage = { x: 4.3, z: 2.6, r: 1.45 };
  kit.cylinder(group, { r: stage.r, h: 0.6, mat: kit.material("honey"), x: stage.x, y: y0, z: stage.z, segments: 28 });
  kit.cylinder(group, { r: stage.r + 0.05, h: 0.06, mat: kit.material("velvet"), x: stage.x, y: y0 + 0.6, z: stage.z, segments: 28, cast: false });
  cabinet(ctx, group, { x: stage.x + 0.2, y: y0 + 0.66, z: stage.z, ry: -Math.PI / 2, title: featured.title, colour: PALETTE.crimson });
  for (let i = 0; i < 5; i += 1) {
    const a = Math.PI * 0.62 + (i / 4) * Math.PI * 0.76;
    const rx = stage.x + Math.cos(a) * (stage.r + 0.55);
    const rz = stage.z + Math.sin(a) * (stage.r + 0.55);
    kit.cylinder(group, { r: 0.05, h: 0.75, mat: kit.material("brass"), x: rx, y: y0, z: rz, segments: 8 });
    ctx.instance("bulb", rx, y0 + 0.8, rz, { scale: 0.06 });
  }
  ctx.collider(stage.x, stage.z, stage.r * 2, stage.r * 2, 0.6);
  ctx.interactable({ id: `gamedev-${featured.id}`, label: `Play: ${featured.title}`, x: stage.x - stage.r - 0.9, y: 1.0, z: stage.z });

  // The zone's one real spotlight, aimed at the stage (no shadows: cheap).
  const spot = new THREE.SpotLight(PALETTE.lamp, 60, 12, 0.42, 0.6, 2);
  spot.position.set(stage.x - 1.5, y0 + 6.5, stage.z + 1.5);
  spot.target.position.set(stage.x, y0 + 0.8, stage.z);
  spot.userData.dynamic = true;
  spot.target.userData.dynamic = true;
  group.add(spot, spot.target);
  kit.block(group, { w: 0.12, h: 6.6, d: 0.12, mat: kit.material("iron"), x: stage.x - 1.5, y: y0, z: stage.z + 1.5 });
  ctx.collider(stage.x - 1.5, stage.z + 1.5, 0.3, 0.3, 6.6);

  entranceSign(ctx, { x: -3.6, z: 6.4, ry: 0.35 });
}
