import * as THREE from "three";

import { PALETTE, THEME, WORLD } from "@/constants/world";
import { INTERACTABLES } from "@/data/interactables";
import { PATHS, SIGNPOSTS, ZONE_BY_ID, ZONES } from "@/data/worldLayout";
import { CollisionWorld } from "@/lib/physics/CollisionWorld";

import { batchStaticMeshes } from "../utils/staticBatch";
import { createDebugLayer } from "./debug";
import { createBoundary } from "./environment/Boundary";
import { createGround } from "./environment/Ground";
import { createLighting } from "./environment/Lighting";
import { collectGlowingMaterials, createNightLights } from "./environment/NightLights";
import { createPaths, isInZone, samplePaths } from "./environment/Paths";
import { blendSky, createSky } from "./environment/Sky";
import { createLavenderField, createVegetation } from "./environment/Vegetation";
import { createWater } from "./environment/Water";
import { InstanceBuckets, createInstanceTypes } from "./instances";
import { createKit } from "./kit";
import { LOCATION_BUILDERS } from "./locations";
import { PAVING_TOP } from "./locations/common";
import { createSignpost } from "./props/signage";
import { heightAt, isOnIsland, islandRadius } from "./terrain";
import { createTextures } from "./textures";

/** @typedef {import("./debug").Collider} Collider */

/** @typedef {import("../interactions/InteractionSystem").Interactable} Interactable */

/** Height of path ribbons above the terrace they lie on (see Paths.js). */
const PATH_LIFT = 0.035;
const SURFACE_CELL = 0.5;

/**
 * Walking-surface height: the terrace, plus the paving inside locations or the
 * path ribbon along paths, so the cat's paws rest on what is drawn.
 * @param {ReturnType<typeof samplePaths>} sampled
 * @returns {(x: number, z: number) => number}
 */
function createSurfaceSampler(sampled) {
  /** @type {Set<number>} */
  const pathCells = new Set();
  const key = (/** @type {number} */ i, /** @type {number} */ j) => (i + 2048) * 4096 + (j + 2048);
  for (const path of sampled) {
    const half = path.width / 2 - 0.1;
    for (const p of path.samples) {
      const steps = Math.ceil(half / SURFACE_CELL);
      for (let a = -steps; a <= steps; a += 1) {
        for (let b = -steps; b <= steps; b += 1) {
          const x = p.x + a * SURFACE_CELL;
          const z = p.z + b * SURFACE_CELL;
          if (Math.hypot(x - p.x, z - p.z) <= half) pathCells.add(key(Math.round(x / SURFACE_CELL), Math.round(z / SURFACE_CELL)));
        }
      }
    }
  }
  return (x, z) => {
    const ground = heightAt(x, z);
    if (isInZone(x, z, -0.1)) return ground + PAVING_TOP;
    if (pathCells.has(key(Math.round(x / SURFACE_CELL), Math.round(z / SURFACE_CELL)))) return ground + PATH_LIFT;
    return ground;
  };
}

/**
 * Assembles the whole environment: atmosphere, terrain, paths, the eight
 * locations, signage and vegetation. It also records collision boxes and
 * interaction points for the physics and interaction phases.
 */
export class World {
  /**
   * @param {{ scene: THREE.Scene, tracker: import("../utils/ResourceTracker").ResourceTracker, fontFamily: string, media?: import("@/constants/assets").MediaFlags }} options
   */
  constructor({ scene, tracker, fontFamily, media }) {
    this.scene = scene;
    this.tracker = tracker;
    this.media = media ?? { showreel: false, showreelPoster: false, studioPainting: false };
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
    /** @type {import("@/lib/physics/CollisionWorld").Walkway[]} */
    this.walkways = [];
    /** @type {(x: number, z: number) => number} */
    this.surfaceAt = heightAt;
    /** @type {((delta: number, elapsed: number, camera: THREE.Camera) => void)[]} */
    this.updaters = [];
    /** @type {THREE.Mesh | null} */
    this.sky = null;
    /** @type {THREE.InstancedMesh | null} */
    this.lanterns = null;
    /** @type {THREE.Group | null} */
    this.debug = null;
    /** @type {ReturnType<typeof createLighting> | null} */
    this.lighting = null;
    /** @type {ReturnType<typeof createNightLights> | null} */
    this.nightLights = null;
    /** @type {ReturnType<typeof collectGlowingMaterials> | null} */
    this.glowing = null;
    /** Day/night blend: 0 = golden hour, 1 = night; eases towards `nightTarget`. */
    this.night = 0;
    this.nightTarget = 0;
    /** Set when the light moved and the (static) shadow map must be redrawn. */
    this.shadowsDirty = false;
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
    this.sky = createSky(kit, lighting.lightDirection);
    this.scene.add(this.sky);
    root.add(createGround(kit));
    root.add(createWater(kit));
    if (await step()) return false;

    // 2. Paths, steps, lamps and the boundary wall (with a gap for the pier).
    const sampled = samplePaths();
    this.surfaceAt = createSurfaceSampler(sampled);
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

    // Night-only lamplight under the path lamps (read before the buckets become meshes).
    const lamps = (instances.buckets.get("lampHead")?.matrices ?? []).map((m) => {
      const [x, y, z] = [m.elements[12], m.elements[13], m.elements[14]];
      return { x, y, z, ground: this.surfaceAt(x, z) };
    });
    this.nightLights = createNightLights(kit, lamps);
    root.add(this.nightLights.group);

    for (const mesh of instances.build()) {
      this.tracker.track(mesh);
      root.add(mesh);
    }

    this.glowing = collectGlowingMaterials(root);
    this.applyNight(this.night);

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
      media: this.media,
      zone,
      group,
      origin,
      instance,
      instances: { add: instance },
      collider: (x, z, w, d, h, y = 0) => this.addCollider({ x: origin.x + x, z: origin.z + z, w, d, h, y: origin.y + y }),
      interactable: ({ id, x, y, z }) => {
        const definition = INTERACTABLES[id];
        if (!definition) {
          if (process.env.NODE_ENV === "development") console.warn(`[world] no interactable defined for "${id}"; skipped.`);
          return;
        }
        this.interactables.push({ ...definition, zoneId: zone.id, x: origin.x + x, y: origin.y + y, z: origin.z + z });
      },
      animate: (update) => this.updaters.push(update),
      walkway: ({ x, z, angle, length, width, y }) =>
        this.walkways.push({ x: origin.x + x, z: origin.z + z, angle, length, width, y: origin.y + y }),
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

  /**
   * Golden hour or night. Fades over THEME.transition seconds unless `instant`
   * (or the visitor prefers reduced motion).
   * @param {"day" | "night"} theme
   * @param {{ instant?: boolean }} [options]
   */
  setTheme(theme, { instant = false } = {}) {
    this.nightTarget = theme === "night" ? 1 : 0;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (instant || reduce) this.applyNight(this.nightTarget);
  }

  /** @param {number} progress 0 = golden hour, 1 = night (eased in and out). */
  applyNight(progress) {
    this.night = progress;
    const t = progress * progress * (3 - 2 * progress);
    this.lighting?.apply(t);
    if (this.sky) blendSky(this.sky, t);
    this.nightLights?.setStrength(t);
    this.glowing?.setStrength(t);
    this.shadowsDirty = true;
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

  /**
   * Collision data for the custom physics: collider boxes, the walking
   * surface, the boundary just inside the wall, and the pier.
   */
  createCollisionWorld() {
    // The wall stands wallInset inside the grass edge and is ~0.6 deep.
    const wall = WORLD.wallInset + 0.45;
    return new CollisionWorld({
      colliders: this.colliders,
      heightAt: this.surfaceAt,
      isInside: (x, z, margin) => isOnIsland(x, z, wall + margin),
      nearestInside: (x, z, margin) => {
        const angle = Math.atan2(z, x);
        const r = islandRadius(angle) - wall - margin - 0.01;
        return { x: Math.cos(angle) * r, z: Math.sin(angle) * r };
      },
      walkways: this.walkways,
    });
  }

  /** Where the cat starts: the plaza, facing north up the boulevard. */
  getSpawn() {
    return { x: WORLD.spawn.x, z: WORLD.spawn.z, yaw: Math.PI };
  }

  /**
   * Where the cat arrives when sent to a location: the end of the path a
   * visitor would come in by (near the location, on the side towards the
   * plaza), facing the centre. The plaza uses the spawn point.
   * @param {string} zoneId
   */
  getArrival(zoneId) {
    const zone = ZONE_BY_ID[zoneId];
    if (!zone) return null;
    if (zoneId === "plaza") return this.getSpawn();
    const spawn = WORLD.spawn;
    let best = { x: zone.x, z: zone.z + 4 };
    let bestScore = Infinity;
    for (const path of PATHS) {
      for (const [x, z] of [path.points[0], path.points[path.points.length - 1]]) {
        const near = Math.hypot(x - zone.x, z - zone.z);
        if (near > 10) continue;
        const score = near + 0.3 * Math.hypot(x - spawn.x, z - spawn.z);
        if (score < bestScore) {
          bestScore = score;
          best = { x, z };
        }
      }
    }
    return { x: best.x, z: best.z, yaw: Math.atan2(zone.x - best.x, zone.z - best.z) };
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
    if (this.night !== this.nightTarget) {
      const stepSize = delta / THEME.transition;
      const next = this.night < this.nightTarget ? Math.min(this.nightTarget, this.night + stepSize) : Math.max(this.nightTarget, this.night - stepSize);
      this.applyNight(next);
    }
    for (const update of this.updaters) update(delta, elapsed, camera);
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
