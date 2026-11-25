"use client";

import { Moon, Sun } from "lucide-react";

import { useWorld } from "@/components/world/WorldContext";
import { THEME } from "@/constants/world";
import { useStore } from "@/hooks/useStore";

/**
 * The visitor's saved choice, if any. Storage can be unavailable (private
 * windows, blocked site data), so this never throws.
 * @returns {"day" | "night"}
 */
export function readStoredTheme() {
  try {
    return window.localStorage.getItem(THEME.storageKey) === "night" ? "night" : "day";
  } catch {
    return "day";
  }
}

/** Sun/moon button: switches the 3D world between golden hour and night, and remembers the choice. */
export function ThemeToggle() {
  const { state } = useWorld();
  const theme = useStore(state, (s) => s.theme);
  const night = theme === "night";
  const label = night ? "Switch to golden hour" : "Switch to night";

  const toggle = () => {
    const next = night ? "day" : "night";
    state.setState({ theme: next });
    try {
      window.localStorage.setItem(THEME.storageKey, next);
    } catch {
      // Not saved; the switch still works for this visit.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      onPointerUp={(event) => event.currentTarget.blur()}
      aria-label={label}
      title={label}
      className="flex items-center rounded-lg border border-line bg-glass/85 p-2.5 text-fg backdrop-blur hover:bg-raised"
    >
      {night ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}
