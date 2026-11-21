import * as THREE from "three";

/**
 * Draw into an offscreen canvas and wrap it as a texture.
 * @param {import("./ResourceTracker").ResourceTracker} tracker
 * @param {number} width
 * @param {number} height
 * @param {(ctx: CanvasRenderingContext2D, width: number, height: number) => void} draw
 * @param {{ repeat?: [number, number], srgb?: boolean }} [options]
 * @returns {THREE.CanvasTexture}
 */
export function createCanvasTexture(tracker, width, height, draw, { repeat, srgb = true } = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext("2d"));
  draw(ctx, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  if (repeat) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeat[0], repeat[1]);
  }
  return tracker.track(texture);
}

/**
 * Draw a single line of text, shrinking it until it fits the given width.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {{ maxWidth: number, size: number, family: string, weight?: number, color: string, align?: CanvasTextAlign }} options
 */
export function drawFittedText(ctx, text, x, y, { maxWidth, size, family, weight = 700, color, align = "center" }) {
  let fontSize = size;
  ctx.font = `${weight} ${fontSize}px ${family}`;
  while (ctx.measureText(text).width > maxWidth && fontSize > 10) {
    fontSize -= 2;
    ctx.font = `${weight} ${fontSize}px ${family}`;
  }
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}
