/**
 * Central registry and dispatcher for interactable objects.
 *
 * Interactables come from `src/data/interactables.js` (what each object is,
 * its prompt, reach and action), placed in the world by the location builders.
 * Each frame the system picks the single best object within reach, preferring
 * ones in front of the cat, and tells listeners only when that focus changes,
 * so React overlays re-render rarely. Detection is separate from presentation:
 * this module knows nothing about panels or the DOM.
 *
 * Using an object runs the handler registered for its action kind (e.g.
 * "open-panel"), then any handler registered for that object id or its zone.
 */

/**
 * @typedef {import("@/data/interactables").InteractableDefinition & { x: number, y: number, z: number }} Interactable
 */

/** @typedef {(target: Interactable | null) => void} FocusListener */
/** @typedef {(target: Interactable) => void} InteractHandler */

/** Interaction points float about this high above the surface the cat stands on. */
const POINT_HEIGHT = 1.1;

export class InteractionSystem {
  /**
   * @param {Interactable[]} interactables
   * @param {{ radius: number, maxHeightDifference?: number }} options  `radius` is the reach for objects without their own `range`.
   */
  constructor(interactables, { radius, maxHeightDifference = 1.6 }) {
    this.interactables = interactables;
    this.radius = radius;
    this.maxHeightDifference = maxHeightDifference;
    /** @type {Interactable | null} */
    this.focused = null;
    this.enabled = true;
    /** @type {Set<FocusListener>} */
    this.focusListeners = new Set();
    /** @type {Set<InteractHandler>} */
    this.interactListeners = new Set();
    /** @type {Map<string, InteractHandler>} Handlers per object id or `zone:<id>`. */
    this.handlers = new Map();
    /** @type {Map<string, InteractHandler>} Handlers per action kind. */
    this.actions = new Map();
  }

  /**
   * Best interactable for a character at (x, y, z) facing `yaw`, or null.
   * Only one object is ever returned, so two can't trigger at once.
   * @param {number} x @param {number} y @param {number} z @param {number} yaw
   */
  findTarget(x, y, z, yaw) {
    const fx = Math.sin(yaw);
    const fz = Math.cos(yaw);
    /** @type {Interactable | null} */
    let best = null;
    let bestScore = Infinity;
    for (const point of this.interactables) {
      const dx = point.x - x;
      const dz = point.z - z;
      const distance = Math.hypot(dx, dz);
      if (distance > (point.range ?? this.radius)) continue;
      if (Math.abs(point.y - POINT_HEIGHT - y) > this.maxHeightDifference) continue;
      const facing = distance > 1e-3 ? (dx * fx + dz * fz) / distance : 1;
      const score = distance - facing * 0.6;
      if (score < bestScore) {
        bestScore = score;
        best = point;
      }
    }
    return best;
  }

  /**
   * Update the focused interactable; listeners hear about changes only.
   * @param {number} x @param {number} y @param {number} z @param {number} yaw
   */
  update(x, y, z, yaw) {
    this.setFocus(this.enabled ? this.findTarget(x, y, z, yaw) : null);
  }

  /** @param {Interactable | null} next */
  setFocus(next) {
    if (next === this.focused) return;
    this.focused = next;
    for (const listener of this.focusListeners) listener(next);
  }

  /**
   * Run an object's action (called by the player at the right moment of the
   * interaction animation).
   * @param {Interactable} target
   */
  trigger(target) {
    const action = this.actions.get(target.action?.kind);
    if (action) action(target);
    else if (process.env.NODE_ENV === "development") console.warn(`[world] no handler for action "${target.action?.kind}" (${target.id}).`);
    this.handlers.get(target.id)?.(target);
    this.handlers.get(`zone:${target.zoneId}`)?.(target);
    for (const listener of this.interactListeners) listener(target);
  }

  /** @param {boolean} enabled */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this.setFocus(null);
  }

  /**
   * Define what an action kind does (e.g. "open-panel").
   * @param {string} kind
   * @param {InteractHandler} handler
   * @returns {() => void} Unregister.
   */
  registerAction(kind, handler) {
    this.actions.set(kind, handler);
    return () => {
      if (this.actions.get(kind) === handler) this.actions.delete(kind);
    };
  }

  /**
   * Extra behaviour for one object (by id) or every object in a zone
   * (`zone:<zoneId>`), on top of its action.
   * @param {string} key
   * @param {InteractHandler} handler
   * @returns {() => void} Unregister.
   */
  register(key, handler) {
    this.handlers.set(key, handler);
    return () => {
      if (this.handlers.get(key) === handler) this.handlers.delete(key);
    };
  }

  /**
   * @param {FocusListener} listener
   * @returns {() => void} Unsubscribe.
   */
  onFocusChange(listener) {
    this.focusListeners.add(listener);
    return () => this.focusListeners.delete(listener);
  }

  /**
   * @param {InteractHandler} listener
   * @returns {() => void} Unsubscribe.
   */
  onInteract(listener) {
    this.interactListeners.add(listener);
    return () => this.interactListeners.delete(listener);
  }

  dispose() {
    this.focusListeners.clear();
    this.interactListeners.clear();
    this.handlers.clear();
    this.actions.clear();
  }
}
