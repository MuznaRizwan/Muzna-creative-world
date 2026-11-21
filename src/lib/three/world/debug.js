import * as THREE from "three";

import { CAT_METRICS, WORLD } from "@/constants/world";

import { heightAt } from "./terrain";

/**
 * @typedef {object} Collider
 * @property {number} minX @property {number} maxX
 * @property {number} minY @property {number} maxY
 * @property {number} minZ @property {number} maxZ
 */

/**
 * Developer overlay (hidden by default): collider boxes, interaction radii
 * and cat-sized scale proxies, for checking the world against the cat metrics.
 * @param {import("./kit").Kit} kit
 * @param {{ colliders: Collider[], interactables: { x: number, y: number, z: number }[] }} data
 */
export function createDebugLayer(kit, { colliders, interactables }) {
  const group = new THREE.Group();
  group.name = "debug";
  group.visible = false;
  group.userData.dynamic = true;

  // Collider boxes as one line-segment geometry.
  const boxPositions = [];
  for (const c of colliders) {
    const corners = [
      [c.minX, c.minY, c.minZ], [c.maxX, c.minY, c.minZ], [c.maxX, c.minY, c.maxZ], [c.minX, c.minY, c.maxZ],
      [c.minX, c.maxY, c.minZ], [c.maxX, c.maxY, c.minZ], [c.maxX, c.maxY, c.maxZ], [c.minX, c.maxY, c.maxZ],
    ];
    const edges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    for (const [a, b] of edges) boxPositions.push(...corners[a], ...corners[b]);
  }
  const boxGeometry = kit.tracker.track(new THREE.BufferGeometry());
  boxGeometry.setAttribute("position", new THREE.Float32BufferAttribute(boxPositions, 3));
  const lineMaterial = kit.tracker.track(new THREE.LineBasicMaterial({ color: "#ffd27a", depthTest: false, transparent: true, opacity: 0.8 }));
  group.add(new THREE.LineSegments(boxGeometry, lineMaterial));

  // Interaction radius circles.
  const ringPositions = [];
  for (const point of interactables) {
    const y = heightAt(point.x, point.z) + 0.1;
    for (let i = 0; i < 32; i += 1) {
      const a = (i / 32) * Math.PI * 2;
      const b = ((i + 1) / 32) * Math.PI * 2;
      const r = CAT_METRICS.interactRadius;
      ringPositions.push(point.x + Math.cos(a) * r, y, point.z + Math.sin(a) * r, point.x + Math.cos(b) * r, y, point.z + Math.sin(b) * r);
    }
  }
  const ringGeometry = kit.tracker.track(new THREE.BufferGeometry());
  ringGeometry.setAttribute("position", new THREE.Float32BufferAttribute(ringPositions, 3));
  const ringMaterial = kit.tracker.track(new THREE.LineBasicMaterial({ color: "#c084fc", depthTest: false, transparent: true, opacity: 0.9 }));
  group.add(new THREE.LineSegments(ringGeometry, ringMaterial));

  // Cat-sized proxies (1.1 long × 0.95 tall × 0.4 wide): a scale reference, not the cat.
  const proxyGeometry = kit.geometry("catProxy", () => new THREE.BoxGeometry(CAT_METRICS.width, CAT_METRICS.height * 0.95, CAT_METRICS.length));
  const proxyMaterial = kit.tracker.track(new THREE.MeshBasicMaterial({ color: "#c084fc", wireframe: true }));
  const spots = [
    [WORLD.spawn.x, WORLD.spawn.z],
    [-17.5, 12.9],
    [1.6, 9.0],
    [-1.0, 32.6],
  ];
  for (const [x, z] of spots) {
    const proxy = new THREE.Mesh(proxyGeometry, proxyMaterial);
    proxy.position.set(x, heightAt(x, z) + 0.06 + (CAT_METRICS.height * 0.95) / 2, z);
    group.add(proxy);
  }

  return group;
}
