/**
 * Frame timing with delta clamping, so a long pause (tab switch, debugger,
 * slow frame) never produces a huge simulation step.
 */
export class Time {
  /** @param {number} maxDelta Largest accepted step in seconds. */
  constructor(maxDelta) {
    this.maxDelta = maxDelta;
    /** @type {number | null} */
    this.last = null;
    this.delta = 0;
    this.elapsed = 0;
  }

  /**
   * @param {number} now Timestamp in milliseconds (from the animation loop).
   * @returns {number} Clamped delta in seconds.
   */
  tick(now) {
    if (this.last === null) {
      this.last = now;
      this.delta = 0;
      return 0;
    }
    const raw = (now - this.last) / 1000;
    this.last = now;
    this.delta = raw > 0 ? Math.min(raw, this.maxDelta) : 0;
    this.elapsed += this.delta;
    return this.delta;
  }

  /** Forget the last timestamp, e.g. after the loop was paused. */
  reset() {
    this.last = null;
  }
}
