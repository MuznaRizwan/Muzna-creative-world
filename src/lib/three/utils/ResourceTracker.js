/**
 * Owns GPU resources (geometries, materials, textures, render targets) created
 * for the world. Shared resources are disposed exactly once, when the whole
 * engine is torn down, never when one object that uses them goes away.
 */
export class ResourceTracker {
  constructor() {
    /** @type {Set<{ dispose: () => void }>} */
    this.resources = new Set();
  }

  /**
   * @template T
   * @param {T} resource
   * @returns {T}
   */
  track(resource) {
    if (resource && typeof (/** @type {any} */ (resource).dispose) === "function") {
      this.resources.add(/** @type {any} */ (resource));
    }
    return resource;
  }

  get size() {
    return this.resources.size;
  }

  /** @returns {number} How many resources were released. */
  disposeAll() {
    const count = this.resources.size;
    for (const resource of this.resources) {
      try {
        resource.dispose();
      } catch (error) {
        console.warn("[world] failed to dispose resource", error);
      }
    }
    this.resources.clear();
    return count;
  }
}
