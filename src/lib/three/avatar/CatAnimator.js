import * as THREE from "three";

/**
 * Animation state machine for the cat: one AnimationMixer, one action per
 * clip, and crossfades between them.
 *
 * - Locomotion states (idle, walk, run) loop and crossfade into each other.
 *   Walk ↔ run keep their gait phase so the legs don't snap.
 * - The interaction plays once, holds its last frame, and reports when it has
 *   finished so the player can return to idle.
 *
 * Playback speed is set by the player from the actual movement speed, so the
 * paws keep pace with the ground.
 */

/** @typedef {import("./catClips").CatClipName} CatClipName */

const FADE = Object.freeze({
  locomotion: 0.25,
  toInteract: 0.25,
  fromInteract: 0.35,
});

export class CatAnimator {
  /**
   * @param {THREE.Object3D} root  Mixer root (the cat's glTF scene).
   * @param {Record<CatClipName, THREE.AnimationClip>} clips
   */
  constructor(root, clips) {
    this.root = root;
    this.mixer = new THREE.AnimationMixer(root);
    /** @type {Record<CatClipName, THREE.AnimationAction>} */
    this.actions = /** @type {any} */ ({});
    for (const [name, clip] of Object.entries(clips)) {
      const action = this.mixer.clipAction(clip);
      if (name === "interact") {
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
      } else {
        action.setLoop(THREE.LoopRepeat, Infinity);
      }
      this.actions[/** @type {CatClipName} */ (name)] = action;
    }
    /** @type {CatClipName} */
    this.state = "idle";
    this.actions.idle.play();
    /** @type {(() => void) | null} */
    this.onInteractFinished = null;
    /** Called once when the interaction clip reaches `momentTime` (e.g. the paw tap). */
    /** @type {(() => void) | null} */
    this.onInteractMoment = null;
    this.momentTime = 0;

    this.handleFinished = this.handleFinished.bind(this);
    this.mixer.addEventListener("finished", this.handleFinished);
  }

  /** @param {{ action: THREE.AnimationAction }} event */
  handleFinished(event) {
    if (event.action !== this.actions.interact || this.state !== "interact") return;
    // If the clip ended before the moment fired (very short clip), fire it now.
    this.fireMoment();
    const done = this.onInteractFinished;
    this.onInteractFinished = null;
    this.play("idle", FADE.fromInteract);
    done?.();
  }

  get interacting() {
    return this.state === "interact";
  }

  /**
   * Crossfade to a state. Locomotion requests are ignored during an interaction.
   * @param {CatClipName} next
   * @param {number} [fade]
   */
  play(next, fade = FADE.locomotion) {
    if (next === this.state) return;
    const from = this.actions[this.state];
    const to = this.actions[next];
    const gait = (this.state === "walk" || this.state === "run") && (next === "walk" || next === "run");
    to.reset();
    if (gait) to.time = (from.time / from.getClip().duration) * to.getClip().duration;
    to.setEffectiveTimeScale(next === "interact" ? 1 : to.timeScale || 1);
    to.setEffectiveWeight(1);
    to.fadeIn(fade).play();
    from.fadeOut(fade);
    this.state = next;
  }

  /**
   * Choose a locomotion state (no effect while interacting).
   * @param {"idle" | "walk" | "run"} state
   * @param {number} timeScale  Playback speed; negative plays the walk backwards.
   */
  setLocomotion(state, timeScale = 1) {
    if (this.interacting) return;
    this.play(state);
    this.actions[state].timeScale = timeScale;
  }

  fireMoment() {
    const moment = this.onInteractMoment;
    this.onInteractMoment = null;
    moment?.();
  }

  /**
   * Play the interaction once.
   * @param {{ onMoment?: () => void, momentTime?: number, onFinished?: () => void }} [options]
   *   `onMoment` runs when the clip reaches `momentTime` seconds; `onFinished`
   *   when it has ended (the cat then returns to idle).
   * @returns {boolean} false if one is already playing.
   */
  playInteraction({ onMoment, momentTime = 0, onFinished } = {}) {
    if (this.interacting) return false;
    this.onInteractFinished = onFinished ?? null;
    this.onInteractMoment = onMoment ?? null;
    this.momentTime = Math.min(momentTime, this.actions.interact.getClip().duration);
    this.actions.interact.timeScale = 1;
    this.play("interact", FADE.toInteract);
    return true;
  }

  /** Abort an interaction (e.g. on reset) and return to idle immediately. */
  cancelInteraction() {
    if (!this.interacting) return;
    this.onInteractFinished = null;
    this.onInteractMoment = null;
    this.play("idle", 0.15);
  }

  /** @param {number} delta */
  update(delta) {
    this.mixer.update(delta);
    if (this.onInteractMoment && this.interacting && this.actions.interact.time >= this.momentTime) this.fireMoment();
  }

  dispose() {
    this.mixer.removeEventListener("finished", this.handleFinished);
    this.mixer.stopAllAction();
    for (const action of Object.values(this.actions)) this.mixer.uncacheClip(action.getClip());
    this.mixer.uncacheRoot(this.root);
  }
}
