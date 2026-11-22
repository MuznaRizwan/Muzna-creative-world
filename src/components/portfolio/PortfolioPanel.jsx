"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MapPin, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { useWorld } from "@/components/world/WorldContext";
import { INTERACTABLES } from "@/data/interactables";
import { SECTION_BY_ID } from "@/data/portfolioSections";
import { ZONE_BY_ID } from "@/data/worldLayout";
import { useStore } from "@/hooks/useStore";

import { SECTION_VIEWS } from "./sections";

/**
 * The one reusable portfolio panel. It shows whichever section the world
 * state says is open: a side drawer on wide screens, a bottom sheet on phones.
 * Close with the button, Escape, or a click on the dimmed world. While it is
 * open the engine locks the cat (it reads the same state), and the cat stays
 * exactly where it was.
 */
export function PortfolioPanel() {
  const { state, engine } = useWorld();
  const panel = useStore(state, (s) => s.panel);
  const reduceMotion = useReducedMotion();
  const dialogRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const closeRef = useRef(/** @type {HTMLButtonElement | null} */ (null));

  const section = panel ? SECTION_BY_ID[panel.section] : null;
  const View = panel ? SECTION_VIEWS[panel.section] : null;
  const source = panel?.sourceId ? INTERACTABLES[panel.sourceId] : null;
  const zone = section ? ZONE_BY_ID[section.zoneId] : null;
  const isOpen = Boolean(panel && section && View);

  // Escape closes; Tab stays inside the dialog; focus moves in on open.
  useEffect(() => {
    if (!isOpen) return undefined;
    closeRef.current?.focus({ preventScroll: true });
    /** @param {KeyboardEvent} event */
    const onKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        state.closePanel();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = /** @type {HTMLElement[]} */ ([
        ...dialogRef.current.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), video, [tabindex]:not([tabindex="-1"])'),
      ]);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      // Hand the keyboard back to the world (the cat listens on the window).
      const active = document.activeElement;
      if (active instanceof HTMLElement) active.blur();
    };
  }, [isOpen, state]);

  /** Close the panel and send the cat to this section's location. */
  const visit = () => {
    if (!section) return;
    state.closePanel();
    engine?.focusLocation(section.zoneId);
  };

  const slide = reduceMotion ? {} : { x: 24 };

  return (
    <AnimatePresence>
      {isOpen && section && View && panel && (
        <motion.div
          key="panel-layer"
          className="absolute inset-0 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Dimmed world: click to close. */}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className="absolute inset-0 h-full w-full cursor-default bg-ink/45"
            onClick={() => state.closePanel()}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="portfolio-panel-title"
            initial={{ opacity: 0, ...slide }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, ...slide }}
            transition={{ duration: reduceMotion ? 0.15 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-2xl border border-line bg-glass/95 shadow-2xl backdrop-blur-md md:inset-y-3 md:left-auto md:right-3 md:max-h-none md:w-[min(30rem,calc(100%-1.5rem))] md:rounded-2xl"
          >
            <header className="flex items-start gap-3 border-b border-line px-5 pb-4 pt-5">
              <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: zone?.accent }} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{zone?.name}</p>
                <h2 id="portfolio-panel-title" className="font-display text-2xl font-bold tracking-tight text-fg">
                  {section.title}
                </h2>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => state.closePanel()}
                className="rounded-lg border border-line p-2 text-muted hover:bg-raised hover:text-fg"
                aria-label="Close panel (Escape)"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <View key={`${panel.section}:${panel.sourceId ?? "menu"}:${panel.params.projectId ?? ""}`} params={panel.params} />
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-5 py-3 text-xs text-muted">
              <span>{source ? `Opened at: ${source.name}` : "Opened from the menu"}</span>
              <span className="flex items-center gap-2">
                {!source && engine?.player && (
                  <button type="button" onClick={visit} className="flex items-center gap-1 rounded-md px-2 py-1 text-fg hover:bg-raised">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> Go to {zone?.name}
                  </button>
                )}
                <span className="hidden sm:inline">
                  <kbd className="rounded border border-line px-1 font-mono">Esc</kbd> to close
                </span>
              </span>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
