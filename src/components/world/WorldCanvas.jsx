"use client";

import { useEffect, useRef, useState } from "react";

import { DevPanel } from "./DevPanel";
import { WorldError, WorldLoading } from "./WorldStatus";

/**
 * Client-only mount for the Three.js engine. The engine module is imported
 * inside the effect, so Three.js never runs on the server and is split into
 * its own chunk. Safe under React Strict Mode: the first mount's engine is
 * fully disposed before the second one is created.
 *
 * @param {{ fallback: import("react").ReactNode }} props  Shown when WebGL is unavailable.
 */
export function WorldCanvas({ fallback }) {
  const containerRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const [status, setStatus] = useState(/** @type {"loading" | "ready" | "unsupported" | "error"} */ ("loading"));
  const [progress, setProgress] = useState(0);
  const [engine, setEngine] = useState(/** @type {import("@/lib/three/Engine").Engine | null} */ (null));
  const [errorMessage, setErrorMessage] = useState("");

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
      if (process.env.NODE_ENV === "development" && /** @type {any} */ (window).__creativeWorld === instance) {
        delete (/** @type {any} */ (window).__creativeWorld);
      }
    };
  }, []);

  if (status === "unsupported") return <>{fallback}</>;

  return (
    <div className="fixed inset-0 overflow-hidden bg-ink">
      <div ref={containerRef} className="absolute inset-0" />
      {status === "loading" && <WorldLoading progress={progress} />}
      {status === "error" && <WorldError message={errorMessage} />}
      {status === "ready" && engine && <DevPanel engine={engine} />}
    </div>
  );
}
