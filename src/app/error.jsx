"use client";

import { useEffect } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";

/**
 * @param {{ error: Error & { digest?: string }, reset: () => void }} props
 */
export default function RouteError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageShell>
      <section role="alert" className="max-w-xl space-y-4">
        <h1 className="font-display text-3xl font-bold tracking-tight">Something went wrong</h1>
        <p className="text-muted">
          This page failed to load. Try again, and if the problem continues, reload the site.
        </p>
        <Button onClick={reset}>Try again</Button>
      </section>
    </PageShell>
  );
}
