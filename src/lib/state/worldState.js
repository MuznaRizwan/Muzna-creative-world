import { createStore } from "./createStore";

/**
 * Shared state between the 3D engine and the HTML interface.
 *
 * - Engine → UI: camera mode, the interactable in reach (`focus`).
 * - UI → engine: the open portfolio panel. While a panel is open the engine
 *   locks the cat's controls; closing it gives them back. Also the day/night
 *   theme of the world.
 *
 * One instance per mounted world (created by WorldCanvas), so React Strict
 * Mode remounts never share stale state.
 */

/** @typedef {import("@/data/portfolioSections").SectionId} SectionId */
/** @typedef {import("@/lib/three/interactions/InteractionSystem").Interactable} Interactable */

/**
 * @typedef {object} OpenPanel
 * @property {SectionId} section
 * @property {string | null} sourceId  Interactable that opened it (null from the menu).
 * @property {Record<string, string>} params  e.g. { projectId }.
 */

/**
 * @typedef {object} WorldState
 * @property {"follow" | "dev"} mode
 * @property {boolean} catReady
 * @property {Interactable | null} focus
 * @property {OpenPanel | null} panel
 * @property {"day" | "night"} theme  Golden hour or night in the 3D world.
 */

export function createWorldState() {
  const store = createStore(/** @type {WorldState} */ ({ mode: "dev", catReady: false, focus: null, panel: null, theme: "day" }));
  return {
    ...store,
    /**
     * @param {SectionId} section
     * @param {{ sourceId?: string | null, params?: Record<string, string> }} [options]
     */
    openPanel(section, { sourceId = null, params = {} } = {}) {
      store.setState({ panel: { section, sourceId, params } });
    },
    closePanel() {
      store.setState({ panel: null });
    },
  };
}

/** @typedef {ReturnType<typeof createWorldState>} WorldStateStore */
