import * as THREE from "three";

import { PALETTE } from "@/constants/world";

import { table } from "../props/furniture";
import { PAVING_TOP, entranceSign, opening, pavingRect } from "./common";

/**
 * AI Station (RAG chatbot): "ask the observatory". A limewash drum with a
 * periwinkle dome and brass telescope, a jaali band, a question desk with a
 * small information screen, a star chart, an orrery and a sundial.
 * @param {import("./common").LocationContext} ctx
 */
export function buildAIStation(ctx) {
  const { kit, textures, group } = ctx;
  pavingRect(ctx, 12, 12);
  const y0 = PAVING_TOP;

  // Observatory drum and dome (≈8 units to the dome top incl. telescope).
  const obs = { x: 0.8, z: -1.8, r: 2.3, h: 3.2 };
  kit.cylinder(group, { r: obs.r, h: obs.h, mat: kit.material("limewash"), x: obs.x, y: y0, z: obs.z, segments: 40 });
  kit.cylinder(group, { r: obs.r + 0.08, h: 0.22, mat: kit.material("terracotta"), x: obs.x, y: y0 + obs.h, z: obs.z, segments: 40 });
  const dome = kit.geometry("dome", () => new THREE.SphereGeometry(1, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2));
  group.add(kit.mesh(dome, kit.material("periwinkle"), { x: obs.x, y: y0 + obs.h + 0.22, z: obs.z, sx: obs.r, sy: obs.r, sz: obs.r }));
  // Dome slit (dark) facing south-east, with the telescope poking out.
  const slitAngle = 0.6;
  const slit = new THREE.Group();
  slit.position.set(obs.x, y0 + obs.h + 0.22, obs.z);
  slit.rotation.y = slitAngle;
  group.add(slit);
  for (let i = 0; i < 5; i += 1) {
    const phi = (i / 5) * (Math.PI / 2 - 0.2) + 0.1;
    slit.add(
      kit.mesh(kit.geo.box(), kit.material("opening"), {
        x: 0,
        y: Math.sin(phi) * (obs.r + 0.01),
        z: Math.cos(phi) * (obs.r + 0.01),
        rx: -phi,
        sx: 0.6,
        sy: 0.5,
        sz: 0.06,
        cast: false,
      })
    );
  }
  slit.add(kit.mesh(kit.geo.cylinder(0.8, 1, 14), kit.material("brass"), { y: 1.5, z: 1.6, rx: 0.9, sx: 0.24, sy: 2.6, sz: 0.24 }));
  ctx.collider(obs.x, obs.z, obs.r * 2, obs.r * 2, 7.5);

  // Jaali band around the drum (patterned shadows), and the door.
  const jaali = kit.textured("jaali", textures.jaali, { alphaTest: 0.5, side: THREE.DoubleSide, color: PALETTE.limewash });
  const band = kit.geometry("jaaliBand", () => {
    const g = new THREE.CylinderGeometry(1, 1, 1, 40, 1, true);
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i += 1) uv.setXY(i, uv.getX(i) * 14, uv.getY(i));
    return g;
  });
  group.add(kit.mesh(band, jaali, { x: obs.x, y: y0 + 2.05, z: obs.z, sx: obs.r + 0.12, sy: 0.9, sz: obs.r + 0.12 }));
  opening(ctx, group, { x: obs.x + Math.sin(0.25) * (obs.r + 0.02), y: y0, z: obs.z + Math.cos(0.25) * (obs.r + 0.02), w: 1.4, h: 2.1, ry: 0.25, lit: true });
  kit.block(group, { w: 1.8, h: 0.15, d: 0.9, mat: kit.material("honey"), x: obs.x + Math.sin(0.25) * (obs.r + 0.4), y: y0, z: obs.z + Math.cos(0.25) * (obs.r + 0.4), ry: 0.25 });

  // Question desk with an information screen and lamp: the interaction point.
  const desk = table(kit, group, { x: -3.0, z: 3.0, ry: 0.45, w: 1.6, d: 0.8, h: 0.85 });
  kit.block(desk, { w: 0.55, h: 0.05, d: 0.4, mat: kit.material("paper"), x: -0.4, y: 0.85, rz: 0.08, cast: false });
  kit.block(desk, { w: 0.55, h: 0.05, d: 0.4, mat: kit.material("paper"), x: 0.12, y: 0.85, rz: -0.08, cast: false });
  kit.block(desk, { w: 0.7, h: 0.5, d: 0.06, mat: kit.material("brass"), x: 0.45, y: 0.9, z: -0.2, rx: -0.2 });
  desk.add(
    kit.mesh(kit.geo.plane(), kit.textured("screen:ask", textures.screenText("Ask me", "#20244f", PALETTE.lavenderBand), { emissive: "#ffffff", emissiveIntensity: 0.35 }), {
      x: 0.45,
      y: 1.15,
      z: -0.16,
      rx: -0.2,
      sx: 0.6,
      sy: 0.42,
      cast: false,
    })
  );
  ctx.collider(-3.0, 3.0, 1.8, 1.2, 1.4);
  ctx.interactable({ id: "ai-desk", x: -2.5, y: 1.25, z: 3.9 });

  // Star chart on an easel.
  const chart = new THREE.Group();
  chart.position.set(3.9, y0, 3.4);
  chart.rotation.y = -0.4;
  group.add(chart);
  for (const dx of [-0.6, 0.6]) kit.block(chart, { w: 0.08, h: 1.9, d: 0.08, mat: kit.material("timber"), x: dx });
  kit.block(chart, { w: 1.5, h: 1.1, d: 0.06, mat: kit.material("timberDark"), y: 0.75 });
  chart.add(kit.mesh(kit.geo.plane(), kit.textured("starChart", textures.starChart), { y: 1.3, z: 0.035, sx: 1.4, sy: 1.0, cast: false }));
  ctx.collider(3.9, 3.4, 1.5, 0.6, 1.9);

  // Orrery on a pedestal (turns slowly).
  const orreryBase = { x: -3.9, z: -1.0 };
  kit.cylinder(group, { r: 0.35, h: 1.0, mat: kit.material("honey"), x: orreryBase.x, y: y0, z: orreryBase.z, segments: 12 });
  const orrery = new THREE.Group();
  orrery.position.set(orreryBase.x, y0 + 1.35, orreryBase.z);
  orrery.userData.dynamic = true;
  group.add(orrery);
  orrery.add(kit.mesh(kit.geo.sphere(1), kit.material("bulb"), { sx: 0.16, sy: 0.16, sz: 0.16, cast: false }));
  const ring = kit.geometry("orreryRing", () => new THREE.TorusGeometry(1, 0.03, 6, 40).rotateX(Math.PI / 2));
  /** @type {THREE.Group[]} */
  const arms = [];
  [0.35, 0.55, 0.75].forEach((radius, i) => {
    orrery.add(kit.mesh(ring, kit.material("brass"), { sx: radius, sy: radius, sz: radius, cast: false }));
    const arm = new THREE.Group();
    arm.add(kit.mesh(kit.geo.sphere(1), kit.colour([PALETTE.periwinkle, PALETTE.coral, PALETTE.verdigris][i]), { x: radius, sx: 0.07, sy: 0.07, sz: 0.07, cast: false }));
    orrery.add(arm);
    arms.push(arm);
  });
  ctx.animate((_delta, elapsed) => {
    arms.forEach((arm, i) => {
      arm.rotation.y = elapsed * (0.5 - i * 0.12) + i;
    });
  });
  ctx.collider(orreryBase.x, orreryBase.z, 0.8, 0.8, 1.4);

  // Sundial.
  const dial = { x: 3.4, z: 0.9 };
  kit.cylinder(group, { r: 0.3, h: 0.8, mat: kit.material("kerb"), x: dial.x, y: y0, z: dial.z, segments: 10 });
  kit.cylinder(group, { r: 0.55, h: 0.06, mat: kit.material("brass"), x: dial.x, y: y0 + 0.8, z: dial.z, segments: 24 });
  group.add(kit.mesh(kit.geo.prism(), kit.material("brass"), { x: dial.x, y: y0 + 0.86, z: dial.z, ry: Math.PI / 2, sx: 0.6, sy: 0.35, sz: 0.04 }));
  ctx.collider(dial.x, dial.z, 0.7, 0.7, 0.9);

  entranceSign(ctx, { x: -4.4, z: 5.2, ry: -0.2 });
}
