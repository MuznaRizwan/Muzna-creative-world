import { PALETTE, WORLD } from "@/constants/world";

import { createRandom } from "../../utils/random";
import { islandRadius } from "../terrain";

/**
 * Low drystone wall just inside the grass edge (the walkable boundary) and
 * rocks scattered along the beach. Gaps are left where a pier or gate meets
 * the wall.
 * @param {import("../instances").InstanceBuckets} instances
 * @param {{ angle: number, halfWidth: number }[]} gaps Angular gaps (radians).
 */
export function createBoundary(instances, gaps) {
  const random = createRandom(11);
  const stoneColours = ["#C9B08C", "#B89E7A", "#D4BE9A", "#A98F6E"];
  const steps = 360;

  for (let i = 0; i < steps; i += 1) {
    const angle = (i / steps) * Math.PI * 2;
    if (gaps.some((gap) => Math.abs(Math.atan2(Math.sin(angle - gap.angle), Math.cos(angle - gap.angle))) < gap.halfWidth)) {
      continue;
    }
    const r = islandRadius(angle) - WORLD.wallInset;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const ry = -angle + random.range(-0.15, 0.15);
    // Two courses of rough stones, ~0.65 high: a clear edge, not a fortress.
    instances.add("stone", x, 0.18, z, {
      ry,
      size: [random.range(0.45, 0.6), 0.36, random.range(0.7, 0.95)],
      color: random.pick(stoneColours),
    });
    if (i % 2 === 0) {
      instances.add("stone", x, 0.5, z, {
        ry: ry + 0.3,
        size: [random.range(0.38, 0.5), 0.3, random.range(0.55, 0.8)],
        color: random.pick(stoneColours),
      });
    }
  }

  for (let i = 0; i < 70; i += 1) {
    const angle = random.range(0, Math.PI * 2);
    const r = islandRadius(angle) + random.range(1.2, WORLD.beachWidth + 1.5);
    const s = random.range(0.3, 0.9);
    instances.add("rock", Math.cos(angle) * r, WORLD.beachLevel + s * 0.2, Math.sin(angle) * r, {
      ry: random.range(0, Math.PI),
      size: [s * random.range(0.9, 1.4), s * 0.7, s],
      color: random.pick([PALETTE.kerb, "#B5A18A", "#9C8F86"]),
    });
  }
}
