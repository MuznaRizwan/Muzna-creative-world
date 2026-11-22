import { Send } from "lucide-react";

import { Lead, Placeholder } from "./shared";

/**
 * AI Station: where the portfolio assistant will live. The chat backend
 * (retrieval over the portfolio, an LLM) is a later phase, so the input is
 * shown but disabled.
 */
export function AssistantSection() {
  return (
    <div className="space-y-5">
      <Lead>Ask questions about Muzna&apos;s projects, skills and studies, and get answers drawn from this portfolio.</Lead>
      <Placeholder>The assistant isn&apos;t connected yet. It will answer here in a later version.</Placeholder>
      <form className="flex gap-2" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="assistant-question" className="sr-only">
          Your question
        </label>
        <input
          id="assistant-question"
          disabled
          placeholder="Ask a question…"
          className="min-w-0 flex-1 rounded-lg border border-line bg-raised/60 px-3 py-2 text-sm text-fg placeholder:text-muted disabled:opacity-60"
        />
        <button type="submit" disabled className="rounded-lg bg-lavender px-3 text-ink disabled:opacity-40" aria-label="Send">
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
