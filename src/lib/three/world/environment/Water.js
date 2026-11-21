import * as THREE from "three";

import { WORLD } from "@/constants/world";

/**
 * Calm lagoon around the island. It fades into the haze with distance, so the
 * island reads as one place in the sea rather than a floating platform.
 * @param {import("../kit").Kit} kit
 */
export function createWater(kit) {
  const water = kit.mesh(
    kit.geometry("water", () => new THREE.PlaneGeometry(900, 900).rotateX(-Math.PI / 2)),
    kit.material("water"),
    { y: WORLD.waterLevel, cast: false, receive: true }
  );
  water.name = "lagoon";
  return water;
}
