import * as THREE from "three";

import { PALETTE, WORLD } from "@/constants/world";

import { islandOutline, slabGeometry, tierOutline } from "../terrain";

/**
 * Island ground: beach ring, grass terraces (south → north) and the shallow
 * water band around the shore.
 * @param {import("../kit").Kit} kit
 * @returns {THREE.Group}
 */
export function createGround(kit) {
  const { tracker, material } = kit;
  const group = new THREE.Group();
  group.name = "ground";

  // Beach: a sand ring just above the water.
  const beach = new THREE.Mesh(
    tracker.track(slabGeometry(islandOutline(WORLD.beachWidth), -1.2, WORLD.beachLevel, 0.08)),
    material("beach")
  );
  beach.receiveShadow = true;
  group.add(beach);

  // Grass terraces. Each slab starts just below the previous tier's top so the
  // side faces never overlap (no z-fighting), and its sides read as stone kerbs.
  const sides = [material("earth"), material("kerb"), material("kerb"), material("kerb")];
  WORLD.tiers.forEach((tier, index) => {
    const bottom = index === 0 ? -0.7 : WORLD.tiers[index - 1].height - 0.01;
    const geometry = tracker.track(slabGeometry(tierOutline(index), bottom, tier.height, index === 0 ? 0.08 : 0.04));
    const slab = new THREE.Mesh(geometry, [material("grass"), sides[index]]);
    slab.name = `terrace-${index}`;
    slab.receiveShadow = true;
    slab.castShadow = index > 0;
    group.add(slab);
  });

  group.add(createShallows(kit));
  return group;
}

/**
 * Light turquoise band fading from the beach into the lagoon (vertex colours with alpha).
 * @param {import("../kit").Kit} kit
 */
function createShallows(kit) {
  const inner = islandOutline(WORLD.beachWidth - 0.4);
  const outer = islandOutline(WORLD.beachWidth + 9);
  const positions = [];
  const colors = [];
  const color = new THREE.Color(PALETTE.shallows);
  const y = WORLD.waterLevel + 0.02;
  for (let i = 0; i < inner.length; i += 1) {
    positions.push(inner[i].x, y, inner[i].z, outer[i].x, y, outer[i].z);
    colors.push(color.r, color.g, color.b, 0.9, color.r, color.g, color.b, 0);
  }
  const indices = [];
  const n = inner.length;
  for (let i = 0; i < n; i += 1) {
    const a = i * 2;
    const b = ((i + 1) % n) * 2;
    indices.push(a, a + 1, b, b, a + 1, b + 1);
  }
  const geometry = kit.tracker.track(new THREE.BufferGeometry());
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 4));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const shallows = new THREE.Mesh(
    geometry,
    kit.tracker.track(
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        roughness: 0.3,
        side: THREE.DoubleSide,
      })
    )
  );
  shallows.name = "shallows";
  shallows.renderOrder = 1;
  return shallows;
}
