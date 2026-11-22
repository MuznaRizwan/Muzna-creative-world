"use client";

import { useEffect, useState } from "react";

import { ZONES } from "@/data/worldLayout";
import { useStore } from "@/hooks/useStore";

import { useWorld } from "./WorldContext";

/**
 * Temporary developer controls: send the cat to each location, switch between
 * the follow camera and a free overview camera, and toggle the debug overlay.
 * Keyboard: 1–8 locations, 0 overview, C follow the cat, V inspect the cat
 * close up, G debug overlay.
 * (Movement keys are handled by the engine.) Replaced by the real navigation
 * and HUD in later phases.
 *
 * @param {{ engine: import("@/lib/three/Engine").Engine }} props
 */
export function DevPanel({ engine }) {
  const { state } = useWorld();
  const mode = useStore(state, (s) => s.mode);
  const [debug, setDebug] = useState(false);
  const [stats, setStats] = useState(() => engine.getStats());
  // Rendered only after the engine is ready (client-side), so window is available.
  const [open, setOpen] = useState(() => window.matchMedia("(min-width: 768px)").matches);

  useEffect(() => {
    const id = window.setInterval(() => setStats(engine.getStats()), 1000);
    return () => window.clearInterval(id);
  }, [engine]);

  useEffect(() => {
    /** @param {KeyboardEvent} event */
    const onKey = (event) => {
      const target = /** @type {HTMLElement | null} */ (event.target);
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      // Shortcuts are off while a portfolio panel is open.
      if (state.getState().panel) return;
      if (event.key === "0") engine.showOverview();
      else if (/^[1-8]$/.test(event.key)) engine.focusLocation(ZONES[Number(event.key) - 1].id);
      else if (event.key.toLowerCase() === "c") engine.showCatView();
      else if (event.key.toLowerCase() === "v") engine.inspectCat();
      else if (event.key.toLowerCase() === "g") {
        setDebug((value) => {
          engine.setDebug(!value);
          return !value;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [engine, state]);

  const toggleDebug = () => {
    engine.setDebug(!debug);
    setDebug(!debug);
  };

  const hasCat = Boolean(engine.player);
  const following = mode === "follow";
  const button =
    "flex items-center gap-1.5 rounded-md border border-line bg-raised/70 px-2 py-1 text-left text-[11px] text-fg hover:bg-line";

  return (
    <>
      <div className="pointer-events-none absolute left-0 top-0 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <h1 className="font-display text-base font-bold tracking-tight drop-shadow">Muzna&apos;s Creative World</h1>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-fg/80">
          Preview · {following ? "follow camera" : "dev camera"}
        </p>
      </div>

      <details
        open={open}
        // Clicking a control leaves it focused, and Space (jump) would then
        // press it again. Pointer clicks give focus back to the page.
        onPointerUp={() => {
          const active = document.activeElement;
          if (active instanceof HTMLElement && active !== document.body) active.blur();
        }}
        onToggle={(event) => setOpen(event.currentTarget.open)}
        className="absolute bottom-0 left-0 m-3 mb-[max(0.75rem,env(safe-area-inset-bottom))] w-[min(18rem,calc(100%-1.5rem))] rounded-lg border border-line bg-glass/85 backdrop-blur"
      >
        <summary className="cursor-pointer select-none px-3 py-2 font-mono text-[11px] text-muted">
          Dev · {stats.fps} fps · {stats.drawCalls} draws · {(stats.triangles / 1000).toFixed(0)}k tris
        </summary>
        <nav aria-label="Development navigation" className="grid grid-cols-2 gap-1 px-2 pb-2">
          <button type="button" className={button} onClick={() => engine.showOverview()} aria-pressed={!following}>
            <span className="font-mono text-lamp">0</span> Overview
          </button>
          <button type="button" className={button} onClick={() => engine.showCatView()} aria-pressed={following}>
            <span className="font-mono text-lamp">C</span> {hasCat ? "Follow cat" : "Cat view"}
          </button>
          {hasCat && (
            <button type="button" className={`${button} col-span-2`} onClick={() => engine.inspectCat()}>
              <span className="font-mono text-lamp">V</span> Inspect cat (orbit close-up)
            </button>
          )}
          {ZONES.map((zone, i) => (
            <button key={zone.id} type="button" className={button} onClick={() => engine.focusLocation(zone.id)}>
              <span className="font-mono text-lamp">{i + 1}</span>
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: zone.accent }} aria-hidden="true" />
              <span className="truncate">{zone.name}</span>
            </button>
          ))}
          <button type="button" className={`${button} col-span-2`} onClick={toggleDebug} aria-pressed={debug}>
            <span className="font-mono text-lamp">G</span> Colliders &amp; cat scale: {debug ? "on" : "off"}
          </button>
          {hasCat ? (
            <p className="col-span-2 px-1 pt-1 font-mono text-[10px] leading-relaxed text-muted">
              {following
                ? "W/S or ↑/↓ move · A/D or ←/→ turn · Shift run · Space jump · E interact · R reset · 1–8 send the cat to a location"
                : "Free camera: drag to orbit · right-drag to pan · scroll to zoom · C to follow the cat again"}
            </p>
          ) : (
            <p className="col-span-2 px-1 pt-1 font-mono text-[10px] text-muted">
              Cat unavailable{engine.catError ? `: ${engine.catError}` : ""}. Drag to orbit · right-drag to pan · scroll to zoom
            </p>
          )}
        </nav>
      </details>
    </>
  );
}
