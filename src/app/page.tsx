import { PageShell } from "@/components/layout/PageShell";
import { SITE } from "@/lib/constants";

/** Temporary placeholder until the 3D world is mounted here (Phase 4+). */
export default function HomePage() {
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
      </section>
    </PageShell>
  );
}
