/**
 * Keyboard state for the player. Uses `event.code` (physical keys), so WASD
 * works on any keyboard layout. Held keys are read every physics step; one-shot
 * actions (jump, interact, reset) are queued and consumed once.
 *
 * Ignores keys typed into form fields, and clears everything when the window
 * loses focus so a key released elsewhere never stays "stuck".
 */

const BINDINGS = /** @type {const} */ ({
  forward: ["KeyW", "ArrowUp"],
  back: ["KeyS", "ArrowDown"],
  left: ["KeyA", "ArrowLeft"],
  right: ["KeyD", "ArrowRight"],
  run: ["ShiftLeft", "ShiftRight"],
});

const ACTIONS = /** @type {const} */ ({
  Space: "jump",
  KeyE: "interact",
  KeyR: "reset",
});

/** Keys whose browser default (scrolling) is suppressed while playing. */
const PREVENT_DEFAULT = new Set(["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);

/** @typedef {"jump" | "interact" | "reset"} InputAction */

export class KeyboardInput {
  /** @param {Window} [target] */
  constructor(target = window) {
    this.target = target;
    /** @type {Set<string>} */
    this.down = new Set();
    /** @type {Set<InputAction>} */
    this.queued = new Set();
    this.enabled = true;

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.clear = this.clear.bind(this);
    target.addEventListener("keydown", this.onKeyDown);
    target.addEventListener("keyup", this.onKeyUp);
    target.addEventListener("blur", this.clear);
    document.addEventListener("visibilitychange", this.clear);
  }

  /** @param {KeyboardEvent} event */
  static isTyping(event) {
    const element = /** @type {HTMLElement | null} */ (event.target);
    if (!element || !element.tagName) return false;
    return ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName) || element.isContentEditable;
  }

  /** @param {KeyboardEvent} event */
  onKeyDown(event) {
    if (!this.enabled || KeyboardInput.isTyping(event) || event.ctrlKey || event.metaKey || event.altKey) return;
    if (PREVENT_DEFAULT.has(event.code)) event.preventDefault();
    this.down.add(event.code);
    const action = /** @type {InputAction | undefined} */ (ACTIONS[/** @type {keyof typeof ACTIONS} */ (event.code)]);
    if (action && !event.repeat) this.queued.add(action);
  }

  /** @param {KeyboardEvent} event */
  onKeyUp(event) {
    this.down.delete(event.code);
  }

  /** @param {readonly string[]} codes */
  any(codes) {
    for (const code of codes) if (this.down.has(code)) return true;
    return false;
  }

  /** Continuous movement intent from held keys. */
  get axes() {
    const move = (this.any(BINDINGS.forward) ? 1 : 0) - (this.any(BINDINGS.back) ? 1 : 0);
    const turn = (this.any(BINDINGS.left) ? 1 : 0) - (this.any(BINDINGS.right) ? 1 : 0);
    return { move, turn, run: this.any(BINDINGS.run) };
  }

  /**
   * Take a queued one-shot action (returns true once per key press).
   * @param {InputAction} action
   */
  consume(action) {
    return this.queued.delete(action);
  }

  /** @param {boolean} enabled */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this.clear();
  }

  clear() {
    this.down.clear();
    this.queued.clear();
  }

  dispose() {
    this.target.removeEventListener("keydown", this.onKeyDown);
    this.target.removeEventListener("keyup", this.onKeyUp);
    this.target.removeEventListener("blur", this.clear);
    document.removeEventListener("visibilitychange", this.clear);
    this.clear();
  }
}
