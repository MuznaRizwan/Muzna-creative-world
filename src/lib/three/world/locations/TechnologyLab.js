import * as THREE from "three";

import { PALETTE } from "@/constants/world";
import { skillsCategories } from "@/data/portfolioData";

import { table } from "../props/furniture";
import { PAVING_TOP, entranceSign, pavingRect } from "./common";

/**
 * Technology Lab (Skills): a copper-and-glass glasshouse where skills "grow"
 * in labelled planter beds, plus a workbench with monitors and a display kiosk.
 * @param {import("./common").LocationContext} ctx
 */
export function buildTechnologyLab(ctx) {
  const { kit, textures, group } = ctx;
  pavingRect(ctx, 12, 12, kit.textured("circuitPaving", textures.circuitPaving));
  const y0 = PAVING_TOP;

  // Glasshouse frame: 7 × 5, walls 2.6, gable ridge +1.5. Doorway 1.8 wide on the south.
  const gh = { x: 1.3, z: -1.6, w: 7, d: 5, h: 2.6, ridge: 1.5 };
  const copper = kit.material("copper");
  const glass = kit.material("glass");
  const postXs = [-3.5, -1.75, 0, 1.75, 3.5];
  for (const px of postXs) {
    for (const pz of [-gh.d / 2, gh.d / 2]) {
      kit.block(group, { w: 0.12, h: gh.h, d: 0.12, mat: copper, x: gh.x + px, y: y0, z: gh.z + pz });
    }
  }
  for (const pz of [-gh.d / 2, 0, gh.d / 2]) {
    for (const px of [-gh.w / 2, gh.w / 2]) kit.block(group, { w: 0.12, h: gh.h, d: 0.12, mat: copper, x: gh.x + px, y: y0, z: gh.z + pz });
  }
  for (const pz of [-gh.d / 2, gh.d / 2]) kit.block(group, { w: gh.w + 0.12, h: 0.12, d: 0.12, mat: copper, x: gh.x, y: y0 + gh.h, z: gh.z + pz });
  for (const px of [-gh.w / 2, gh.w / 2]) kit.block(group, { w: 0.12, h: 0.12, d: gh.d, mat: copper, x: gh.x + px, y: y0 + gh.h, z: gh.z });
  kit.block(group, { w: gh.w + 0.3, h: 0.12, d: 0.12, mat: copper, x: gh.x, y: y0 + gh.h + gh.ridge, z: gh.z });

  // Glass walls (south wall leaves a doorway between x = −0.9 and 0.9).
  const pane = (/** @type {number} */ x, /** @type {number} */ z, /** @type {number} */ w, /** @type {number} */ ry) =>
    group.add(kit.mesh(kit.geo.plane(), glass, { x, y: y0 + gh.h / 2, z, ry, sx: w, sy: gh.h, cast: false, receive: false }));
  pane(gh.x, gh.z - gh.d / 2, gh.w, 0);
  pane(gh.x - gh.w / 2, gh.z, gh.d, Math.PI / 2);
  pane(gh.x + gh.w / 2, gh.z, gh.d, Math.PI / 2);
  pane(gh.x - 2.2, gh.z + gh.d / 2, 2.6, 0);
  pane(gh.x + 2.2, gh.z + gh.d / 2, 2.6, 0);
  // Glass roof slopes.
  const slope = Math.atan2(gh.ridge, gh.d / 2);
  const slopeLength = Math.hypot(gh.ridge, gh.d / 2);
  for (const side of [-1, 1]) {
    group.add(
      kit.mesh(kit.geo.plane(), glass, {
        x: gh.x,
        y: y0 + gh.h + gh.ridge / 2,
        z: gh.z + (side * gh.d) / 4,
        // South slope rises northwards to the ridge; north slope mirrors it.
        rx: side === 1 ? -Math.PI / 2 + slope : Math.PI / 2 - slope,
        sx: gh.w,
        sy: slopeLength,
        cast: false,
        receive: false,
      })
    );
  }
  for (const px of [-gh.w / 2, gh.w / 2]) {
    group.add(kit.mesh(kit.geo.prism(), copper, { x: gh.x + px, y: y0 + gh.h, z: gh.z, ry: Math.PI / 2, sx: gh.d, sy: gh.ridge, sz: 0.1 }));
  }
  ctx.collider(gh.x, gh.z - gh.d / 2, gh.w, 0.2, 4);
  ctx.collider(gh.x - gh.w / 2, gh.z, 0.2, gh.d, 4);
  ctx.collider(gh.x + gh.w / 2, gh.z, 0.2, gh.d, 4);
  ctx.collider(gh.x - 2.25, gh.z + gh.d / 2, 2.7, 0.2, 4);
  ctx.collider(gh.x + 2.25, gh.z + gh.d / 2, 2.7, 0.2, 4);

  // Planter beds inside: one per skill category, each with its own plant variety.
  const varieties = [
    { type: /** @type {const} */ ("canopy"), colour: "#7F9A5A", scale: 0.32 },
    { type: /** @type {const} */ ("lavender"), colour: PALETTE.lavenderFlower, scale: 0.16 },
    { type: /** @type {const} */ ("cypress"), colour: PALETTE.meadowShade, scale: 0.2 },
    { type: /** @type {const} */ ("flower"), colour: PALETTE.marigold, scale: 0.12 },
    { type: /** @type {const} */ ("bougainvillea"), colour: PALETTE.bougainvillea, scale: 0.18 },
    { type: /** @type {const} */ ("shrub"), colour: "#8FA864", scale: 0.26 },
  ];
  skillsCategories.slice(0, 6).forEach((category, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const bx = gh.x - 2.2 + col * 2.2;
    const bz = gh.z - 1.2 + row * 1.7;
    kit.block(group, { w: 1.7, h: 0.4, d: 0.75, mat: kit.material("timber"), x: bx, y: y0, z: bz });
    kit.block(group, { w: 1.55, h: 0.03, d: 0.6, mat: kit.material("earth"), x: bx, y: y0 + 0.4, z: bz, cast: false });
    const variety = varieties[i];
    for (let k = 0; k < 4; k += 1) {
      const px = bx - 0.55 + k * 0.37;
      ctx.instance(variety.type, px, y0 + 0.55 + variety.scale, bz, {
        scale: variety.scale,
        size: variety.type === "cypress" ? [0.14, 0.38, 0.14] : undefined,
        color: variety.colour,
      });
    }
    const label = kit.textured(`arrow:${category.title}`, textures.arrowLabel(category.title));
    group.add(kit.mesh(kit.geo.plane(), label, { x: bx, y: y0 + 0.2, z: bz + 0.39, sx: 1.5, sy: 0.3, cast: false }));
  });

  // Wind vane on the ridge (turns slowly).
  const vane = new THREE.Group();
  vane.position.set(gh.x + 2.6, y0 + gh.h + gh.ridge + 0.1, gh.z);
  vane.userData.dynamic = true;
  kit.block(vane, { w: 0.05, h: 0.7, d: 0.05, mat: copper });
  const arrow = new THREE.Group();
  arrow.position.y = 0.6;
  kit.block(arrow, { w: 0.9, h: 0.04, d: 0.04, mat: copper, cast: false });
  arrow.add(kit.mesh(kit.geo.prism(), copper, { x: 0.5, rz: -Math.PI / 2, sx: 0.2, sy: 0.18, sz: 0.03, cast: false }));
  vane.add(arrow);
  group.add(vane);
  ctx.animate((_delta, elapsed) => {
    arrow.rotation.y = Math.sin(elapsed * 0.25) * 0.6 + 0.4;
  });

  // Workbench with two monitors (computers) outside the glasshouse.
  const bench = { x: 3.4, z: 3.3, ry: -0.35 };
  const workbench = table(kit, group, { x: bench.x, z: bench.z, ry: bench.ry, w: 2.4, d: 0.9, h: 0.9 });
  const screen = kit.textured("codeScreen", textures.codeScreen, { emissive: "#ffffff", emissiveIntensity: 0.35 });
  for (const sx of [-0.55, 0.55]) {
    kit.block(workbench, { w: 0.08, h: 0.3, d: 0.08, mat: kit.material("iron"), x: sx, y: 0.9, z: -0.15 });
    kit.block(workbench, { w: 0.95, h: 0.6, d: 0.06, mat: kit.material("ink"), x: sx, y: 1.15, z: -0.15 });
    workbench.add(kit.mesh(kit.geo.plane(), screen, { x: sx, y: 1.45, z: -0.115, sx: 0.85, sy: 0.5, cast: false }));
    kit.block(workbench, { w: 0.6, h: 0.03, d: 0.2, mat: kit.material("ink"), x: sx, y: 0.9, z: 0.2, cast: false });
  }
  ctx.collider(bench.x, bench.z, 2.5, 1.4, 1.8);

  // Display kiosk: the lab's interaction point ("lab logbook").
  const kiosk = new THREE.Group();
  kiosk.position.set(-3.6, y0, 3.6);
  kiosk.rotation.y = 0.5;
  group.add(kiosk);
  kit.block(kiosk, { w: 0.5, h: 1.0, d: 0.4, mat: copper });
  kit.block(kiosk, { w: 1.0, h: 0.7, d: 0.08, mat: kit.material("ink"), y: 1.0, z: 0.05, rx: -0.4 });
  kiosk.add(
    kit.mesh(kit.geo.plane(), kit.textured("screen:skills", textures.screenText("Skills", "#16313a", "#bfe8de"), { emissive: "#ffffff", emissiveIntensity: 0.3 }), {
      y: 1.33,
      z: 0.11,
      rx: -0.4,
      sx: 0.9,
      sy: 0.6,
      cast: false,
    })
  );
  ctx.collider(-3.6, 3.6, 0.9, 0.9, 1.6);
  ctx.interactable({ id: "lab-kiosk", x: -3.0, y: 1.2, z: 4.4 });

  entranceSign(ctx, { x: -4.4, z: 5.0, ry: -0.5 });
}
