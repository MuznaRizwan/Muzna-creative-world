import { PageShell } from "@/components/layout/PageShell";
import { SITE } from "@/constants/site";

/**
 * Shown instead of the 3D world when the browser has no WebGL.
 * Keeps the original placeholder content until the classic portfolio exists.
 */
export function WorldFallback() {
  return (
    <PageShell>
      <section aria-labelledby="home-title" className="max-w-2xl space-y-5">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-lamp">Under construction</p>
        <h1 id="home-title" className="font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          {SITE.name}
        </h1>
        <p className="text-lg leading-relaxed text-muted">
          An interactive 3D portfolio by {SITE.owner}. The explorable world is being built; this
          page is a temporary placeholder.
        </p>
        <p className="text-sm text-muted">
          The 3D world needs WebGL, which this browser does not provide.
        </p>
      </section>
    </PageShell>
  );
}
