import * as THREE from "three";

/**
 * Extracts the cat's animation clips from their separate GLB files.
 *
 * Every file was exported from the same Blender rig: identical bone names,
 * hierarchy, rest pose and inverse bind matrices to `Cat.glb` (checked when the
 * assets were integrated). So the clips bind to the base model directly by
 * bone name; no retargeting is needed. Each file's armature action is called
 * `rigAction`; its other tiny object actions (0 s) are ignored.
 *
 * Processing per clip:
 * - Keep only tracks that target bones of the base model.
 * - Remove root motion: the running clip moves `root` (and the Rigify
 *   top-level helper bones that follow it) 13 units forward per cycle. The
 *   controller moves the cat, so that drift is subtracted and the clip runs in
 *   place.
 * - Drop tracks that hold one constant value equal to the bind pose: they
 *   change nothing, and there are ~2,300 tracks per clip on this rig.
 */

/** @typedef {"idle" | "walk" | "run" | "interact"} CatClipName */

/** Name of the armature action in each exported file. */
const RIG_ACTION = "rigAction";

/**
 * @param {THREE.AnimationClip[]} animations
 * @returns {THREE.AnimationClip | undefined}
 */
function findRigClip(animations) {
  return animations.find((clip) => clip.name === RIG_ACTION) ?? [...animations].sort((a, b) => b.tracks.length - a.tracks.length)[0];
}

/**
 * Release everything a loaded animation file created (its copy of the cat is
 * never shown).
 * @param {THREE.Object3D} scene
 */
function disposeScene(scene) {
  scene.traverse((object) => {
    const mesh = /** @type {THREE.Mesh} */ (object);
    if (!mesh.isMesh) return;
    mesh.geometry.dispose();
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      for (const value of Object.values(material)) {
        if (value && /** @type {THREE.Texture} */ (value).isTexture) /** @type {THREE.Texture} */ (value).dispose();
      }
      material.dispose();
    }
  });
}

/** @param {string} trackName */
function splitTrack(trackName) {
  const dot = trackName.lastIndexOf(".");
  return { node: trackName.slice(0, dot), property: trackName.slice(dot + 1) };
}

/**
 * Subtract the horizontal travel of `root` from the root bone and from every
 * top-level bone whose track drifts the same way.
 * @param {THREE.AnimationClip} clip
 * @param {THREE.Object3D} rig  The armature object of the base model.
 * @returns {number} Distance travelled per cycle in model units (0 if none).
 */
function removeRootMotion(clip, rig) {
  const rootTrack = clip.tracks.find((t) => t.name === "root.position");
  if (!rootTrack || rootTrack.times.length < 2) return 0;
  // Sample from an untouched copy while the tracks are edited.
  const reference = rootTrack.clone();
  const base = reference.values;
  const last = base.length - 3;
  const driftX = base[last] - base[0];
  const driftZ = base[last + 2] - base[2];
  const travel = Math.hypot(driftX, driftZ);
  if (travel < 0.05) return 0;

  const sampler = reference.createInterpolant();
  const topLevel = new Set(rig.children.map((child) => child.name));
  for (const track of clip.tracks) {
    const { node, property } = splitTrack(track.name);
    if (property !== "position" || !topLevel.has(node)) continue;
    const v = track.values;
    const n = v.length - 3;
    const dx = v[n] - v[0];
    const dz = v[n + 2] - v[2];
    // Only tracks that actually follow the root (within 5%).
    if (Math.hypot(dx - driftX, dz - driftZ) > travel * 0.05) continue;
    for (let i = 0; i < track.times.length; i += 1) {
      const r = sampler.evaluate(track.times[i]);
      v[i * 3] -= r[0] - base[0];
      v[i * 3 + 2] -= r[2] - base[2];
    }
  }
  return travel;
}

/**
 * @param {THREE.KeyframeTrack} track
 * @param {THREE.Object3D} node
 */
function isConstantRestTrack(track, node) {
  const { property } = splitTrack(track.name);
  const size = track.getValueSize();
  const v = track.values;
  /** @type {number[]} */
  let rest;
  if (property === "position") rest = node.position.toArray();
  else if (property === "quaternion") rest = node.quaternion.toArray();
  else if (property === "scale") rest = node.scale.toArray();
  else return false;
  for (let i = 0; i < v.length; i += size) {
    for (let k = 0; k < size; k += 1) {
      if (Math.abs(v[i + k] - rest[k]) > 1e-5) {
        // Quaternions q and −q are the same rotation.
        if (property !== "quaternion") return false;
        let same = true;
        for (let j = 0; j < 4; j += 1) if (Math.abs(v[i + j] + rest[j]) > 1e-5) same = false;
        if (!same) return false;
        break;
      }
    }
  }
  return true;
}

/**
 * @param {THREE.AnimationClip} source
 * @param {CatClipName} name
 * @param {THREE.Object3D} model  The prepared base model scene.
 * @param {THREE.Object3D} rig
 */
export function prepareClip(source, name, model, rig) {
  /** @type {Map<string, THREE.Object3D>} */
  const nodes = new Map();
  model.traverse((object) => {
    if (!nodes.has(object.name)) nodes.set(object.name, object);
  });

  const clip = source.clone();
  clip.name = name;
  const before = clip.tracks.length;
  clip.tracks = clip.tracks.filter((track) => nodes.has(splitTrack(track.name).node));
  const travel = removeRootMotion(clip, rig);
  clip.optimize();
  clip.tracks = clip.tracks.filter((track) => {
    const node = nodes.get(splitTrack(track.name).node);
    return node ? !isConstantRestTrack(track, node) : false;
  });
  clip.resetDuration();
  return { clip, travel, tracksBefore: before, tracksAfter: clip.tracks.length };
}

/**
 * Load the animation files in parallel and return prepared clips.
 * @param {import("../loaders/AssetLoader").AssetLoader} loader
 * @param {Record<CatClipName, string>} urls
 * @param {THREE.Object3D} model
 * @returns {Promise<{ clips: Record<CatClipName, THREE.AnimationClip>, report: Record<CatClipName, { source: string, duration: number, travel: number, tracksBefore: number, tracksAfter: number }> }>}
 */
export async function loadCatClips(loader, urls, model) {
  const rig = model.getObjectByName("rig") ?? model;
  const entries = /** @type {[CatClipName, string][]} */ (Object.entries(urls));
  const loaded = await Promise.all(entries.map(([, url]) => loader.loadGLTF(url)));

  /** @type {Partial<Record<CatClipName, THREE.AnimationClip>>} */
  const clips = {};
  /** @type {Partial<Record<CatClipName, { source: string, duration: number, travel: number, tracksBefore: number, tracksAfter: number }>>} */
  const report = {};
  entries.forEach(([name], i) => {
    const gltf = loaded[i];
    const source = findRigClip(gltf.animations);
    disposeScene(gltf.scene);
    if (!source) throw new Error(`No animation found in the "${name}" file.`);
    const { clip, travel, tracksBefore, tracksAfter } = prepareClip(source, name, model, rig);
    clips[name] = clip;
    report[name] = { source: source.name, duration: clip.duration, travel, tracksBefore, tracksAfter };
  });
  return {
    clips: /** @type {Record<CatClipName, THREE.AnimationClip>} */ (clips),
    report: /** @type {any} */ (report),
  };
}
