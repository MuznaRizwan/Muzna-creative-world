/**
 * Shrinks the cat's animation files (Cat IDLE / Waliking / running / General
 * interaction .glb). The site takes only their animations (see
 * src/lib/three/avatar/catClips.js); the mesh, skin, materials and textures
 * inside each file are a second copy of Cat.glb that is downloaded and thrown
 * away. This keeps every node (the bones the tracks target) and every
 * animation byte for byte, and drops the rest. Cat.glb is not touched.
 *
 *   node scripts/optimize-cat-clips.mjs            report what would change
 *   node scripts/optimize-cat-clips.mjs --write    rewrite the files (originals backed up first)
 *
 * Node built-ins only. Re-run after re-exporting the animations from Blender.
 */

import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FOLDER = path.join(ROOT, "public/models/Cat Muzna/Cat Muzna");
const CLIP_FILES = ["Cat IDLE.glb", "Cat Waliking.glb", "Cat running.glb", "Cat General interaction.glb"];
const BACKUP = path.join(ROOT, "art-source/blender/cat/web-export-originals"); // git-ignored
const write = process.argv.includes("--write");

const COMPONENT_SIZE = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
const COMPONENTS = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 };
const DROPPED_EXTENSIONS = /^(KHR_materials_|KHR_texture_|KHR_draco_mesh_compression|EXT_meshopt_compression|EXT_texture_)/;

/** @param {Buffer} file */
function readGlb(file) {
  if (file.toString("ascii", 0, 4) !== "glTF" || file.readUInt32LE(4) !== 2) throw new Error("not a glTF 2.0 binary");
  const jsonLength = file.readUInt32LE(12);
  const json = JSON.parse(file.toString("utf8", 20, 20 + jsonLength));
  const binStart = 20 + jsonLength;
  const bin = binStart < file.length ? file.subarray(binStart + 8, binStart + 8 + file.readUInt32LE(binStart)) : Buffer.alloc(0);
  return { json, bin };
}

/** @param {object} json @param {Buffer} bin */
function writeGlb(json, bin) {
  const pad = (/** @type {Buffer} */ b, /** @type {number} */ fill) => {
    const extra = (4 - (b.length % 4)) % 4;
    return extra ? Buffer.concat([b, Buffer.alloc(extra, fill)]) : b;
  };
  const jsonChunk = pad(Buffer.from(JSON.stringify(json), "utf8"), 0x20);
  const binChunk = pad(bin, 0);
  const header = Buffer.alloc(12);
  header.write("glTF", 0, "ascii");
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + jsonChunk.length + 8 + binChunk.length, 8);
  const chunkHeader = (/** @type {number} */ length, /** @type {string} */ type) => {
    const h = Buffer.alloc(8);
    h.writeUInt32LE(length, 0);
    h.write(type, 4, "ascii");
    return h;
  };
  return Buffer.concat([header, chunkHeader(jsonChunk.length, "JSON"), jsonChunk, chunkHeader(binChunk.length, "BIN\0"), binChunk]);
}

/** The accessor's elements as a tightly packed buffer. @param {any} json @param {Buffer} bin @param {number} index */
function accessorBytes(json, bin, index) {
  const accessor = json.accessors[index];
  if (accessor.sparse) throw new Error(`accessor ${index} is sparse (not supported)`);
  const elementSize = COMPONENT_SIZE[accessor.componentType] * COMPONENTS[accessor.type];
  const view = json.bufferViews[accessor.bufferView];
  const start = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
  const stride = view.byteStride ?? elementSize;
  if (stride === elementSize) return Buffer.from(bin.subarray(start, start + elementSize * accessor.count));
  const out = Buffer.alloc(elementSize * accessor.count);
  for (let i = 0; i < accessor.count; i++) bin.copy(out, i * elementSize, start + i * stride, start + i * stride + elementSize);
  return out;
}

/** @param {any} json @param {Buffer} bin */
function stripToAnimations(json, bin) {
  const used = new Map(); // old accessor index -> new index
  const accessors = [];
  const bufferViews = [];
  const parts = [];
  let offset = 0;
  const keep = (/** @type {number} */ oldIndex) => {
    if (used.has(oldIndex)) return used.get(oldIndex);
    const bytes = accessorBytes(json, bin, oldIndex);
    const { bufferView: _view, byteOffset: _offset, ...rest } = json.accessors[oldIndex];
    bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: bytes.length });
    accessors.push({ ...rest, bufferView: bufferViews.length - 1 });
    parts.push(bytes);
    offset += bytes.length;
    const padding = (4 - (offset % 4)) % 4;
    if (padding) {
      parts.push(Buffer.alloc(padding));
      offset += padding;
    }
    used.set(oldIndex, accessors.length - 1);
    return accessors.length - 1;
  };

  const animations = (json.animations ?? []).map((animation) => ({
    ...animation,
    samplers: animation.samplers.map((sampler) => ({ ...sampler, input: keep(sampler.input), output: keep(sampler.output) })),
  }));
  const nodes = (json.nodes ?? []).map(({ mesh: _mesh, skin: _skin, weights: _weights, ...node }) => node);

  const out = { asset: json.asset, scene: json.scene, scenes: json.scenes, nodes, animations, accessors, bufferViews };
  const newBin = Buffer.concat(parts);
  out.buffers = [{ byteLength: newBin.length }];
  if (json.extras) out.extras = json.extras;

  // Keep only extensions that are still referenced.
  const text = JSON.stringify(out);
  const extensions = (json.extensionsUsed ?? []).filter((name) => !DROPPED_EXTENSIONS.test(name) && text.includes(`"${name}"`));
  if (extensions.length) out.extensionsUsed = extensions;
  const required = (json.extensionsRequired ?? []).filter((name) => extensions.includes(name));
  if (required.length) out.extensionsRequired = required;
  return { json: out, bin: newBin };
}

/** Check the stripped file animates exactly like the original. @param {any} a @param {Buffer} aBin @param {any} b @param {Buffer} bBin */
function verify(a, aBin, b, bBin) {
  const names = (/** @type {any} */ j) => (j.nodes ?? []).map((n, i) => `${i}:${n.name}`).join("|");
  if (names(a) !== names(b)) throw new Error("node list changed");
  if (a.animations.length !== b.animations.length) throw new Error("animation count changed");
  a.animations.forEach((animation, i) => {
    const other = b.animations[i];
    if (animation.name !== other.name) throw new Error(`animation ${i} renamed`);
    if (JSON.stringify(animation.channels) !== JSON.stringify(other.channels)) throw new Error(`channels of ${animation.name} changed`);
    animation.samplers.forEach((sampler, s) => {
      const twin = other.samplers[s];
      if ((sampler.interpolation ?? "LINEAR") !== (twin.interpolation ?? "LINEAR")) throw new Error("interpolation changed");
      for (const key of ["input", "output"]) {
        if (!accessorBytes(a, aBin, sampler[key]).equals(accessorBytes(b, bBin, twin[key]))) {
          throw new Error(`${animation.name} sampler ${s} ${key} data differs`);
        }
      }
    });
  });
}

let before = 0;
let after = 0;
if (write) await mkdir(BACKUP, { recursive: true });
for (const name of CLIP_FILES) {
  const file = path.join(FOLDER, name);
  const original = await readFile(file);
  const { json, bin } = readGlb(original);
  if (!json.meshes?.length && !json.images?.length) {
    console.log(`${name}: already stripped (${(original.length / 1048576).toFixed(2)} MB), skipped`);
    before += original.length;
    after += original.length;
    continue;
  }
  const stripped = stripToAnimations(json, bin);
  const output = writeGlb(stripped.json, stripped.bin);
  const reread = readGlb(output);
  verify(json, bin, reread.json, reread.bin);
  before += original.length;
  after += output.length;
  console.log(
    `${name}: ${(original.length / 1048576).toFixed(2)} MB -> ${(output.length / 1048576).toFixed(2)} MB ` +
      `(${json.animations.length} animations, ${json.nodes.length} nodes kept; verified)`
  );
  if (write) {
    const backup = path.join(BACKUP, name);
    const exists = await stat(backup).then(() => true, () => false);
    if (!exists) await copyFile(file, backup);
    await writeFile(file, output);
  }
}
console.log(`\nClip files: ${(before / 1048576).toFixed(2)} MB -> ${(after / 1048576).toFixed(2)} MB${write ? " (written; originals in art-source/blender/cat/web-export-originals/)" : " (dry run: add --write to save)"}`);
