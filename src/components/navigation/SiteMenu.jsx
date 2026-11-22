"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useWorld } from "@/components/world/WorldContext";
import { SECTIONS } from "@/data/portfolioSections";
import { ZONE_BY_ID } from "@/data/worldLayout";

/**
 * Conventional navigation: every portfolio section is one click away, so
 * nobody has to find the objects in the world to read the portfolio. Opening a
 * section here shows the same panel the world objects open.
 */
export function SiteMenu() {
  const { state } = useWorld();
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const buttonRef = useRef(/** @type {HTMLButtonElement | null} */ (null));

  useEffect(() => {
    if (!open) return undefined;
    /** @param {KeyboardEvent} event */
    const onKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  /** @param {import("@/data/portfolioSections").SectionId} id */
  const choose = (id) => {
    setOpen(false);
    state.openPanel(id);
  };

  return (
    <nav aria-label="Portfolio" className="absolute right-0 top-0 z-20 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen((value) => !value)}
        onPointerUp={(event) => event.currentTarget.blur()}
        className="ml-auto flex items-center gap-2 rounded-lg border border-line bg-glass/85 px-3 py-2 text-sm font-medium text-fg backdrop-blur hover:bg-raised"
      >
        {open ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
        Menu
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            id="site-menu"
            initial={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
            transition={{ duration: 0.16 }}
            className="mt-2 w-[min(17rem,calc(100vw-1.5rem))] space-y-0.5 rounded-xl border border-line bg-glass/95 p-1.5 shadow-xl backdrop-blur"
          >
            {SECTIONS.map((section) => {
              const zone = ZONE_BY_ID[section.zoneId];
              return (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => choose(section.id)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-raised"
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: zone?.accent }} aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block text-sm text-fg">{section.title}</span>
                      <span className="block truncate text-[11px] text-muted">{zone?.name}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </nav>
  );
}
