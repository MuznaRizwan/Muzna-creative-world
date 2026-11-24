/**
 * Player input: the keyboard, plus a "virtual stick" that the on-screen touch
 * controls write into (TouchControls.jsx). Uses `event.code` (physical keys),
 * so WASD works on any keyboard layout. Held keys and the stick are read every
 * physics step; one-shot actions (jump, interact, reset) are queued and
 * consumed once.
 *
 * Ignores keys typed into form fields, and clears everything when the window
 * loses focus so a key released elsewhere never stays "stuck".
 */

/** @param {number} value */
const clampUnit = (value) => Math.max(-1, Math.min(1, value));

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
    /** Touch joystick: move and turn in -1..1 (analogue), run when pushed to the edge. */
    this.virtual = { move: 0, turn: 0, run: false };
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

  /** Continuous movement intent from held keys and the touch stick. */
  get axes() {
    const move = (this.any(BINDINGS.forward) ? 1 : 0) - (this.any(BINDINGS.back) ? 1 : 0);
    const turn = (this.any(BINDINGS.left) ? 1 : 0) - (this.any(BINDINGS.right) ? 1 : 0);
    return {
      move: clampUnit(move + this.virtual.move),
      turn: clampUnit(turn + this.virtual.turn),
      run: this.any(BINDINGS.run) || this.virtual.run,
    };
  }

  /**
   * Set the touch stick (0, 0 when released).
   * @param {{ move: number, turn: number, run: boolean }} stick
   */
  setVirtual({ move, turn, run }) {
    if (!this.enabled) return;
    this.virtual = { move: clampUnit(move), turn: clampUnit(turn), run };
  }

  /**
   * Queue a one-shot action from an on-screen button (like a key press).
   * @param {InputAction} action
   */
  press(action) {
    if (this.enabled) this.queued.add(action);
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
    this.virtual = { move: 0, turn: 0, run: false };
  }

  dispose() {
    this.target.removeEventListener("keydown", this.onKeyDown);
    this.target.removeEventListener("keyup", this.onKeyUp);
    this.target.removeEventListener("blur", this.clear);
    document.removeEventListener("visibilitychange", this.clear);
    this.clear();
  }
}
