import * as THREE from "three";

/**
 * Central asset loading with one LoadingManager, so every file request feeds
 * the same progress value. The environment is procedural; the cat's GLB files
 * (see CAT_ASSETS) load through `loadGLTF`.
 */
export class AssetLoader {
  /** @param {(ratio: number) => void} [onProgress] */
  constructor(onProgress) {
    this.manager = new THREE.LoadingManager();
    this.manager.onProgress = (_url, loaded, total) => {
      onProgress?.(total > 0 ? loaded / total : 1);
    };
    /** @type {import("three/addons/loaders/GLTFLoader.js").GLTFLoader | null} */
    this.gltfLoader = null;
  }

  /**
   * Check whether an optional asset exists before requesting it.
   * @param {string} url
   * @returns {Promise<boolean>}
   */
  async exists(url) {
    try {
      const response = await fetch(url, { method: "HEAD" });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Load a glTF/GLB file. The loader module is imported on first use only.
   * @param {string} url
   */
  async loadGLTF(url) {
    if (!this.gltfLoader) {
      const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
      this.gltfLoader = new GLTFLoader(this.manager);
    }
    return this.gltfLoader.loadAsync(url);
  }
}
