"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { useWorld } from "@/components/world/WorldContext";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { useStore } from "@/hooks/useStore";

/**
 * "Press E to …" hint for the object in reach. The engine reports focus
 * changes only (never per frame), so this re-renders rarely. It disappears
 * when nothing is in reach, while a panel is open, and on the dev camera.
 * On touch screens the hint itself is the button and reads "Tap to …".
 */
export function InteractionPrompt() {
  const { state, engine } = useWorld();
  const focus = useStore(state, (s) => s.focus);
  const mode = useStore(state, (s) => s.mode);
  const panelOpen = useStore(state, (s) => s.panel !== null);
  const reduceMotion = useReducedMotion();
  const touch = useCoarsePointer();
  const visible = Boolean(focus) && mode === "follow" && !panelOpen;

  return (
    <div
      aria-live="polite"
      // On touch screens it sits above the joystick and jump button.
      className={`pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-4 ${
        touch ? "pb-[calc(max(1.25rem,env(safe-area-inset-bottom))+9rem)]" : "pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      }`}
    >
      <AnimatePresence>
        {visible && focus && (
          <motion.button
            key={focus.id}
            type="button"
            onClick={() => engine?.requestInteract()}
            // Don't keep focus, or Space (jump) would press it again.
            onPointerUp={(event) => event.currentTarget.blur()}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-auto flex items-center gap-2 rounded-full border border-line bg-glass/90 px-3.5 py-2 text-sm text-fg shadow-lg backdrop-blur hover:border-lamp/60"
          >
            {touch ? (
              <>
                <span className="font-semibold text-lamp">Tap</span>
                <span>to {focus.prompt}</span>
              </>
            ) : (
              <>
                <span>Press</span>
                <kbd className="rounded border border-lamp/60 bg-raised px-1.5 font-mono text-xs text-lamp">E</kbd>
                <span>to {focus.prompt}</span>
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
