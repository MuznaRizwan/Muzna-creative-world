import * as THREE from "three";

import { CAT_METRICS } from "@/constants/world";

/**
 * Loads and prepares Muzna's cat (`Cat.glb`) for the world.
 *
 * What the Blender export contains, and what is done with it:
 * - `rig`: the Rigify armature (765 bones) that skins the cat mesh `Gato`.
 *   Sunglasses and the face mask are parented to the head bone and the jacket
 *   (`Cube`) to a spine bone, so they follow the animation. Kept as is.
 * - `metarig`: the Rigify template armature. It skins nothing and shares bone
 *   names with the real rig, which could confuse animation binding: removed.
 * - `WGT-rig_*`: ~275 empty Rigify widget objects (control-bone shapes): removed.
 * - `Circle`, `Circle.005`, `Circle.006`: small trim discs on the jacket that
 *   are not parented to the rig, so they would stay behind when the cat moves.
 *   They are re-parented to the jacket, keeping their exact placement.
 * - `Cube.001`: the box the cat sniffs and taps in the interaction animation.
 *   It is a prop of that scene, not part of the cat: hidden. (In the world the
 *   cat interacts with real objects.)
 *
 * Materials, textures and proportions are left untouched; the model is only
 * scaled uniformly so the ear tips stand at CAT_METRICS.height.
 */

export const CAT_MODEL = Object.freeze({
  /** Target height of the ear tips in world units (the model is 2.7 tall in Blender). */
  height: CAT_METRICS.height,
  /** The model faces +Z, which matches yaw 0 of the character controller. */
  facingOffset: 0,
  /** Small lift so the paws rest on paving rather than inside it. */
  footLift: 0.0,
  rigName: "rig",
  jacketName: "Cube",
  trimNames: ["Circle", "Circle005", "Circle006"],
  hiddenNames: ["Cube001"],
  removedRoots: ["metarig"],
});

/**
 * @typedef {object} CatModelResult
 * @property {THREE.Group} root  Positioned by the player each frame.
 * @property {THREE.Object3D} scene  The animated glTF scene (AnimationMixer root).
 * @property {THREE.Object3D[]} meshes
 * @property {string[]} boneNames
 * @property {number} scale
 */

/**
 * @param {import("../loaders/AssetLoader").AssetLoader} loader
 * @param {string} url
 * @param {import("../utils/ResourceTracker").ResourceTracker} tracker
 * @returns {Promise<CatModelResult>}
 */
export async function loadCatModel(loader, url, tracker) {
  const gltf = await loader.loadGLTF(url);
  const scene = gltf.scene;
  scene.name = "cat-model";

  // Drop helper objects that are not part of the cat.
  for (const child of [...scene.children]) {
    const keep = child.name === CAT_MODEL.rigName || child.getObjectByProperty("isMesh", true);
    if (!keep || CAT_MODEL.removedRoots.includes(child.name)) scene.remove(child);
  }

  // Re-parent loose trim to the jacket so it follows the spine.
  const jacket = scene.getObjectByName(CAT_MODEL.jacketName);
  scene.updateMatrixWorld(true);
  for (const name of CAT_MODEL.trimNames) {
    const trim = scene.getObjectByName(name);
    if (trim && jacket && trim.parent === scene) jacket.attach(trim);
  }
  for (const name of CAT_MODEL.hiddenNames) {
    const hidden = scene.getObjectByName(name);
    if (hidden) hidden.parent?.remove(hidden);
  }

  // Measure the bind pose, then scale so the ears reach the target height.
  scene.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(scene);
  const scale = CAT_MODEL.height / Math.max(0.001, box.max.y - box.min.y);
  scene.scale.setScalar(scale);
  scene.position.y = -box.min.y * scale + CAT_MODEL.footLift;
  scene.rotation.y = CAT_MODEL.facingOffset;

  /** @type {THREE.Object3D[]} */
  const meshes = [];
  scene.traverse((object) => {
    const mesh = /** @type {THREE.Mesh} */ (object);
    if (!mesh.isMesh) return;
    meshes.push(mesh);
    // The world's shadow map is static, so the cat gets a soft blob shadow
    // instead of casting; it still receives the world's shadows.
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    // Skinned bounds come from the bind pose; animation moves the paws outside them.
    mesh.frustumCulled = false;
    tracker.track(mesh.geometry);
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      tracker.track(material);
      for (const value of Object.values(material)) {
        if (value && /** @type {THREE.Texture} */ (value).isTexture) tracker.track(value);
      }
    }
  });

  const skinned = /** @type {THREE.SkinnedMesh | undefined} */ (meshes.find((m) => /** @type {THREE.SkinnedMesh} */ (m).isSkinnedMesh));
  const boneNames = skinned ? skinned.skeleton.bones.map((bone) => bone.name) : [];
  if (skinned) tracker.track(skinned.skeleton);

  const root = new THREE.Group();
  root.name = "cat";
  root.add(scene);
  return { root, scene, meshes, boneNames, scale };
}
