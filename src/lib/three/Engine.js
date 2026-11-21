import * as THREE from "three";

import { RENDER } from "@/constants/world";

import { DevCamera } from "./camera/DevCamera";
import { createRenderer } from "./core/Renderer";
import { Time } from "./core/Time";
import { Viewport } from "./core/Viewport";
import { AssetLoader } from "./loaders/AssetLoader";
import { ResourceTracker } from "./utils/ResourceTracker";
import { readFontFamily, waitForFont } from "./utils/fonts";
import { World } from "./world/World";

/**
 * @typedef {object} EngineCallbacks
 * @property {(ratio: number) => void} [onProgress] Loading progress 0–1.
 * @property {(error: Error) => void} [onError] Fatal runtime errors (e.g. lost WebGL context).
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
 * The Three.js engine: owns the renderer, scene, camera, loop and world.
 * React mounts it into a container and calls `dispose()` on unmount; it never
 * touches React state directly.
 */
export class Engine {
  /**
   * @param {HTMLElement} container
   * @param {EngineCallbacks} [callbacks]
   */
  constructor(container, { onProgress, onError } = {}) {
    this.container = container;
    this.onProgress = onProgress ?? (() => {});
    this.onError = onError ?? (() => {});
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
    this.loader = new AssetLoader();
    /** @type {World | null} */
    this.world = null;

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
   * Build the world. Resolves false if the engine was disposed meanwhile.
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

    this.world = new World({ scene: this.scene, tracker: this.tracker, fontFamily });
    const built = await this.world.build((ratio) => report(0.08 + ratio * 0.82), () => this.disposed);
    if (!built || this.disposed) return false;

    const overview = this.world.getOverview();
    this.devCamera.flyTo(overview.position, overview.target, { instant: true });

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
    this.devCamera.update(delta);
    this.world?.update(delta, this.time.elapsed, this.devCamera.camera);
    this.renderer.render(this.scene, this.devCamera.camera);

    this.frames += 1;
    const now = performance.now();
    if (now - this.fpsWindowStart >= 1000) {
      this.fps = Math.round((this.frames * 1000) / (now - this.fpsWindowStart));
      this.frames = 0;
      this.fpsWindowStart = now;
    }
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

  // ---- Dev camera presets (temporary navigation) ----

  showOverview() {
    if (!this.world) return;
    const view = this.world.getOverview();
    this.devCamera.flyTo(view.position, view.target);
  }

  /** @param {string} zoneId */
  focusLocation(zoneId) {
    const view = this.world?.getZoneView(zoneId);
    if (view) this.devCamera.flyTo(view.position, view.target);
  }

  showCatView() {
    if (!this.world) return;
    const view = this.world.getCatView();
    this.devCamera.flyTo(view.position, view.target);
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
