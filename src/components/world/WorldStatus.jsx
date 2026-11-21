"use client";

/**
 * Temporary loading indicator (the designed loading screen comes later).
 * @param {{ progress: number }} props
 */
export function WorldLoading({ progress }) {
  const percent = Math.round(progress * 100);
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-ink px-4">
      <div role="status" aria-live="polite" className="w-full max-w-xs space-y-3 text-center">
        <p className="font-display text-lg font-bold">Building the world…</p>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-raised"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label="Loading progress"
        >
          <div className="h-full rounded-full bg-lamp transition-[width] duration-200" style={{ width: `${percent}%` }} />
        </div>
        <p className="font-mono text-xs text-muted">{percent}%</p>
      </div>
    </div>
  );
}

/**
 * Shown when the engine fails after WebGL was detected (e.g. lost context).
 * @param {{ message: string }} props
 */
export function WorldError({ message }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-ink px-4">
      <div role="alert" className="max-w-sm space-y-4 text-center">
        <p className="font-display text-xl font-bold">The 3D view stopped</p>
        <p className="text-sm text-muted">{message} Reload the page to try again.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-lavender px-4 py-2 text-sm font-semibold text-ink"
        >
          Reload
        </button>
      </div>
    </div>
  );
}
