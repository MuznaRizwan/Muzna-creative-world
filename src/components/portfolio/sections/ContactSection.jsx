import { Mail } from "lucide-react";

import { contactData } from "@/data/portfolioData";

import { Block, Lead, LinkButton, Placeholder } from "./shared";

const FIELD = "w-full rounded-lg border border-line bg-raised/60 px-3 py-2 text-sm text-fg placeholder:text-muted disabled:opacity-60";

/**
 * Contact Station: Muzna's email and profiles, and the contact form's layout.
 * Sending (email via Resend) is a later phase, so the fields are disabled.
 */
export function ContactSection() {
  return (
    <div className="space-y-6">
      <Lead>Leave a message for Muzna in the post box, or reach her directly.</Lead>

      <Block title="Email">
        <a
          href={`mailto:${contactData.email}`}
          className="flex items-center gap-2 break-all rounded-xl border border-line bg-raised/50 px-3.5 py-3 text-sm text-fg hover:border-lamp/60 hover:text-lamp"
        >
          <Mail className="h-4 w-4 shrink-0 text-lamp" aria-hidden="true" />
          {contactData.email}
        </a>
      </Block>

      <Block title="Elsewhere">
        <div className="flex flex-wrap gap-2">
          {contactData.links.map((link) => (
            <LinkButton key={link.url} href={link.url}>
              {link.label}
            </LinkButton>
          ))}
        </div>
      </Block>

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
