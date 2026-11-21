import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const KEEP_ATTRIBUTES = ["position", "normal", "uv"];

/**
 * Merge every static mesh under `root` into one mesh per material, cutting draw
 * calls from hundreds to a handful per location. Objects flagged
 * `userData.dynamic = true` (and their children) are left untouched.
 *
 * Source geometries are cloned before baking, so shared geometries stay intact;
 * the merged geometries are registered with the tracker.
 *
 * @param {THREE.Object3D} root
 * @param {import("./ResourceTracker").ResourceTracker} tracker
 * @returns {number} Number of meshes merged away.
 */
export function batchStaticMeshes(root, tracker) {
  root.updateMatrixWorld(true);
  const rootInverse = new THREE.Matrix4().copy(root.matrixWorld).invert();

  /** @type {Map<string, { material: THREE.Material, cast: boolean, receive: boolean, meshes: THREE.Mesh[] }>} */
  const buckets = new Map();

  /** @param {THREE.Object3D} node */
  const visit = (node) => {
    if (node.userData.dynamic) return;
    const mesh = /** @type {THREE.Mesh} */ (node);
    if (mesh.isMesh && !(/** @type {any} */ (mesh).isInstancedMesh) && !Array.isArray(mesh.material)) {
      const key = `${mesh.material.uuid}|${mesh.castShadow}|${mesh.receiveShadow}`;
      let bucket = buckets.get(key);
      if (!bucket) {
        bucket = { material: mesh.material, cast: mesh.castShadow, receive: mesh.receiveShadow, meshes: [] };
        buckets.set(key, bucket);
      }
      bucket.meshes.push(mesh);
    }
    for (const child of node.children) visit(child);
  };
  for (const child of root.children) visit(child);

  let merged = 0;
  const relative = new THREE.Matrix4();

  for (const bucket of buckets.values()) {
    if (bucket.meshes.length < 2) continue;

    const parts = bucket.meshes.map((mesh) => {
      relative.multiplyMatrices(rootInverse, mesh.matrixWorld);
      let geometry = mesh.geometry.clone();
      if (geometry.index) {
        const flat = geometry.toNonIndexed();
        geometry.dispose();
        geometry = flat;
      }
      for (const name of Object.keys(geometry.attributes)) {
        if (!KEEP_ATTRIBUTES.includes(name)) geometry.deleteAttribute(name);
      }
      if (!geometry.attributes.uv) {
        const count = geometry.attributes.position.count;
        geometry.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(count * 2), 2));
      }
      geometry.clearGroups();
      geometry.applyMatrix4(relative);
      return geometry;
    });

    const combined = mergeGeometries(parts, false);
    for (const part of parts) part.dispose();
    if (!combined) continue;

    tracker.track(combined);
    const batch = new THREE.Mesh(combined, bucket.material);
    batch.castShadow = bucket.cast;
    batch.receiveShadow = bucket.receive;
    batch.name = "static-batch";
    root.add(batch);

    for (const mesh of bucket.meshes) {
      mesh.removeFromParent();
      merged += 1;
    }
  }

  // Drop groups left empty after their meshes were merged.
  /** @type {THREE.Object3D[]} */
  const empty = [];
  root.traverse((node) => {
    if (node !== root && node.type === "Group" && node.children.length === 0 && !node.userData.dynamic) {
      empty.push(node);
    }
  });
  for (const node of empty) node.removeFromParent();

  return merged;
}
