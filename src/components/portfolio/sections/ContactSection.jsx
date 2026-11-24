import { Mail } from "lucide-react";

import { contactData } from "@/data/portfolioData";

import { ContactForm } from "./ContactForm";
import { Block, Lead, LinkButton } from "./shared";

/**
 * Contact Station: Muzna's email and profiles, and the contact form, which
 * emails her through /api/contact (Resend).
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

      <Block title="Send a message">
        <ContactForm />
      </Block>
    </div>
  );
}
