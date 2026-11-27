"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Cat, Undo2 } from "lucide-react";
import { useEffect } from "react";

import { useWorld } from "@/components/world/WorldContext";
import { useStore } from "@/hooks/useStore";

/**
 * The cat view: a close-up orbit camera around the cat, so visitors can look
 * at the whole avatar from every side (drag to orbit, scroll or pinch to zoom).
 * The cat waits in its idle pose meanwhile; the follow camera comes back with
 * the button, V or Escape.
 *
 * The button sits in the top-right row beside the day/night switch (SiteMenu.jsx).
 */
export function CatViewButton() {
  const { state, engine } = useWorld();
  const catReady = useStore(state, (s) => s.catReady);
  const viewing = useStore(state, (s) => s.mode === "dev");

  useEffect(() => {
    if (!engine || !catReady) return undefined;
    /** @param {KeyboardEvent} event */
    const onKey = (event) => {
      const target = /** @type {HTMLElement | null} */ (event.target);
      if (target && (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable)) return;
      // A portfolio panel handles its own keys (Escape closes it).
      if (state.getState().panel) return;
      const inCatView = state.getState().mode === "dev";
      if (event.key.toLowerCase() === "v" && !event.ctrlKey && !event.metaKey && !event.altKey) {
        if (inCatView) engine.showCatView();
        else engine.inspectCat();
      } else if (event.key === "Escape" && inCatView) {
        engine.showCatView();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [engine, catReady, state]);

  if (!engine || !catReady) return null;
  const label = viewing ? "Back to playing (V)" : "View the cat up close (V)";

  return (
    <button
      type="button"
      onClick={() => (viewing ? engine.showCatView() : engine.inspectCat())}
      onPointerUp={(event) => event.currentTarget.blur()}
      aria-label={label}
      aria-pressed={viewing}
      title={label}
      className={`flex items-center rounded-lg border p-2.5 backdrop-blur hover:bg-raised ${
        viewing ? "border-lavender/70 bg-raised text-lavender" : "border-line bg-glass/85 text-fg"
      }`}
    >
      <Cat className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

/** While the cat view is open: how to look around, and the way back to playing. */
export function CatViewHint() {
  const { state, engine } = useWorld();
  const viewing = useStore(state, (s) => s.mode === "dev" && s.catReady && s.panel === null);
  const reduceMotion = useReducedMotion();
  const touch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  return (
    <AnimatePresence>
      {viewing && engine && (
        <motion.div
          key="cat-view-hint"
          role="status"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
          transition={{ duration: 0.18 }}
          className="absolute inset-x-0 bottom-0 z-10 flex justify-center px-3 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <div className="flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-xl border border-line bg-glass/90 px-4 py-2.5 text-sm text-fg shadow-lg backdrop-blur">
            <span className="flex items-center gap-2">
              <Cat className="h-4 w-4 shrink-0 text-lavender" aria-hidden="true" />
              {touch ? "Drag to look around the cat, pinch to zoom" : "Drag to look around the cat, scroll to zoom"}
            </span>
            <button
              type="button"
              onClick={() => engine.showCatView()}
              onPointerUp={(event) => event.currentTarget.blur()}
              className="flex items-center gap-1.5 rounded-lg bg-lavender px-3 py-1.5 text-sm font-medium text-ink hover:bg-lavender/90"
            >
              <Undo2 className="h-4 w-4" aria-hidden="true" />
              Back to playing
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
