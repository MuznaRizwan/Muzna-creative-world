import * as THREE from "three";

import { CharacterController, wrapAngle } from "@/lib/physics/CharacterController";

import { createCanvasTexture } from "../utils/canvasTexture";

/**
 * The playable cat. Keeps three things separate:
 * - movement: a CharacterController stepped at a fixed rate (physics owns the position),
 * - visuals: the glTF model, placed each frame from the interpolated physics state,
 * - animation: a CatAnimator whose state follows what the body actually did.
 *
 * It also starts interactions (E): face the object, play the interaction once,
 * lock movement until it finishes, then hand control back.
 */

/** @typedef {import("@/lib/physics/CharacterController").MoveIntent} MoveIntent */

/**
 * @typedef {object} CatPlayerOptions
 * @property {import("./CatModel").CatModelResult} model
 * @property {import("./CatAnimator").CatAnimator} animator
 * @property {import("@/lib/physics/CollisionWorld").CollisionWorld} collision
 * @property {import("@/lib/physics/CharacterController").ControllerSettings} settings
 * @property {import("../interactions/InteractionSystem").InteractionSystem} interactions
 * @property {import("../utils/ResourceTracker").ResourceTracker} tracker
 * @property {{ x: number, z: number, yaw: number }} spawn
 * @property {number} walkClipSpeed  Ground speed that matches the walk clip at timeScale 1.
 * @property {number} runClipSpeed   Ground speed that matches the run clip at timeScale 1.
 */

/** Soft round shadow drawn on the ground under the cat. */
function createBlobShadow(/** @type {import("../utils/ResourceTracker").ResourceTracker} */ tracker) {
  const texture = createCanvasTexture(
    tracker,
    64,
    64,
    (ctx, w, h) => {
      const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      gradient.addColorStop(0, "rgba(40, 30, 60, 0.55)");
      gradient.addColorStop(0.55, "rgba(40, 30, 60, 0.3)");
      gradient.addColorStop(1, "rgba(40, 30, 60, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    },
    { srgb: true }
  );
  const geometry = tracker.track(new THREE.PlaneGeometry(1, 1));
  geometry.rotateX(-Math.PI / 2);
  const material = tracker.track(
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })
  );
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "cat-shadow";
  mesh.renderOrder = 1;
  return mesh;
}

export class CatPlayer {
  /** @param {CatPlayerOptions} options */
  constructor({ model, animator, collision, settings, interactions, tracker, spawn, walkClipSpeed, runClipSpeed }) {
    this.model = model;
    this.animator = animator;
    this.collision = collision;
    this.settings = settings;
    this.interactions = interactions;
    this.spawn = spawn;
    this.walkClipSpeed = walkClipSpeed;
    this.runClipSpeed = runClipSpeed;

    this.body = new CharacterController(collision, settings);
    this.body.teleport(spawn.x, spawn.z, spawn.yaw);

    this.group = new THREE.Group();
    this.group.name = "player";
    this.group.add(model.root);
    this.shadow = createBlobShadow(tracker);
    this.group.add(this.shadow);

    /** Interpolated render state. */
    this.view = { x: 0, y: 0, z: 0, yaw: 0 };
    /** Visual height, smoothed so stepping onto a ledge doesn't pop. */
    this.visualY = this.body.position.y;
    this.accumulator = 0;
    /** @type {import("../interactions/InteractionSystem").Interactable | null} */
    this.activeTarget = null;
    this.enabled = true;
    this.lastSpeed = 0;
    this.place(1, 0);
  }

  /** Is the cat busy with an interaction? */
  get interacting() {
    return this.animator.interacting;
  }

  /**
   * Enable or pause player control (the dev camera pauses it).
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * @param {number} x @param {number} z @param {number} yaw
   */
  teleport(x, z, yaw) {
    this.animator.cancelInteraction();
    this.activeTarget = null;
    this.body.locked = false;
    this.body.teleport(x, z, yaw);
    this.visualY = this.body.position.y;
    this.accumulator = 0;
    this.place(1, 0);
  }

  reset() {
    this.teleport(this.spawn.x, this.spawn.z, this.spawn.yaw);
  }

  /**
   * Try to interact with the focused object.
   * @returns {boolean} Whether an interaction started.
   */
  interact() {
    if (!this.enabled || this.interacting || !this.body.grounded) return false;
    const p = this.body.position;
    const target = this.interactions.findTarget(p.x, p.y, p.z, this.body.yaw);
    if (!target) return false;
    // Face the object, stop, and play the interaction once.
    this.body.faceYaw = Math.atan2(target.x - p.x, target.z - p.z);
    this.body.locked = true;
    this.body.speed = 0;
    this.activeTarget = target;
    const started = this.animator.playInteraction(() => {
      this.body.locked = false;
      this.body.faceYaw = null;
      this.activeTarget = null;
    });
    if (!started) {
      this.body.locked = false;
      this.body.faceYaw = null;
      this.activeTarget = null;
      return false;
    }
    this.interactions.trigger(target);
    return true;
  }

  /**
   * Advance physics with a fixed timestep, then update visuals and animation.
   * @param {number} delta  Frame time (already clamped by the engine).
   * @param {import("../input/KeyboardInput").KeyboardInput} input
   */
  update(delta, input) {
    const s = this.settings;
    const fixed = s.fixedStep;
    const maxSubSteps = s.maxSubSteps;

    if (this.enabled) {
      if (input.consume("reset")) this.reset();
      if (input.consume("interact")) this.interact();
    } else {
      input.consume("reset");
      input.consume("interact");
    }
    const axes = this.enabled ? input.axes : { move: 0, turn: 0, run: false };
    let jump = this.enabled && input.consume("jump");

    this.accumulator = Math.min(this.accumulator + delta, fixed * maxSubSteps);
    while (this.accumulator >= fixed) {
      /** @type {MoveIntent} */
      const intent = { move: axes.move, turn: axes.turn, run: axes.run, jump };
      this.body.step(fixed, intent);
      jump = false;
      this.accumulator -= fixed;
    }
    // A jump pressed between steps is kept for the next step.
    if (jump) input.queued.add("jump");

    if (this.body.position.y < s.fallLimit) this.reset();

    this.place(this.accumulator / fixed, delta);
    this.updateAnimation(delta);
  }

  /**
   * Position the model from the interpolated physics state.
   * @param {number} alpha
   * @param {number} delta
   */
  place(alpha, delta) {
    const view = this.body.interpolate(alpha, this.view);
    // Smooth small vertical snaps (steps) on the ground; follow exactly in the air.
    if (this.body.grounded && Math.abs(view.y - this.visualY) < 0.5) {
      this.visualY += (view.y - this.visualY) * (1 - Math.exp(-18 * delta));
    } else {
      this.visualY = view.y;
    }
    if (delta === 0) this.visualY = view.y;
    const root = this.model.root;
    root.position.set(view.x, this.visualY, view.z);
    root.rotation.y = view.yaw;

    // Blob shadow stays on the ground below and fades with height.
    const ground = this.collision.groundAt(view.x, view.z, this.visualY + 0.05, this.settings.supportMargin);
    const height = Math.max(0, this.visualY - ground);
    const fade = Math.max(0, 1 - height / 2.5);
    this.shadow.position.set(view.x + Math.sin(view.yaw) * 0.05, ground + 0.07, view.z + Math.cos(view.yaw) * 0.05);
    this.shadow.rotation.y = view.yaw;
    this.shadow.scale.set(0.75 * (0.6 + 0.4 * fade), 1, 1.45 * (0.6 + 0.4 * fade));
    /** @type {THREE.MeshBasicMaterial} */ (this.shadow.material).opacity = fade;
  }

  /** @param {number} delta */
  updateAnimation(delta) {
    const body = this.body;
    // Smooth the achieved speed so brief collisions don't flicker the state.
    this.lastSpeed += (body.actualSpeed * Math.sign(body.speed || 1) - this.lastSpeed) * (1 - Math.exp(-12 * delta));
    const speed = this.lastSpeed;
    const turning = Math.abs(body.turnRate) > 0.6;

    if (!this.animator.interacting) {
      if (body.running && speed > this.walkClipSpeed * 1.15) {
        this.animator.setLocomotion("run", THREE.MathUtils.clamp(speed / this.runClipSpeed, 0.7, 1.25));
      } else if (Math.abs(speed) > 0.2) {
        const scale = THREE.MathUtils.clamp(Math.abs(speed) / this.walkClipSpeed, 0.45, 1.6);
        this.animator.setLocomotion("walk", speed < 0 ? -scale : scale);
      } else if (turning) {
        // Turning on the spot: a slow walk cycle so the paws shuffle round.
        this.animator.setLocomotion("walk", 0.6);
      } else {
        this.animator.setLocomotion("idle", 1);
      }
    }
    this.animator.update(delta);
  }

  /** Snapshot for the debug panel and tests. */
  getState() {
    const b = this.body;
    return {
      x: b.position.x,
      y: b.position.y,
      z: b.position.z,
      yaw: wrapAngle(b.yaw),
      speed: b.actualSpeed,
      grounded: b.grounded,
      running: b.running,
      animation: this.animator.state,
      interacting: this.interacting,
      target: this.activeTarget?.id ?? null,
    };
  }

  dispose() {
    this.animator.dispose();
    this.group.removeFromParent();
  }
}
