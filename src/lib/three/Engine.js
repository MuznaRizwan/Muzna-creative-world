import * as THREE from "three";

import { CAT_ASSETS } from "@/constants/assets";
import { CAT_CAMERA, CAT_METRICS, CAT_PLAYER, RENDER } from "@/constants/world";

import { CatAnimator } from "./avatar/CatAnimator";
import { loadCatModel } from "./avatar/CatModel";
import { CatPlayer } from "./avatar/CatPlayer";
import { loadCatClips } from "./avatar/catClips";
import { DevCamera } from "./camera/DevCamera";
import { FollowCamera } from "./camera/FollowCamera";
import { createRenderer } from "./core/Renderer";
import { Time } from "./core/Time";
import { Viewport } from "./core/Viewport";
import { KeyboardInput } from "./input/KeyboardInput";
import { InteractionSystem } from "./interactions/InteractionSystem";
import { AssetLoader } from "./loaders/AssetLoader";
import { ResourceTracker } from "./utils/ResourceTracker";
import { readFontFamily, waitForFont } from "./utils/fonts";
import { World } from "./world/World";

/** @typedef {import("./interactions/InteractionSystem").Interactable} Interactable */
/** @typedef {"follow" | "dev"} CameraMode */

/**
 * @typedef {object} EngineCallbacks
 * @property {(ratio: number) => void} [onProgress] Loading progress 0–1.
 * @property {(error: Error) => void} [onError] Fatal runtime errors (e.g. lost WebGL context).
 * @property {(target: Interactable | null) => void} [onFocusChange] The interactable in reach changed.
 * @property {(target: Interactable) => void} [onInteract] The cat started interacting with an object.
 * @property {(mode: CameraMode) => void} [onModeChange] Switched between the follow camera and the dev camera.
 */

/**
 * @typedef {object} EngineStats
 * @property {number} fps
 * @property {number} drawCalls
 * @property {number} triangles
 * @property {number} geometries
 * @property {number} textures
 * @property {number} width
 * @property {number} height
 * @property {number} pixelRatio
 * @property {boolean} running
 */

/**
 * The Three.js engine: owns the renderer, scene, camera, loop, world and the
 * playable cat. React mounts it into a container and calls `dispose()` on
 * unmount; it never touches React state directly, only calls the callbacks
 * above when something changes (never per frame).
 */
export class Engine {
  /**
   * @param {HTMLElement} container
   * @param {EngineCallbacks} [callbacks]
   */
  constructor(container, { onProgress, onError, onFocusChange, onInteract, onModeChange } = {}) {
    this.container = container;
    this.onProgress = onProgress ?? (() => {});
    this.onError = onError ?? (() => {});
    this.onFocusChange = onFocusChange ?? (() => {});
    this.onInteract = onInteract ?? (() => {});
    this.onModeChange = onModeChange ?? (() => {});
    this.disposed = false;
    this.running = false;
    /** Whether the loop should run when the tab is visible. */
    this.wantsToRun = false;
    this.debugVisible = false;
    this.tracker = new ResourceTracker();
    this.time = new Time(RENDER.maxDelta);
    this.frames = 0;
    this.fpsWindowStart = 0;
    this.fps = 0;

    // The engine owns its canvas: a lost context can't be reused by a later mount.
    this.canvas = document.createElement("canvas");
    this.canvas.style.display = "block";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.touchAction = "none";
    this.canvas.setAttribute("aria-label", "3D view of Muzna's Creative World");
    container.appendChild(this.canvas);

    this.renderer = createRenderer(this.canvas);
    this.scene = new THREE.Scene();
    this.devCamera = new DevCamera(this.canvas);
    /** Loading progress of the cat files (0–1), combined with the world build. */
    this.assetProgress = 0;
    this.loader = new AssetLoader((ratio) => {
      this.assetProgress = ratio;
    });
    /** @type {World | null} */
    this.world = null;
    this.input = new KeyboardInput();
    /** @type {CatPlayer | null} */
    this.player = null;
    /** @type {FollowCamera | null} */
    this.followCamera = null;
    /** @type {InteractionSystem | null} */
    this.interactions = null;
    /** @type {CameraMode} */
    this.mode = "dev";
    /** Why the cat is unavailable, if it failed to load. @type {string | null} */
    this.catError = null;
    /** What the clip loader did (durations, root motion, track counts). @type {Record<string, unknown> | null} */
    this.catReport = null;

    this.frame = this.frame.bind(this);
    this.handleVisibility = this.handleVisibility.bind(this);
    this.handleContextLost = this.handleContextLost.bind(this);
    document.addEventListener("visibilitychange", this.handleVisibility);
    this.canvas.addEventListener("webglcontextlost", this.handleContextLost);

    this.viewport = new Viewport(container, (size) => {
      this.renderer.setPixelRatio(size.pixelRatio);
      this.renderer.setSize(size.width, size.height, false);
      this.devCamera.setAspect(size.width / size.height);
    });
  }

  /**
   * Build the world and load the cat. Resolves false if the engine was
   * disposed meanwhile.
   * @returns {Promise<boolean>}
   */
  async init() {
    const report = (/** @type {number} */ ratio) => {
      if (!this.disposed) this.onProgress(Math.min(1, ratio));
    };
    report(0.02);

    const fontFamily = readFontFamily("--font-bricolage");
    await waitForFont(fontFamily, 2500);
    if (this.disposed) return false;
    report(0.08);

    // Fetch the cat files while the world is being built.
    let worldRatio = 0;
    const progress = () => report(0.08 + worldRatio * 0.6 + this.assetProgress * 0.27);
    const cat = this.loadCat().catch((/** @type {unknown} */ error) => (error instanceof Error ? error : new Error(String(error))));
    const ticker = window.setInterval(progress, 120);

    this.world = new World({ scene: this.scene, tracker: this.tracker, fontFamily });
    let built = false;
    try {
      built = await this.world.build(
        (ratio) => {
          worldRatio = ratio;
          progress();
        },
        () => this.disposed
      );
      if (built && !this.disposed) {
        const loaded = await cat;
        if (!this.disposed) this.setUpCat(loaded);
      }
    } finally {
      window.clearInterval(ticker);
    }
    if (!built || this.disposed) return false;
    report(0.96);

    // Compile shaders up front so the first frames don't stutter.
    try {
      await this.renderer.compileAsync(this.scene, this.devCamera.camera);
    } catch {
      // Not critical: shaders compile on first render instead.
    }
    if (this.disposed) return false;

    // The world is static, so its shadow map is rendered once.
    this.renderer.shadowMap.needsUpdate = true;
    report(1);
    return true;
  }

  /** Load the cat model, then its four animation clips. */
  async loadCat() {
    const model = await loadCatModel(this.loader, CAT_ASSETS.model, this.tracker);
    const { clips, report } = await loadCatClips(this.loader, CAT_ASSETS.clips, model.scene);
    return { model, clips, report };
  }

  /**
   * Create the player, interactions and follow camera once the world and the
   * cat are ready. Without a cat the engine stays on the dev camera.
   * @param {Awaited<ReturnType<Engine["loadCat"]>> | Error} loaded
   */
  setUpCat(loaded) {
    const world = /** @type {World} */ (this.world);
    if (loaded instanceof Error) {
      this.catError = loaded.message;
      console.warn("[world] the cat could not be loaded; staying on the dev camera.", loaded);
      const overview = world.getOverview();
      this.devCamera.flyTo(overview.position, overview.target, { instant: true });
      this.setMode("dev");
      return;
    }
    const { model, clips, report } = loaded;
    const collision = world.createCollisionWorld();
    this.interactions = new InteractionSystem(world.interactables, { radius: CAT_METRICS.interactRadius });
    this.interactions.onFocusChange((target) => this.onFocusChange(target));
    this.interactions.onInteract((target) => this.onInteract(target));

    // The running clip's root motion gives the ground speed its stride matches.
    const runClipSpeed = (report.run.travel * model.scale) / report.run.duration || CAT_PLAYER.runSpeed;
    this.player = new CatPlayer({
      model,
      animator: new CatAnimator(model.scene, clips),
      collision,
      settings: {
        ...CAT_PLAYER,
        radius: CAT_METRICS.collisionRadius,
        height: CAT_METRICS.height,
        stepHeight: CAT_METRICS.stepHeight,
      },
      interactions: this.interactions,
      tracker: this.tracker,
      spawn: world.getSpawn(),
      walkClipSpeed: CAT_PLAYER.walkClipSpeed,
      runClipSpeed,
    });
    this.scene.add(this.player.group);
    this.followCamera = new FollowCamera(this.devCamera.camera, collision, CAT_CAMERA);
    this.catReport = { clips: report, runClipSpeed, scale: model.scale };
    this.setMode("follow", { instant: true });
  }

  /**
   * Switch between the follow camera (playing) and the free dev camera.
   * @param {CameraMode} mode
   * @param {{ instant?: boolean }} [options]
   */
  setMode(mode, { instant = false } = {}) {
    const player = this.player;
    const follow = this.followCamera;
    if (mode === "follow" && player && follow) {
      this.devCamera.tween = null;
      this.devCamera.controls.enabled = false;
      follow.activate(player.view, { instant, lookFrom: this.devCamera.controls.target });
      player.setEnabled(true);
      this.interactions?.setEnabled(true);
      this.mode = "follow";
    } else {
      this.devCamera.controls.enabled = true;
      // Orbit around whatever the follow camera was looking at.
      if (this.mode === "follow" && follow) this.devCamera.controls.target.copy(follow.lookAt);
      player?.setEnabled(false);
      this.input.clear();
      this.interactions?.setEnabled(false);
      this.mode = "dev";
    }
    this.onModeChange(this.mode);
  }

  start() {
    this.wantsToRun = true;
    if (this.disposed || this.running || document.hidden) return;
    this.running = true;
    this.time.reset();
    this.fpsWindowStart = performance.now();
    this.frames = 0;
    this.renderer.setAnimationLoop(this.frame);
  }

  /** @param {{ keepIntent?: boolean }} [options] */
  stop({ keepIntent = false } = {}) {
    if (!keepIntent) this.wantsToRun = false;
    if (!this.running) return;
    this.running = false;
    this.renderer.setAnimationLoop(null);
  }

  /** @param {number} timestamp */
  frame(timestamp) {
    const delta = this.time.tick(timestamp);
    this.step(delta);
    this.renderer.render(this.scene, this.devCamera.camera);

    this.frames += 1;
    const now = performance.now();
    if (now - this.fpsWindowStart >= 1000) {
      this.fps = Math.round((this.frames * 1000) / (now - this.fpsWindowStart));
      this.frames = 0;
      this.fpsWindowStart = now;
    }
  }

  /**
   * Advance the simulation by one frame (without rendering).
   * @param {number} delta  Clamped frame time in seconds.
   */
  step(delta) {
    const player = this.player;
    if (player) {
      player.update(delta, this.input);
      const p = player.body.position;
      if (this.mode === "follow") this.interactions?.update(p.x, p.y, p.z, player.body.yaw);
    } else {
      // Without a cat, keep one-shot keys from piling up.
      this.input.queued.clear();
    }
    if (this.mode === "follow" && player && this.followCamera) this.followCamera.update(delta, player.view);
    else this.devCamera.update(delta);
    this.world?.update(delta, this.time.elapsed, this.devCamera.camera);
  }

  handleVisibility() {
    if (document.hidden) this.stop({ keepIntent: true });
    else if (this.wantsToRun) this.start();
  }

  /** @param {Event} event */
  handleContextLost(event) {
    event.preventDefault();
    this.stop();
    this.onError(new Error("The WebGL context was lost."));
  }

  // ---- Navigation (temporary dev panel) ----

  /** Free dev camera over the whole island; the cat waits where it is. */
  showOverview() {
    if (!this.world) return;
    this.setMode("dev");
    const view = this.world.getOverview();
    this.devCamera.flyTo(view.position, view.target);
  }

  /**
   * Send the cat to a location's entrance and follow it there. Without a cat,
   * fly the dev camera to the location instead.
   * @param {string} zoneId
   */
  focusLocation(zoneId) {
    if (!this.world) return;
    const arrival = this.world.getArrival(zoneId);
    if (this.player && arrival) {
      this.player.teleport(arrival.x, arrival.z, arrival.yaw);
      this.setMode("follow", { instant: true });
      return;
    }
    const view = this.world.getZoneView(zoneId);
    if (view) this.devCamera.flyTo(view.position, view.target);
  }

  /** Back to the cat with the follow camera (or the old preview framing without a cat). */
  showCatView() {
    if (!this.world) return;
    if (this.player) {
      this.setMode("follow");
      return;
    }
    const view = this.world.getCatView();
    this.devCamera.flyTo(view.position, view.target);
  }

  /**
   * Free orbit camera close to the cat, for looking at the model from every
   * side (drag to orbit, scroll to zoom). The cat waits in its idle pose.
   */
  inspectCat() {
    const player = this.player;
    if (!player) return;
    this.setMode("dev");
    const { x, y, z, yaw } = player.view;
    const target = new THREE.Vector3(x, y + 0.45, z);
    // In front of the cat and a little to its side, at about eye height.
    const angle = yaw + 0.6;
    const position = new THREE.Vector3(x + Math.sin(angle) * 2.2, y + 0.9, z + Math.cos(angle) * 2.2);
    this.devCamera.flyTo(position, target);
  }

  /** Put the cat back at the spawn point (same as R). */
  resetPlayer() {
    if (!this.player) return;
    this.player.reset();
    this.setMode("follow", { instant: true });
  }

  getPlayerState() {
    if (!this.player) return null;
    return { mode: this.mode, ...this.player.getState(), focus: this.interactions?.focused?.id ?? null };
  }

  /** @param {boolean} visible */
  setDebug(visible) {
    this.debugVisible = visible;
    this.world?.setDebugVisible(visible);
  }

  /** @returns {EngineStats} */
  getStats() {
    const info = this.renderer.info;
    const size = this.renderer.getSize(new THREE.Vector2());
    return {
      fps: this.fps,
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      width: size.x,
      height: size.y,
      pixelRatio: this.renderer.getPixelRatio(),
      running: this.running,
    };
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    document.removeEventListener("visibilitychange", this.handleVisibility);
    this.canvas.removeEventListener("webglcontextlost", this.handleContextLost);
    this.viewport.dispose();
    this.input.dispose();
    this.player?.dispose();
    this.interactions?.dispose();
    this.devCamera.dispose();
    this.world?.dispose();
    this.scene.clear();
    const released = this.tracker.disposeAll();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.canvas.remove();
    if (process.env.NODE_ENV === "development") {
      console.info(`[world] engine disposed, ${released} GPU resources released`);
    }
  }
}
