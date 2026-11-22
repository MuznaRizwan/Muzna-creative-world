import { Lead, Placeholder } from "./shared";

const FIELD = "w-full rounded-lg border border-line bg-raised/60 px-3 py-2 text-sm text-fg placeholder:text-muted disabled:opacity-60";

/**
 * Contact Station: the contact form's layout. Sending (email via Resend) is a
 * later phase, so the fields are disabled.
 */
export function ContactSection() {
  return (
    <div className="space-y-5">
      <Lead>Leave a message for Muzna in the post box.</Lead>
      <Placeholder>The contact form isn&apos;t connected yet. Sending messages will be added in a later version.</Placeholder>
      <form className="space-y-3" onSubmit={(event) => event.preventDefault()}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-xs text-muted">
            <span>Name</span>
            <input disabled className={FIELD} autoComplete="name" />
          </label>
          <label className="space-y-1 text-xs text-muted">
            <span>Email</span>
            <input disabled type="email" className={FIELD} autoComplete="email" />
          </label>
        </div>
        <label className="block space-y-1 text-xs text-muted">
          <span>Message</span>
          <textarea disabled rows={4} className={FIELD} />
        </label>
        <button type="submit" disabled className="rounded-lg bg-lavender px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40">
          Send message
        </button>
      </form>
    </div>
  );
}
