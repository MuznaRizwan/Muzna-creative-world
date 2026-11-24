"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useWorld } from "@/components/world/WorldContext";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { useStore } from "@/hooks/useStore";

/** Joystick geometry, in CSS pixels. */
const BASE = 128;
const KNOB = 56;
const REACH = (BASE - KNOB) / 2; // how far the knob can travel from the centre
const DEAD_ZONE = 0.15;
const RUN_AT = 0.92; // pushed to the edge (forwards) = run

const STILL = Object.freeze({ move: 0, turn: 0, run: false });

/**
 * On-screen controls for touch screens: a thumb joystick (bottom left) that
 * walks and turns the cat like W/A/S/D (push to the edge to run), and a jump
 * button (bottom right). Interacting is the "Tap to …" prompt. Shown only
 * with a coarse pointer, in the follow camera, while no panel is open; the
 * keyboard keeps working alongside.
 */
export function TouchControls() {
  const { state, engine } = useWorld();
  const touch = useCoarsePointer();
  const mode = useStore(state, (s) => s.mode);
  const catReady = useStore(state, (s) => s.catReady);
  const panelOpen = useStore(state, (s) => s.panel !== null);
  if (!engine || !touch || !catReady || mode !== "follow" || panelOpen) return null;
  // Mounted fresh each time the controls appear, so no drag state carries over.
  return <TouchPad engine={engine} />;
}

/** @param {{ engine: import("@/lib/three/Engine").Engine }} props */
function TouchPad({ engine }) {
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const pointerId = useRef(/** @type {number | null} */ (null));
  const baseRef = useRef(/** @type {HTMLDivElement | null} */ (null));

  // Hidden mid-drag (a panel opened, the camera changed): let go of the stick.
  useEffect(() => () => engine.setTouchStick(STILL), [engine]);

  /** @param {import("react").PointerEvent<HTMLDivElement>} event */
  const moveTo = (event) => {
    const box = baseRef.current?.getBoundingClientRect();
    if (!box) return;
    let dx = event.clientX - (box.left + box.width / 2);
    let dy = event.clientY - (box.top + box.height / 2);
    const distance = Math.hypot(dx, dy);
    if (distance > REACH) {
      dx = (dx / distance) * REACH;
      dy = (dy / distance) * REACH;
    }
    setKnob({ x: dx, y: dy });
    if (Math.min(1, distance / REACH) < DEAD_ZONE) {
      engine.setTouchStick(STILL);
      return;
    }
    const move = -dy / REACH; // up = forwards
    const turn = -dx / REACH; // left = turn left (like A)
    engine.setTouchStick({ move, turn, run: distance / REACH >= RUN_AT && move > 0.5 });
  };

  const release = () => {
    pointerId.current = null;
    setActive(false);
    setKnob({ x: 0, y: 0 });
    engine.setTouchStick(STILL);
  };

  /** @param {import("react").PointerEvent<HTMLDivElement>} event */
  const ifOurs = (event) => event.pointerId === pointerId.current;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <div
        ref={baseRef}
        role="application"
        aria-label="Movement joystick: drag up to walk, to the sides to turn, to the top edge to run"
        className="pointer-events-auto relative touch-none select-none rounded-full border border-line/80 bg-glass/55 backdrop-blur-sm"
        style={{ width: BASE, height: BASE, WebkitTouchCallout: "none" }}
        onContextMenu={(event) => event.preventDefault()}
        onPointerDown={(event) => {
          if (pointerId.current !== null) return;
          pointerId.current = event.pointerId;
          event.currentTarget.setPointerCapture(event.pointerId);
          setActive(true);
          moveTo(event);
        }}
        onPointerMove={(event) => {
          if (ifOurs(event)) moveTo(event);
        }}
        onPointerUp={(event) => {
          if (ifOurs(event)) release();
        }}
        onPointerCancel={(event) => {
          if (ifOurs(event)) release();
        }}
        onLostPointerCapture={(event) => {
          if (ifOurs(event)) release();
        }}
      >
        <span
          aria-hidden="true"
          className={`absolute rounded-full border shadow-lg transition-colors ${
            active ? "border-lavender bg-lavender/70" : "border-lavender/50 bg-lavender/35"
          }`}
          style={{ width: KNOB, height: KNOB, left: (BASE - KNOB) / 2 + knob.x, top: (BASE - KNOB) / 2 + knob.y }}
        />
      </div>

      <button
        type="button"
        aria-label="Jump"
        className="pointer-events-auto flex h-16 w-16 touch-none select-none items-center justify-center rounded-full border border-line/80 bg-glass/60 text-fg shadow-lg backdrop-blur-sm active:border-lavender active:bg-lavender/40"
        onContextMenu={(event) => event.preventDefault()}
        onPointerDown={(event) => {
          event.preventDefault(); // no focus, no delayed click
          engine.requestJump();
        }}
      >
        <ArrowUp className="h-6 w-6" aria-hidden="true" />
      </button>
    </div>
  );
}
