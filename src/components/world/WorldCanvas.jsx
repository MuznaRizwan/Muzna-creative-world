"use client";

import { useEffect, useRef, useState } from "react";

import { SiteMenu } from "@/components/navigation/SiteMenu";
import { InteractionPrompt } from "@/components/overlays/InteractionPrompt";
import { PortfolioPanel } from "@/components/portfolio/PortfolioPanel";
import { createWorldState } from "@/lib/state/worldState";

import { DevPanel } from "./DevPanel";
import { WorldContext } from "./WorldContext";
import { WorldError, WorldLoading } from "./WorldStatus";

/**
 * Client-only mount for the Three.js engine. The engine module is imported
 * inside the effect, so Three.js never runs on the server and is split into
 * its own chunk. Safe under React Strict Mode: the first mount's engine is
 * fully disposed before the second one is created.
 *
 * The engine and the HTML overlays (prompt, menu, portfolio panel, dev panel)
 * share one world-state store, provided to the overlays through context.
 *
 * @param {{ fallback: import("react").ReactNode, media: import("@/constants/assets").MediaFlags }} props
 *   `fallback` is shown when WebGL is unavailable; `media` says which optional files exist.
 */
export function WorldCanvas({ fallback, media }) {
  const containerRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  // Read once by the engine (the cinema screen); fixed for the page's lifetime.
  const mediaRef = useRef(media);
  const [status, setStatus] = useState(/** @type {"loading" | "ready" | "unsupported" | "error"} */ ("loading"));
  const [progress, setProgress] = useState(0);
  const [engine, setEngine] = useState(/** @type {import("@/lib/three/Engine").Engine | null} */ (null));
  const [errorMessage, setErrorMessage] = useState("");
  const [state] = useState(createWorldState);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    let cancelled = false;
    /** @type {import("@/lib/three/Engine").Engine | null} */
    let instance = null;

    const fail = (/** @type {unknown} */ error) => {
      if (cancelled) return;
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : "The 3D view failed to start.");
      setStatus("error");
    };

    (async () => {
      try {
        const [{ isWebGLAvailable }, { Engine }] = await Promise.all([
          import("@/lib/three/core/webgl"),
          import("@/lib/three/Engine"),
        ]);
        if (cancelled) return;
        if (!isWebGLAvailable()) {
          setStatus("unsupported");
          return;
        }
        instance = new Engine(container, {
          state,
          media: mediaRef.current,
          onProgress: (ratio) => {
            if (!cancelled) setProgress(ratio);
          },
          onError: fail,
        });
        const ready = await instance.init();
        if (cancelled || !ready) return;
        instance.start();
        setEngine(instance);
        setStatus("ready");
        if (process.env.NODE_ENV === "development") {
          /** @type {any} */ (window).__creativeWorld = instance;
        }
      } catch (error) {
        fail(error);
      }
    })();

    return () => {
      cancelled = true;
      instance?.dispose();
      // A remount starts from a clean slate (no stale focus or open panel).
      state.setState({ focus: null, panel: null, catReady: false });
      if (process.env.NODE_ENV === "development" && /** @type {any} */ (window).__creativeWorld === instance) {
        delete (/** @type {any} */ (window).__creativeWorld);
      }
    };
  }, [state]);

  if (status === "unsupported") return <>{fallback}</>;

  return (
    <div className="fixed inset-0 overflow-hidden bg-ink">
      <div ref={containerRef} className="absolute inset-0" />
      {status === "loading" && <WorldLoading progress={progress} />}
      {status === "error" && <WorldError message={errorMessage} />}
      {status === "ready" && engine && (
        <WorldContext.Provider value={{ state, engine, media }}>
          <DevPanel engine={engine} />
          <InteractionPrompt />
          <SiteMenu />
          <PortfolioPanel />
        </WorldContext.Provider>
      )}
    </div>
  );
}
