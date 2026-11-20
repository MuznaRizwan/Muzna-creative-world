import type { Metadata } from "next";
import Link from "next/link";

import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <PageShell>
      <section className="max-w-xl space-y-4">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-lamp">404</p>
        <h1 className="font-display text-3xl font-bold tracking-tight">Page not found</h1>
        <p className="text-muted">This page does not exist.</p>
        <Link href="/" className="text-lavender underline underline-offset-4">
          Back to the homepage
        </Link>
      </section>
    </PageShell>
  );
}
