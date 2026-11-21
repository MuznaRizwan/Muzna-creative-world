import { RENDER } from "@/constants/world";

/**
 * @typedef {object} ViewportSize
 * @property {number} width
 * @property {number} height
 * @property {number} pixelRatio
 */

/**
 * Watches the container size (and device pixel ratio) and reports changes.
 */
export class Viewport {
  /**
   * @param {HTMLElement} container
   * @param {(size: ViewportSize) => void} onChange
   */
  constructor(container, onChange) {
    this.container = container;
    this.onChange = onChange;
    /** @type {ViewportSize} */
    this.size = { width: 1, height: 1, pixelRatio: 1 };

    this.measure = this.measure.bind(this);
    this.observer = new ResizeObserver(this.measure);
    this.observer.observe(container);
    // Window resize also catches pixel-ratio changes (moving between monitors, zoom).
    window.addEventListener("resize", this.measure);
    this.measure();
  }

  measure() {
    const width = Math.max(1, Math.floor(this.container.clientWidth));
    const height = Math.max(1, Math.floor(this.container.clientHeight));
    const pixelRatio = Math.min(window.devicePixelRatio || 1, RENDER.maxPixelRatio);
    const { size } = this;
    if (size.width === width && size.height === height && size.pixelRatio === pixelRatio) return;
    this.size = { width, height, pixelRatio };
    this.onChange(this.size);
  }

  dispose() {
    this.observer.disconnect();
    window.removeEventListener("resize", this.measure);
  }
}
