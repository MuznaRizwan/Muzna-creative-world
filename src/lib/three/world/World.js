import * as THREE from "three";

import { PALETTE, WORLD } from "@/constants/world";
import { SIGNPOSTS, ZONE_BY_ID, ZONES } from "@/data/worldLayout";

import { batchStaticMeshes } from "../utils/staticBatch";
import { createDebugLayer } from "./debug";
import { createBoundary } from "./environment/Boundary";
import { createGround } from "./environment/Ground";
import { createLighting } from "./environment/Lighting";
import { createPaths, samplePaths } from "./environment/Paths";
import { createSky } from "./environment/Sky";
import { createLavenderField, createVegetation } from "./environment/Vegetation";
import { createWater } from "./environment/Water";
import { InstanceBuckets, createInstanceTypes } from "./instances";
import { createKit } from "./kit";
import { LOCATION_BUILDERS } from "./locations";
import { PAVING_TOP } from "./locations/common";
import { createSignpost } from "./props/signage";
import { heightAt } from "./terrain";
import { createTextures } from "./textures";

/** @typedef {import("./debug").Collider} Collider */

/**
 * @typedef {object} Interactable
 * @property {string} id
 * @property {string} zoneId
 * @property {string} label
 * @property {number} x @property {number} y @property {number} z
 */

/**
 * Assembles the whole environment: atmosphere, terrain, paths, the eight
 * locations, signage and vegetation. It also records collision boxes and
 * interaction points for the physics and interaction phases.
 */
export class World {
  /**
   * @param {{ scene: THREE.Scene, tracker: import("../utils/ResourceTracker").ResourceTracker, fontFamily: string }} options
   */
  constructor({ scene, tracker, fontFamily }) {
    this.scene = scene;
    this.tracker = tracker;
    this.kit = createKit(tracker, { fontFamily });
    this.textures = createTextures(this.kit);
    this.instances = new InstanceBuckets(createInstanceTypes(this.kit));
    this.root = new THREE.Group();
    this.root.name = "world";
    scene.add(this.root);

    /** @type {Collider[]} */
    this.colliders = [];
    /** @type {Interactable[]} */
    this.interactables = [];
    /** @type {((delta: number, elapsed: number) => void)[]} */
    this.updaters = [];
    /** @type {THREE.Mesh | null} */
    this.sky = null;
    /** @type {THREE.InstancedMesh | null} */
    this.lanterns = null;
    /** @type {THREE.Group | null} */
    this.debug = null;
    /** @type {{ dispose: () => void } | null} */
    this.lighting = null;
    this.dummy = new THREE.Object3D();
  }

  /**
   * Register a world-space collision box.
   * @param {{ x: number, z: number, w: number, d: number, h: number, y?: number }} box
   */
  addCollider({ x, z, w, d, h, y }) {
    const base = y ?? heightAt(x, z);
    this.colliders.push({
      minX: x - w / 2,
      maxX: x + w / 2,
      minZ: z - d / 2,
      maxZ: z + d / 2,
      minY: base,
      maxY: base + h,
    });
  }

  /**
   * Build everything, yielding between steps so the loading indicator updates.
   * @param {(ratio: number) => void} onProgress
   * @param {() => boolean} isCancelled
   * @returns {Promise<boolean>} false when cancelled part-way.
   */
  async build(onProgress, isCancelled) {
    const { kit, instances, root } = this;
    const totalSteps = 4 + ZONES.length;
    let completed = 0;
    const step = async () => {
      completed += 1;
      onProgress(completed / totalSteps);
      await new Promise((resolve) => setTimeout(resolve, 0));
      return isCancelled();
    };
    const addCollider = this.addCollider.bind(this);

    // 1. Atmosphere, ground and water.
    const lighting = createLighting(this.scene);
    this.lighting = lighting;
    this.sky = createSky(kit, lighting.sunDirection);
    this.scene.add(this.sky);
    root.add(createGround(kit));
    root.add(createWater(kit));
    if (await step()) return false;

    // 2. Paths, steps, lamps and the boundary wall (with a gap for the pier).
    const sampled = samplePaths();
    const paths = createPaths(kit, instances, sampled, addCollider);
    batchStaticMeshes(paths, this.tracker);
    root.add(paths);
    createBoundary(instances, [{ angle: WORLD.headlandAngle, halfWidth: 0.05 }]);
    if (await step()) return false;

    // 3. The eight locations, each batched into a few draw calls.
    for (const zone of ZONES) {
      const builder = LOCATION_BUILDERS[zone.id];
      if (builder) this.buildLocation(zone, builder);
      if (await step()) return false;
    }

    // 4. Junction signposts, vegetation and the lavender field.
    const signposts = new THREE.Group();
    signposts.name = "signposts";
    for (const post of SIGNPOSTS) {
      const targets = post.targets.map((id) => ZONE_BY_ID[id]).filter(Boolean);
      signposts.add(createSignpost(kit, this.textures, { x: post.x, y: heightAt(post.x, post.z), z: post.z, targets }));
      addCollider({ x: post.x, z: post.z, w: 0.4, d: 0.4, h: 2.6 });
    }
    root.add(signposts);
    // Merge static meshes that share a material across all locations
    // (limewash, terracotta, timber…): fewer draw calls for the whole island.
    batchStaticMeshes(root, this.tracker);
    createVegetation(instances, sampled, addCollider);
    createLavenderField(instances, { x: -32.2, z: 9.5, rows: 5, length: 8, spacing: 0.9 });
    if (await step()) return false;

    // 5. Interaction markers: gold ground rings (static) and bobbing lanterns.
    for (const point of this.interactables) {
      instances.add("ring", point.x, heightAt(point.x, point.z) + PAVING_TOP + 0.012, point.z, {
        size: [1.35, 1, 1.35],
        color: PALETTE.lamp,
      });
    }
    this.lanterns = this.createLanterns();
    root.add(this.lanterns);

    for (const mesh of instances.build()) {
      this.tracker.track(mesh);
      root.add(mesh);
    }

    this.debug = createDebugLayer(kit, { colliders: this.colliders, interactables: this.interactables });
    root.add(this.debug);
    await step();
    return !isCancelled();
  }

  /**
   * @param {import("@/data/worldLayout").Zone} zone
   * @param {(ctx: import("./locations/common").LocationContext, options?: any) => void} builder
   */
  buildLocation(zone, builder) {
    const origin = { x: zone.x, y: heightAt(zone.x, zone.z), z: zone.z };
    const group = new THREE.Group();
    group.name = `location:${zone.id}`;
    group.position.set(origin.x, origin.y, origin.z);
    this.root.add(group);

    /** @type {import("./locations/common").LocationContext["instance"]} */
    const instance = (type, x, y, z, options) => this.instances.add(type, origin.x + x, origin.y + y, origin.z + z, options);

    /** @type {import("./locations/common").LocationContext} */
    const ctx = {
      kit: this.kit,
      textures: this.textures,
      zone,
      group,
      origin,
      instance,
      instances: { add: instance },
      collider: (x, z, w, d, h, y = 0) => this.addCollider({ x: origin.x + x, z: origin.z + z, w, d, h, y: origin.y + y }),
      interactable: ({ id, label, x, y, z }) =>
        this.interactables.push({ id, zoneId: zone.id, label, x: origin.x + x, y: origin.y + y, z: origin.z + z }),
      animate: (update) => this.updaters.push(update),
    };

    builder(ctx, zone.id === "contact" ? { pierAngle: WORLD.headlandAngle } : undefined);
    batchStaticMeshes(group, this.tracker);
  }

  /** Small warm lanterns above every interaction point (they bob gently). */
  createLanterns() {
    const count = Math.max(1, this.interactables.length);
    const mesh = new THREE.InstancedMesh(this.kit.geo.box(), this.kit.material("lanternGlass"), count);
    mesh.name = "interaction-lanterns";
    mesh.count = this.interactables.length;
    mesh.userData.dynamic = true;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.tracker.track(mesh);
    this.updateLanterns(0);
    return mesh;
  }

  /** @param {number} elapsed */
  updateLanterns(elapsed) {
    const mesh = this.lanterns;
    if (!mesh) return;
    const dummy = this.dummy;
    this.interactables.forEach((point, i) => {
      dummy.position.set(point.x, point.y + Math.sin(elapsed * 1.6 + i) * 0.05, point.z);
      dummy.rotation.set(0, elapsed * 0.4 + i, 0);
      dummy.scale.set(0.16, 0.22, 0.16);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }

  /** @param {boolean} visible */
  setDebugVisible(visible) {
    if (this.debug) this.debug.visible = visible;
  }

  /**
   * Camera presets for the dev camera.
   * @param {string} zoneId
   */
  getZoneView(zoneId) {
    const zone = ZONE_BY_ID[zoneId];
    if (!zone) return null;
    const y = heightAt(zone.x, zone.z);
    const target = new THREE.Vector3(zone.x, y + 1.5, zone.z);
    const { yaw, distance, height } = zone.view;
    const position = new THREE.Vector3(zone.x + Math.sin(yaw) * distance, y + height, zone.z + Math.cos(yaw) * distance);
    return { position, target };
  }

  getOverview() {
    return { position: new THREE.Vector3(0, 62, 78), target: new THREE.Vector3(0, 0, -2) };
  }

  /** Approved third-person framing (offset 0, 4.5, 6.5) at the spawn point, for previewing scale. */
  getCatView() {
    const { x, z } = WORLD.spawn;
    const y = heightAt(x, z) + PAVING_TOP;
    return { position: new THREE.Vector3(x, y + 4.5, z + 6.5), target: new THREE.Vector3(x, y + 0.6, z - 1) };
  }

  /**
   * @param {number} delta
   * @param {number} elapsed
   * @param {THREE.Camera} camera
   */
  update(delta, elapsed, camera) {
    if (this.sky) this.sky.position.copy(camera.position);
    for (const update of this.updaters) update(delta, elapsed);
    this.updateLanterns(elapsed);
  }

  getSummary() {
    return {
      locations: ZONES.length,
      colliders: this.colliders.length,
      interactables: this.interactables.length,
    };
  }

  dispose() {
    this.lighting?.dispose();
    this.updaters.length = 0;
    this.scene.remove(this.root);
    if (this.sky) this.scene.remove(this.sky);
  }
}
