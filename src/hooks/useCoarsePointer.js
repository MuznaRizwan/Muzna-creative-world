"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(pointer: coarse)";

/** @param {() => void} onChange */
function subscribe(onChange) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;
const getServerSnapshot = () => false;

/**
 * Whether the main pointer is a finger (phones, tablets): touch controls and
 * "Tap" wording instead of keyboard hints. Updates if that changes (for
 * example a tablet with a keyboard and trackpad attached).
 */
export function useCoarsePointer() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
