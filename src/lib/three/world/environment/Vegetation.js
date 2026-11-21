import { PALETTE } from "@/constants/world";
import { LANDMARK_TREES } from "@/data/worldLayout";

import { createRandom } from "../../utils/random";
import { heightAt, islandRadius, isOnIsland } from "../terrain";
import { isInZone } from "./Paths";

const CANOPY_GREENS = ["#7F9A5A", "#6E8A4E", "#8FA864", "#768F55"];
const GRASS_GREENS = ["#93A862", "#A3B26B", "#86995A", "#B0BD78"];
const FLOWERS = [PALETTE.bougainvillea, "#F4EFE6", PALETTE.marigold, PALETTE.rose];

/**
 * Builds a spatial check that keeps vegetation off paths and locations.
 * @param {ReturnType<typeof import("./Paths").samplePaths>} sampled
 */
function createClearance(sampled) {
  const points = sampled.flatMap((path) => path.samples.map((s) => ({ x: s.x, z: s.z, r: path.width / 2 })));
  /**
   * @param {number} x @param {number} z @param {number} margin
   */
  return (x, z, margin) => {
    if (!isOnIsland(x, z, 2.2)) return false;
    if (isInZone(x, z, margin)) return false;
    for (const p of points) {
      const dx = x - p.x;
      const dz = z - p.z;
      const limit = p.r + margin;
      if (dx * dx + dz * dz < limit * limit) return false;
    }
    return true;
  };
}

/**
 * Neem-style round trees, cypress columns, date palms on the shore, grass
 * tufts, lavender and wildflowers. Everything is instanced and placed with a
 * seeded random generator, so the layout is identical on every load.
 * @param {import("../instances").InstanceBuckets} instances
 * @param {ReturnType<typeof import("./Paths").samplePaths>} sampled
 * @param {(collider: { x: number, z: number, w: number, d: number, h: number }) => void} addCollider
 */
export function createVegetation(instances, sampled, addCollider) {
  const random = createRandom(2024);
  const isClear = createClearance(sampled);
  /** @type {{ x: number, z: number }[]} */
  const trees = [];

  /** @param {number} x @param {number} z */
  const farFromTrees = (x, z) => trees.every((t) => Math.hypot(t.x - x, t.z - z) > 3.2);

  /** @param {number} x @param {number} z @param {number} scale */
  const addRoundTree = (x, z, scale) => {
    const y = heightAt(x, z);
    const trunkHeight = 1.9 * scale;
    instances.add("trunk", x, y + trunkHeight / 2, z, { size: [0.2 * scale, trunkHeight, 0.2 * scale] });
    const blobs = 3;
    for (let i = 0; i < blobs; i += 1) {
      const a = (i / blobs) * Math.PI * 2 + random.range(0, 1);
      const r = i === 0 ? 0 : 0.55 * scale;
      instances.add("canopy", x + Math.cos(a) * r, y + trunkHeight + (0.5 + random.range(0, 0.5)) * scale, z + Math.sin(a) * r, {
        scale: random.range(0.95, 1.25) * scale,
        ry: random.range(0, Math.PI),
        color: random.pick(CANOPY_GREENS),
      });
    }
    trees.push({ x, z });
    addCollider({ x, z, w: 0.5 * scale, d: 0.5 * scale, h: trunkHeight });
  };

  /** @param {number} x @param {number} z @param {number} scale */
  const addCypress = (x, z, scale) => {
    const y = heightAt(x, z);
    instances.add("trunk", x, y + 0.3, z, { size: [0.12, 0.6, 0.12] });
    instances.add("cypress", x, y + 0.5 + 1.5 * scale, z, {
      size: [0.55 * scale, 1.7 * scale, 0.55 * scale],
      color: PALETTE.meadowShade,
    });
    trees.push({ x, z });
    addCollider({ x, z, w: 0.6 * scale, d: 0.6 * scale, h: 3 * scale });
  };

  // Hand-placed trees framing districts.
  for (const [x, z] of LANDMARK_TREES) {
    if (isClear(x, z, 1.6) && farFromTrees(x, z)) addRoundTree(x, z, random.range(1.05, 1.3));
  }

  // Scattered trees and cypresses: clusters near the island edge, sparse inland.
  let attempts = 0;
  while (trees.length < 95 && attempts < 4000) {
    attempts += 1;
    const angle = random.range(0, Math.PI * 2);
    const edge = islandRadius(angle);
    const r = edge * Math.sqrt(random.range(0.12, 1)) - 2.5;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    if (!isClear(x, z, 1.8) || !farFromTrees(x, z)) continue;
    if (random.next() < 0.3) addCypress(x, z, random.range(0.85, 1.2));
    else addRoundTree(x, z, random.range(0.75, 1.15));
  }

  // Date palms leaning over the beach, just outside the wall.
  for (let i = 0; i < 26; i += 1) {
    const angle = random.range(0, Math.PI * 2);
    const r = islandRadius(angle) + random.range(0.8, 2.2);
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const height = random.range(3.4, 4.8);
    const lean = random.range(0.12, 0.26);
    const outX = Math.cos(angle);
    const outZ = Math.sin(angle);
    instances.add("palmTrunk", x + outX * lean * height * 0.5, -0.15 + height / 2, z + outZ * lean * height * 0.5, {
      size: [0.16, height, 0.16],
      rx: outZ * lean,
      rz: -outX * lean,
    });
    const topX = x + outX * lean * height;
    const topZ = z + outZ * lean * height;
    for (let f = 0; f < 7; f += 1) {
      const a = (f / 7) * Math.PI * 2;
      instances.add("palmFrond", topX + Math.cos(a) * 0.7, -0.15 + height - 0.1, topZ + Math.sin(a) * 0.7, {
        size: [0.22, 1.8, 0.08],
        ry: -a,
        // Tip points outwards and droops slightly.
        rz: -(Math.PI / 2 + 0.35),
        color: random.pick(CANOPY_GREENS),
      });
    }
  }

  // Grass tufts and wildflowers along verges.
  let placed = 0;
  attempts = 0;
  while (placed < 1400 && attempts < 9000) {
    attempts += 1;
    const angle = random.range(0, Math.PI * 2);
    const r = islandRadius(angle) * Math.sqrt(random.next()) - 1.5;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    if (!isClear(x, z, 0.35)) continue;
    const y = heightAt(x, z);
    placed += 1;
    if (placed % 9 === 0) {
      instances.add("flower", x, y + 0.12, z, { scale: random.range(0.07, 0.11), color: random.pick(FLOWERS) });
    } else {
      instances.add("grass", x, y + 0.14, z, {
        size: [0.08, random.range(0.22, 0.36), 0.08],
        ry: random.range(0, Math.PI),
        rx: random.range(-0.2, 0.2),
        color: random.pick(GRASS_GREENS),
      });
    }
  }
}

/**
 * Lavender field rows (west of the Creative Studio).
 * @param {import("../instances").InstanceBuckets} instances
 * @param {{ x: number, z: number, rows: number, length: number, spacing: number }} field
 */
export function createLavenderField(instances, { x, z, rows, length, spacing }) {
  const random = createRandom(31);
  for (let row = 0; row < rows; row += 1) {
    for (let k = 0; k < length / 0.45; k += 1) {
      const px = x + row * spacing + random.range(-0.1, 0.1);
      const pz = z + k * 0.45 + random.range(-0.1, 0.1);
      const y = heightAt(px, pz);
      instances.add("shrub", px, y + 0.2, pz, { size: [0.28, 0.24, 0.28], color: PALETTE.meadowShade });
      instances.add("lavender", px, y + 0.48, pz, {
        size: [0.13, 0.22, 0.13],
        color: random.next() < 0.5 ? PALETTE.lavenderFlower : PALETTE.lavenderBand,
      });
    }
  }
}
