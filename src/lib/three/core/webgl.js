/**
 * Returns true when the browser can create a WebGL context.
 * Imports nothing from Three.js so the UI can call it before loading the engine.
 * @returns {boolean}
 */
export function isWebGLAvailable() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return false;
    // Release the probe context straight away; browsers cap live contexts.
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}
