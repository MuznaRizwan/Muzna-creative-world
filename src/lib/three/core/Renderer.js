import * as THREE from "three";

import { RENDER } from "@/constants/world";

/**
 * Create the WebGL renderer with the project's colour, tone-mapping and shadow settings.
 * Shadows are static for now (the world does not move), so the shadow map is
 * rendered on demand via `renderer.shadowMap.needsUpdate = true`.
 * @param {HTMLCanvasElement} canvas
 * @returns {THREE.WebGLRenderer}
 */
export function createRenderer(canvas) {
  const highDensity = window.devicePixelRatio >= 2;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    // MSAA is expensive on high-density screens, where aliasing is barely visible.
    antialias: !highDensity,
    alpha: false,
    stencil: false,
    powerPreference: "high-performance",
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, RENDER.maxPixelRatio));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // Neutral tone mapping keeps the painted palette close to its hex values.
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;

  return renderer;
}
