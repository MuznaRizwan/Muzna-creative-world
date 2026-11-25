import * as THREE from "three";

import { NIGHT_PALETTE } from "@/constants/world";

/** Radius of the pool of lamplight on the ground, and the halo size around each lamp head. */
const POOL_RADIUS = 2.8;
const HALO_SIZE = 1.5;

/**
 * Soft white-to-clear radial gradient, shared by the pools and halos.
 * @param {import("../kit").Kit} kit
 */
function glowTexture(kit) {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext("2d"));
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.55)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return kit.tracker.track(texture);
}

/**
 * Night-only lamplight: a warm pool on the ground under every path lamp and a
 * halo around its lantern. Both are additive and unlit (no real light sources,
 * so they cost almost nothing), and invisible by day.
 *
 * @param {import("../kit").Kit} kit
 * @param {{ x: number, y: number, z: number, ground: number }[]} lamps Lantern positions and the ground height below each.
 */
export function createNightLights(kit, lamps) {
  const group = new THREE.Group();
  group.name = "night-lights";
  group.visible = false;
  group.userData.dynamic = true;
  if (lamps.length === 0) return { group, setStrength: () => {} };

  const texture = glowTexture(kit);
  const colour = new THREE.Color(NIGHT_PALETTE.lampGlow);

  const poolMaterial = kit.tracker.track(
    new THREE.MeshBasicMaterial({
      map: texture,
      color: colour,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: true,
    })
  );
  const poolGeometry = kit.geometry("lampPool", () => new THREE.PlaneGeometry(POOL_RADIUS * 2, POOL_RADIUS * 2).rotateX(-Math.PI / 2));
  const pools = new THREE.InstancedMesh(poolGeometry, poolMaterial, lamps.length);
  pools.name = "lamp-pools";
  pools.renderOrder = 1;
  const matrix = new THREE.Matrix4();
  lamps.forEach((lamp, i) => {
    // Just above the path ribbon so it never flickers against it.
    matrix.makeTranslation(lamp.x, lamp.ground + 0.07, lamp.z);
    pools.setMatrixAt(i, matrix);
  });
  pools.computeBoundingSphere();
  kit.tracker.track(pools);

  const haloMaterial = kit.tracker.track(
    new THREE.PointsMaterial({
      map: texture,
      color: colour,
      size: HALO_SIZE,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: true,
    })
  );
  const haloGeometry = kit.tracker.track(
    new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(lamps.flatMap((l) => [l.x, l.y, l.z]), 3))
  );
  const halos = new THREE.Points(haloGeometry, haloMaterial);
  halos.name = "lamp-halos";
  halos.renderOrder = 2;

  group.add(pools, halos);

  return {
    group,
    /** @param {number} t 0 = day (hidden), 1 = full night. */
    setStrength(t) {
      group.visible = t > 0.01;
      poolMaterial.opacity = 0.55 * t;
      haloMaterial.opacity = 0.7 * t;
    },
  };
}

/**
 * Everything in the world that glows (windows, bulbs, lanterns, screens):
 * brighter at night. Screens that only tint flat white by day show their
 * picture as the glow at night, so they stay readable in the dark.
 *
 * @param {THREE.Object3D} root
 */
export function collectGlowingMaterials(root) {
  /** @type {{ material: THREE.MeshStandardMaterial, day: number, night: number, screen: boolean }[]} */
  const glowing = [];
  const seen = new Set();
  root.traverse((object) => {
    const mesh = /** @type {THREE.Mesh} */ (object);
    if (!mesh.material) return;
    for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      const material = /** @type {THREE.MeshStandardMaterial} */ (m);
      if (seen.has(material) || !material.isMeshStandardMaterial) continue;
      seen.add(material);
      const day = material.emissiveIntensity;
      if (day <= 0 || material.emissive.getHex() === 0) continue;
      const screen = Boolean(material.map) && !material.emissiveMap;
      const textured = Boolean(material.map || material.emissiveMap);
      // Faint glows (windows, screens) gain the most; bulbs are already bright.
      const night = day < 1 ? Math.min(day * 3, textured ? 1 : 1.8) : day * 1.6;
      glowing.push({ material, day, night, screen });
    }
  });

  return {
    /** @param {number} t */
    setStrength(t) {
      for (const entry of glowing) {
        const { material } = entry;
        material.emissiveIntensity = THREE.MathUtils.lerp(entry.day, entry.night, t);
        if (entry.screen) {
          const emissiveMap = t > 0.5 ? material.map : null;
          if (material.emissiveMap !== emissiveMap) {
            material.emissiveMap = emissiveMap;
            material.needsUpdate = true;
          }
        }
      }
    },
  };
}
