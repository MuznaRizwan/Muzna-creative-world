/**
 * Finds which interactable the cat can use and dispatches interactions.
 *
 * Interactables are points recorded by the world builder (kiosks, the post
 * box, notice board…). Each frame the system picks the best one within reach,
 * preferring objects in front of the cat, and notifies listeners only when that
 * focus changes (so React overlays update rarely). `trigger()` is called by the
 * player once its interaction animation has started; handlers registered per
 * id or per zone will open portfolio content in a later phase.
 */

/**
 * @typedef {object} Interactable
 * @property {string} id
 * @property {string} zoneId
 * @property {string} label
 * @property {number} x @property {number} y @property {number} z
 */

/** @typedef {(target: Interactable | null) => void} FocusListener */
/** @typedef {(target: Interactable) => void} InteractHandler */

export class InteractionSystem {
  /**
   * @param {Interactable[]} interactables
   * @param {{ radius: number, maxHeightDifference?: number }} options
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
    /** @type {Map<string, InteractHandler>} */
    this.handlers = new Map();
  }

  /**
   * Best interactable for a character at (x, y, z) facing `yaw`, or null.
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
      if (distance > this.radius) continue;
      // Interaction points float about a metre up; compare against standing height.
      if (Math.abs(point.y - 1.1 - y) > this.maxHeightDifference) continue;
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
    const next = this.enabled ? this.findTarget(x, y, z, yaw) : null;
    if (next === this.focused) return;
    this.focused = next;
    for (const listener of this.focusListeners) listener(next);
  }

  /** @param {Interactable} target */
  trigger(target) {
    const handler = this.handlers.get(target.id) ?? this.handlers.get(`zone:${target.zoneId}`);
    handler?.(target);
    for (const listener of this.interactListeners) listener(target);
  }

  /** @param {boolean} enabled */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled && this.focused) {
      this.focused = null;
      for (const listener of this.focusListeners) listener(null);
    }
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

  /**
   * Register what happens when a specific object (by id) or any object in a
   * zone (`zone:<zoneId>`) is used. For the portfolio panels later.
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

  dispose() {
    this.focusListeners.clear();
    this.interactListeners.clear();
    this.handlers.clear();
  }
}
