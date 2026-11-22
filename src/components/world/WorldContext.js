"use client";

import { createContext, useContext } from "react";

/**
 * Gives the HTML overlays (prompt, panels, menu) access to the shared world
 * state and, once it is ready, the engine. Overlays never import Three.js; they
 * call a few engine methods (interact, travel) and read the state store.
 *
 * @typedef {object} WorldContextValue
 * @property {import("@/lib/state/worldState").WorldStateStore} state
 * @property {import("@/lib/three/Engine").Engine | null} engine
 * @property {{ showreel: boolean }} media  Which optional media files exist.
 */

export const WorldContext = createContext(/** @type {WorldContextValue | null} */ (null));

/** @returns {WorldContextValue} */
export function useWorld() {
  const value = useContext(WorldContext);
  if (!value) throw new Error("useWorld must be used inside <WorldCanvas>.");
  return value;
}
