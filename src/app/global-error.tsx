"use client";

import { fontVariables } from "./fonts";
import "./globals.css";

/** Last-resort boundary for errors thrown in the root layout itself. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <main role="alert" className="mx-auto max-w-xl space-y-4 px-4 py-20 sm:px-6">
          <h1 className="font-display text-3xl font-bold tracking-tight">Something went wrong</h1>
          <p className="text-muted">The site could not load. Please try again.</p>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-lavender px-4 py-2 text-sm font-semibold text-ink"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
