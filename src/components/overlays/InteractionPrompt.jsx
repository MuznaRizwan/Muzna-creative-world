"use client";

/**
 * Small "press E" hint shown while the cat is within reach of an object.
 * The engine reports focus changes only, so this re-renders rarely.
 * Opening portfolio content on interaction comes in a later phase.
 *
 * @param {{ target: import("@/lib/three/Engine").Interactable | null }} props
 */
export function InteractionPrompt({ target }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-[max(1.25rem,env(safe-area-inset-bottom))]"
    >
      {target && (
        <p className="flex items-center gap-2 rounded-full border border-line bg-glass/85 px-3 py-1.5 text-sm text-fg shadow-lg backdrop-blur">
          <kbd className="rounded border border-lamp/60 bg-raised px-1.5 font-mono text-xs text-lamp">E</kbd>
          {target.label}
        </p>
      )}
    </div>
  );
}
