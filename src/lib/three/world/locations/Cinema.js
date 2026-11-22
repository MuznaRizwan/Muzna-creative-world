import * as THREE from "three";

import { PAVING_TOP, entranceSign, gableRoof, pavingCircle } from "./common";

/**
 * Seating tier: a ring sector extruded to a given height.
 * @param {number} inner @param {number} outer @param {number} start @param {number} end @param {number} height
 */
function tierGeometry(inner, outer, start, end, height) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outer, start, end, false);
  shape.absarc(0, 0, inner, end, start, true);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false, curveSegments: 18 });
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

/**
 * Cinema (Video): a small open-air amphitheatre. A 16:9 screen faces south
 * down the boulevard; three seating tiers (0.3 each) leave a central aisle.
 * @param {import("./common").LocationContext} ctx
 */
export function buildCinema(ctx) {
  const { kit, textures, group } = ctx;
  pavingCircle(ctx, 6.5);
  const y0 = PAVING_TOP;

  // Screen with timber frame and a low stage.
  const screenZ = -5.2;
  const timber = kit.material("timberDark");
  for (const dx of [-4.4, 4.4]) kit.block(group, { w: 0.32, h: 5.6, d: 0.32, mat: timber, x: dx, y: y0, z: screenZ });
  kit.block(group, { w: 9.2, h: 0.4, d: 0.36, mat: timber, y: y0 + 5.5, z: screenZ });
  kit.block(group, { w: 8.4, h: 4.8, d: 0.12, mat: kit.material("ink"), y: y0 + 0.75, z: screenZ - 0.05 });
  group.add(
    kit.mesh(kit.geo.plane(), kit.textured("poster", textures.poster, { emissive: "#ffffff", emissiveIntensity: 0.55 }), {
      y: y0 + 0.9 + 2.25,
      z: screenZ + 0.02,
      sx: 8,
      sy: 4.5,
      cast: false,
    })
  );
  kit.block(group, { w: 9, h: 0.3, d: 1.2, mat: kit.material("honey"), y: y0, z: screenZ + 0.5 });
  ctx.collider(0, screenZ, 9.2, 0.6, 5.9);

  // Seating tiers facing the screen, split by an aisle ~1.5 wide.
  const centre = { x: 0, z: screenZ };
  const south = -Math.PI / 2; // shape space: −y is world +z (south)
  const gap = 0.2;
  const spread = 1.35;
  for (let i = 0; i < 3; i += 1) {
    const inner = 3.6 + i * 1.0;
    const outer = inner + 1.0;
    const height = 0.3 * (i + 1);
    const colour = i % 2 ? kit.material("honey") : kit.material("kerb");
    for (const [a, b] of [
      [south - spread, south - gap],
      [south + gap, south + spread],
    ]) {
      const geometry = kit.geometry(`tier:${i}:${a.toFixed(2)}`, () => tierGeometry(inner, outer, a, b, height));
      group.add(kit.mesh(geometry, colour, { x: centre.x, y: y0, z: centre.z }));
      // Collision: the curved tier as a run of small boxes (each tier is a
      // 0.3 step, so the cat can climb the seating). Shape angle θ maps to
      // world (cos θ, −sin θ).
      const mid = (inner + outer) / 2;
      const count = Math.ceil(((b - a) * mid) / 0.55);
      for (let k = 0; k <= count; k += 1) {
        const ang = a + ((b - a) * k) / count;
        ctx.collider(centre.x + Math.cos(ang) * mid, centre.z - Math.sin(ang) * mid, 0.8, 0.8, y0 + height);
      }
    }
    // Cushions on each tier.
    for (let k = 0; k < 7; k += 1) {
      for (const side of [-1, 1]) {
        const ang = Math.PI / 2 + side * (gap + 0.12 + (k / 6) * (spread - gap - 0.24));
        const r = inner + 0.5;
        kit.block(group, {
          w: 0.45,
          h: 0.06,
          d: 0.4,
          mat: kit.material("velvet"),
          x: centre.x + Math.cos(ang) * r,
          y: y0 + height,
          z: centre.z + Math.sin(ang) * r,
          ry: -ang + Math.PI / 2,
          cast: false,
        });
      }
    }
  }

  // String lights from the outer tier poles to the top of the screen frame.
  const poles = [
    [-5.4, 0.2],
    [5.4, 0.2],
    [0, 1.6],
  ];
  for (const [px, pz] of poles) {
    if (px === 0) continue;
    kit.block(group, { w: 0.1, h: 3.4, d: 0.1, mat: kit.material("iron"), x: px, y: y0, z: pz });
    ctx.collider(px, pz, 0.3, 0.3, 3.4);
  }
  const strings = [
    [[-5.4, 3.4, 0.2], [-4.4, 5.8, screenZ]],
    [[5.4, 3.4, 0.2], [4.4, 5.8, screenZ]],
    [[-5.4, 3.4, 0.2], [5.4, 3.4, 0.2]],
  ];
  for (const [from, to] of strings) {
    const n = 16;
    for (let i = 1; i < n; i += 1) {
      const t = i / n;
      const sag = Math.sin(t * Math.PI) * 0.55;
      ctx.instance("bulb", from[0] + (to[0] - from[0]) * t, y0 + from[1] + (to[1] - from[1]) * t - sag, from[2] + (to[2] - from[2]) * t, { scale: 0.06 });
    }
  }

  // Projector booth to the east, lens aimed at the screen.
  const booth = { x: 5.7, z: 3.0 };
  kit.block(group, { w: 1.5, h: 1.9, d: 1.5, mat: kit.material("limewash"), x: booth.x, y: y0, z: booth.z });
  gableRoof(ctx, group, { x: booth.x, y: y0 + 1.9, z: booth.z, w: 1.7, h: 0.6, d: 1.7 });
  group.add(kit.mesh(kit.geo.cylinder(1, 1, 12), kit.material("brass"), { x: booth.x - 0.6, y: y0 + 1.45, z: booth.z - 0.6, rx: Math.PI / 2, ry: -0.6, sx: 0.12, sy: 0.4, sz: 0.12 }));
  ctx.collider(booth.x, booth.z, 1.5, 1.5, 2.5);

  // Ticket kiosk with a striped crimson awning: the cinema's interaction point.
  const kiosk = { x: -2.6, z: 4.6 };
  kit.block(group, { w: 1.3, h: 1.6, d: 1.0, mat: kit.material("limewash"), x: kiosk.x, y: y0, z: kiosk.z });
  kit.block(group, { w: 0.8, h: 0.5, d: 0.04, mat: kit.material("opening"), x: kiosk.x, y: y0 + 0.9, z: kiosk.z + 0.51 });
  for (let i = 0; i < 4; i += 1) {
    kit.block(group, {
      w: 0.38,
      h: 0.05,
      d: 0.8,
      mat: i % 2 ? kit.material("paper") : kit.material("velvet"),
      x: kiosk.x - 0.57 + i * 0.38,
      y: y0 + 1.75,
      z: kiosk.z + 0.75,
      rx: 0.3,
    });
  }
  kit.block(group, { w: 1.5, h: 0.12, d: 1.2, mat: kit.material("velvet"), x: kiosk.x, y: y0 + 1.6, z: kiosk.z });
  ctx.collider(kiosk.x, kiosk.z, 1.3, 1.0, 1.9);
  ctx.interactable({ id: "cinema-kiosk", x: kiosk.x + 1.0, y: 1.1, z: kiosk.z + 0.9 });

  // Popcorn cart.
  const cart = { x: 2.8, z: 5.0 };
  kit.block(group, { w: 1.0, h: 0.8, d: 0.7, mat: kit.material("postRed"), x: cart.x, y: y0 + 0.2, z: cart.z });
  kit.block(group, { w: 0.9, h: 0.55, d: 0.6, mat: kit.material("glass"), x: cart.x, y: y0 + 1.0, z: cart.z });
  kit.block(group, { w: 1.1, h: 0.08, d: 0.8, mat: kit.material("paper"), x: cart.x, y: y0 + 1.55, z: cart.z });
  for (const dx of [-0.4, 0.4]) kit.cylinder(group, { r: 0.2, h: 0.06, mat: kit.material("iron"), x: cart.x + dx, y: y0 + 0.2, z: cart.z + 0.38, rx: Math.PI / 2, segments: 12 });
  ctx.collider(cart.x, cart.z, 1.1, 0.8, 1.6);

  entranceSign(ctx, { x: 4.6, z: 5.6, ry: -0.3 });
}
