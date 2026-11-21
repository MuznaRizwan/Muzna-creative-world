import { PALETTE } from "@/constants/world";

import { createCanvasTexture, drawFittedText } from "../utils/canvasTexture";

/**
 * Procedural canvas textures for signage, screens and surface patterns.
 * Each function returns a factory for `kit.textured(key, factory)` so a
 * texture is only drawn once, however many objects use it.
 */

/** @param {import("./kit").Kit} kit */
export function createTextures(kit) {
  const { tracker, fontFamily } = kit;

  /** Timber board with cream painted lettering and an accent stripe. */
  const signBoard = (/** @type {string} */ text, /** @type {string} */ accent) => () =>
    createCanvasTexture(tracker, 1024, 256, (ctx, w, h) => {
      ctx.fillStyle = PALETTE.timber;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 3;
      for (let y = 22; y < h; y += 38) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(w * 0.3, y + 6, w * 0.6, y - 6, w, y + 3);
        ctx.stroke();
      }
      ctx.fillStyle = accent;
      ctx.fillRect(0, 0, 26, h);
      drawFittedText(ctx, text, w / 2 + 13, h / 2 + 4, {
        maxWidth: w - 110,
        size: 120,
        family: fontFamily,
        color: PALETTE.limewash,
      });
    });

  /** Arrow board lettering (narrower boards on signposts). */
  const arrowLabel = (/** @type {string} */ text) => () =>
    createCanvasTexture(tracker, 512, 128, (ctx, w, h) => {
      ctx.fillStyle = PALETTE.timber;
      ctx.fillRect(0, 0, w, h);
      drawFittedText(ctx, text, w / 2, h / 2 + 2, { maxWidth: w - 40, size: 64, family: fontFamily, color: PALETTE.limewash });
    });

  /** Compass rose inlay for the plaza floor; labels point at each zone. */
  const compassRose = (/** @type {{ name: string, angle: number, accent: string }[]} */ labels) => () =>
    createCanvasTexture(tracker, 1024, 1024, (ctx, w) => {
      const c = w / 2;
      ctx.fillStyle = PALETTE.sandstone;
      ctx.fillRect(0, 0, w, w);
      ctx.strokeStyle = PALETTE.kerb;
      ctx.lineWidth = 10;
      for (const r of [500, 440, 300]) {
        ctx.beginPath();
        ctx.arc(c, c, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Eight-point star.
      for (let i = 0; i < 8; i += 1) {
        const a = (i * Math.PI) / 4;
        const long = i % 2 === 0 ? 290 : 190;
        ctx.fillStyle = i % 2 === 0 ? PALETTE.terracotta : PALETTE.marigold;
        ctx.beginPath();
        ctx.moveTo(c + Math.cos(a) * long, c + Math.sin(a) * long);
        ctx.lineTo(c + Math.cos(a + 0.22) * 70, c + Math.sin(a + 0.22) * 70);
        ctx.lineTo(c, c);
        ctx.lineTo(c + Math.cos(a - 0.22) * 70, c + Math.sin(a - 0.22) * 70);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = PALETTE.limewash;
      ctx.beginPath();
      ctx.arc(c, c, 46, 0, Math.PI * 2);
      ctx.fill();
      // Zone names around the rim (canvas up = north, right = east).
      for (const label of labels) {
        const x = c + Math.cos(label.angle) * 370;
        const y = c + Math.sin(label.angle) * 370;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(label.angle + Math.PI / 2);
        ctx.fillStyle = label.accent;
        ctx.fillRect(-6, -78, 12, 22);
        drawFittedText(ctx, label.name.toUpperCase(), 0, -28, {
          maxWidth: 230,
          size: 34,
          family: fontFamily,
          color: PALETTE.timberDark,
        });
        ctx.restore();
      }
    });

  /** Jaali lattice: opaque stone with transparent openings (use alphaTest). */
  const jaali = () =>
    createCanvasTexture(
      tracker,
      256,
      256,
      (ctx, w) => {
        ctx.clearRect(0, 0, w, w);
        ctx.fillStyle = PALETTE.limewash;
        ctx.fillRect(0, 0, w, w);
        ctx.globalCompositeOperation = "destination-out";
        const cell = w / 4;
        for (let i = 0; i < 4; i += 1) {
          for (let j = 0; j < 4; j += 1) {
            const cx = i * cell + cell / 2;
            const cy = j * cell + cell / 2;
            // Eight-pointed star opening made of two rotated squares.
            for (const rot of [0, Math.PI / 4]) {
              ctx.save();
              ctx.translate(cx, cy);
              ctx.rotate(rot);
              ctx.fillRect(-cell * 0.26, -cell * 0.26, cell * 0.52, cell * 0.52);
              ctx.restore();
            }
          }
        }
        ctx.globalCompositeOperation = "source-over";
      },
      { repeat: [1, 1] }
    );

  /** Level-grid paving for the Game Dev Zone courtyard. */
  const levelGrid = () =>
    createCanvasTexture(tracker, 1024, 1024, (ctx, w) => {
      ctx.fillStyle = PALETTE.sandstone;
      ctx.fillRect(0, 0, w, w);
      const step = w / 16;
      ctx.strokeStyle = "rgba(143, 69, 43, 0.28)";
      ctx.lineWidth = 4;
      for (let i = 0; i <= 16; i += 1) {
        ctx.beginPath();
        ctx.moveTo(i * step, 0);
        ctx.lineTo(i * step, w);
        ctx.moveTo(0, i * step);
        ctx.lineTo(w, i * step);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(169, 127, 216, 0.35)";
      const cells = [[5, 9], [6, 9], [7, 8], [8, 8], [9, 7], [10, 6], [10, 5], [6, 3], [4, 12], [11, 12]];
      for (const [i, j] of cells) ctx.fillRect(i * step + 3, j * step + 3, step - 6, step - 6);
    });

  /** Sandstone paving with carved circuit traces (Technology Lab). */
  const circuitPaving = () =>
    createCanvasTexture(tracker, 1024, 1024, (ctx, w) => {
      ctx.fillStyle = PALETTE.sandstone;
      ctx.fillRect(0, 0, w, w);
      ctx.strokeStyle = "rgba(63, 111, 104, 0.45)";
      ctx.fillStyle = "rgba(63, 111, 104, 0.55)";
      ctx.lineWidth = 7;
      const traces = [
        [[60, 120], [380, 120], [460, 200], [460, 520]],
        [[960, 300], [700, 300], [620, 380], [620, 700], [540, 780], [200, 780]],
        [[120, 960], [120, 640], [260, 500], [420, 500]],
        [[860, 980], [860, 760], [760, 660]],
        [[300, 40], [300, 300], [200, 400], [60, 400]],
      ];
      for (const trace of traces) {
        ctx.beginPath();
        ctx.moveTo(trace[0][0], trace[0][1]);
        for (const [x, y] of trace.slice(1)) ctx.lineTo(x, y);
        ctx.stroke();
        for (const [x, y] of [trace[0], trace[trace.length - 1]]) {
          ctx.beginPath();
          ctx.arc(x, y, 14, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

  /** Abstract dusk landscape for the giant easel (placeholder for Muzna's own artwork). */
  const easelPainting = () =>
    createCanvasTexture(tracker, 512, 640, (ctx, w, h) => {
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.62);
      sky.addColorStop(0, PALETTE.zenith);
      sky.addColorStop(0.55, PALETTE.lavenderBand);
      sky.addColorStop(1, PALETTE.horizon);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = PALETTE.sun;
      ctx.beginPath();
      ctx.arc(w * 0.68, h * 0.5, 56, 0, Math.PI * 2);
      ctx.fill();
      const hills = [
        [PALETTE.meadowShade, 0.62, 40],
        [PALETTE.meadow, 0.72, 30],
        [PALETTE.terracotta, 0.86, 22],
      ];
      for (const [color, base, amp] of hills) {
        ctx.fillStyle = /** @type {string} */ (color);
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 16) {
          ctx.lineTo(x, h * /** @type {number} */ (base) + Math.sin(x * 0.018 + /** @type {number} */ (amp)) * /** @type {number} */ (amp));
        }
        ctx.lineTo(w, h);
        ctx.fill();
      }
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 6;
      for (let i = 0; i < 26; i += 1) {
        const x = (i * 97) % w;
        const y = (i * 53) % (h * 0.5);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 40, y + 6);
        ctx.stroke();
      }
    });

  /** Dark screen with abstract "code" bars (no real text). */
  const codeScreen = () =>
    createCanvasTexture(tracker, 512, 320, (ctx, w, h) => {
      ctx.fillStyle = "#16202b";
      ctx.fillRect(0, 0, w, h);
      const colors = ["#8fd3c7", "#c9a24a", "#bfa3e0", "#e6cfa6"];
      for (let row = 0; row < 12; row += 1) {
        let x = 24 + (row % 3) * 26;
        const y = 24 + row * 24;
        for (let k = 0; k < 4; k += 1) {
          const len = 30 + ((row * 37 + k * 59) % 90);
          ctx.fillStyle = colors[(row + k) % colors.length];
          ctx.fillRect(x, y, len, 10);
          x += len + 14;
          if (x > w - 60) break;
        }
      }
    });

  /** Simple text screen (kiosks, arcade cabinets). */
  const screenText = (/** @type {string} */ text, /** @type {string} */ background, /** @type {string} */ color) => () =>
    createCanvasTexture(tracker, 512, 384, (ctx, w, h) => {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 2;
      for (let y = 0; y < h; y += 6) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      const words = text.split(" ");
      const lines = [];
      let current = "";
      ctx.font = `700 64px ${fontFamily}`;
      for (const word of words) {
        const attempt = current ? `${current} ${word}` : word;
        if (ctx.measureText(attempt).width > w - 70 && current) {
          lines.push(current);
          current = word;
        } else current = attempt;
      }
      lines.push(current);
      const lineHeight = 70;
      const top = h / 2 - ((lines.length - 1) * lineHeight) / 2;
      lines.forEach((line, i) => {
        drawFittedText(ctx, line, w / 2, top + i * lineHeight, { maxWidth: w - 60, size: 64, family: fontFamily, color });
      });
    });

  /** Arcade marquee "PRESS START". */
  const marquee = () =>
    createCanvasTexture(tracker, 1024, 320, (ctx, w, h) => {
      ctx.fillStyle = "#3a2552";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = PALETTE.lamp;
      ctx.lineWidth = 10;
      ctx.strokeRect(22, 22, w - 44, h - 44);
      drawFittedText(ctx, "PRESS START", w / 2, h / 2 + 6, { maxWidth: w - 140, size: 170, family: fontFamily, color: PALETTE.lamp });
    });

  /** Cinema screen poster frame. */
  const poster = () =>
    createCanvasTexture(tracker, 1024, 576, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#3b2244");
      g.addColorStop(0.6, PALETTE.crimson);
      g.addColorStop(1, PALETTE.horizon);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      drawFittedText(ctx, "SHOWREEL", w / 2, h / 2 - 30, { maxWidth: w - 200, size: 150, family: fontFamily, color: PALETTE.limewash });
      drawFittedText(ctx, "Muzna's Creative World", w / 2, h / 2 + 90, {
        maxWidth: w - 300,
        size: 48,
        weight: 500,
        family: fontFamily,
        color: PALETTE.horizon,
      });
    });

  /** Clock face reading 5:40, golden hour. */
  const clockFace = () =>
    createCanvasTexture(tracker, 256, 256, (ctx, w) => {
      const c = w / 2;
      ctx.fillStyle = PALETTE.limewash;
      ctx.beginPath();
      ctx.arc(c, c, c - 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = 8;
      ctx.stroke();
      for (let i = 0; i < 12; i += 1) {
        const a = (i / 12) * Math.PI * 2;
        ctx.lineWidth = i % 3 === 0 ? 8 : 4;
        ctx.beginPath();
        ctx.moveTo(c + Math.sin(a) * 100, c - Math.cos(a) * 100);
        ctx.lineTo(c + Math.sin(a) * 112, c - Math.cos(a) * 112);
        ctx.stroke();
      }
      const hand = (/** @type {number} */ turns, /** @type {number} */ length, /** @type {number} */ width) => {
        const a = turns * Math.PI * 2;
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(c, c);
        ctx.lineTo(c + Math.sin(a) * length, c - Math.cos(a) * length);
        ctx.stroke();
      };
      hand((5 + 40 / 60) / 12, 62, 10);
      hand(40 / 60, 94, 6);
    });

  /** Dark-blue star chart with constellation lines. */
  const starChart = () =>
    createCanvasTexture(tracker, 512, 384, (ctx, w, h) => {
      ctx.fillStyle = "#1f2450";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = PALETTE.paper;
      const stars = [];
      for (let i = 0; i < 70; i += 1) {
        const x = (i * 157) % w;
        const y = (i * 89 + (i % 7) * 31) % h;
        stars.push([x, y]);
        ctx.beginPath();
        ctx.arc(x, y, i % 9 === 0 ? 4 : 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = "rgba(191,163,224,0.7)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (const i of [3, 12, 21, 30, 39]) ctx.lineTo(stars[i][0], stars[i][1]);
      ctx.stroke();
    });

  return {
    signBoard,
    arrowLabel,
    compassRose,
    jaali,
    levelGrid,
    circuitPaving,
    easelPainting,
    codeScreen,
    screenText,
    marquee,
    poster,
    clockFace,
    starChart,
  };
}

/** @typedef {ReturnType<typeof createTextures>} Textures */
