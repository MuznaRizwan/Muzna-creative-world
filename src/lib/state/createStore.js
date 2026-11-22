/**
 * Minimal observable store shared by the engine (plain JS) and React (via
 * `useStore`). State is replaced immutably; listeners run only when a value
 * actually changed. Never put per-frame data (positions) in here.
 *
 * @template {object} T
 * @param {T} initial
 */
export function createStore(initial) {
  let state = initial;
  /** @type {Set<(state: T, previous: T) => void>} */
  const listeners = new Set();

  return {
    /** @returns {T} */
    getState: () => state,

    /**
     * Merge a partial update (or the result of an updater).
     * @param {Partial<T> | ((state: T) => Partial<T>)} update
     */
    setState(update) {
      const patch = typeof update === "function" ? update(state) : update;
      let changed = false;
      for (const key of Object.keys(patch)) {
        if (!Object.is(/** @type {any} */ (state)[key], /** @type {any} */ (patch)[key])) changed = true;
      }
      if (!changed) return;
      const previous = state;
      state = { ...state, ...patch };
      for (const listener of listeners) listener(state, previous);
    },

    /**
     * @param {(state: T, previous: T) => void} listener
     * @returns {() => void} Unsubscribe.
     */
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
