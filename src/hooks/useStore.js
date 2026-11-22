"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribe a component to one slice of a store created with `createStore`.
 * The component re-renders only when the selected value changes.
 *
 * @template T, S
 * @param {{ getState: () => T, subscribe: (listener: () => void) => () => void }} store
 * @param {(state: T) => S} selector  Must return a stable value (a field, not a new object).
 * @returns {S}
 */
export function useStore(store, selector) {
  const subscribe = useCallback((/** @type {() => void} */ onChange) => store.subscribe(onChange), [store]);
  const read = () => selector(store.getState());
  return useSyncExternalStore(subscribe, read, read);
}
