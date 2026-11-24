# Contact Station email

Visitors write to Muzna from the Contact Station panel without opening their own
email app. The form sends to a server route, which checks everything again and
emails Muzna through [Resend](https://resend.com/docs).

> **Status (2026-11-24):** delivery verified locally. A real message sent from the
> Contact Station (production build, `onboarding@resend.dev`, Resend account
> registered to the recipient) arrived at `zubairy4605986@cloud.neduet.edu.pk`.
> Production (Vercel) delivery is not switched on yet: the Resend variables are
> added there only when Muzna decides to go live (step 6).

## How it works

```text
Contact Station form (ContactForm.jsx)
   1. checks each field as the visitor goes (same rules as the server)
   2. POST /api/contact  { name, email, subject, message, website, elapsedMs, submissionId }

/api/contact (server only)
   1. at most 20 requests per visitor per 10 minutes
   2. JSON only, at most 16 KB; malformed bodies are refused
   3. validate again: required fields, email format, length limits;
      line breaks and control characters removed from one-line fields
   4. spam: hidden "website" field filled, or sent < 3 s after opening →
      answers like a success, sends nothing
   5. at most 3 messages per visitor per 10 minutes and 10 per day
   6. sending is off unless RESEND_API_KEY, CONTACT_EMAIL and RESEND_FROM_EMAIL are all set
   7. duplicates: Resend idempotency key (holds for 24 h, across all servers),
      plus a 10-minute memory of recent sends on this server
   8. Resend: to CONTACT_EMAIL, from RESEND_FROM_EMAIL, reply-to the visitor
   9. { ok: true }, or a safe error the form can show
```

The email has a plain-text part and an HTML part with the sender's name, email,
subject, message and the time (Karachi time and UTC). **Every visitor value is
HTML-escaped**, so nothing a visitor types can become markup. Replying to the email
answers the visitor, because their address is the reply-to, never the sender.

| File | Role |
|---|---|
| `src/components/portfolio/sections/ContactForm.jsx` | The form: fields, inline errors, loading, success and error states, honeypot. |
| `src/components/portfolio/sections/ContactSection.jsx` | The Contact Station panel: email, links, form. |
| `src/lib/contact/validation.js` | Field rules shared by the form and the route. |
| `src/lib/contact/emailTemplate.js` | The email Muzna receives (escaped HTML + text). |
| `src/lib/email/resend.js` | Reads the settings and sends through Resend's REST API with `fetch` (server only). The `resend` SDK isn't used: it would bundle React Email and Prettier for templates this project doesn't need. |
| `src/app/api/contact/route.js` | The route: limits, validation, spam checks, sending, errors. |
| `src/constants/contact.js` | Limits and the visitor-facing messages. |

## Settings

| Variable | Example | |
|---|---|---|
| `RESEND_API_KEY` | `re_…` | Secret. Server only. |
| `CONTACT_EMAIL` | `zubairy4605986@cloud.neduet.edu.pk` | The only recipient. Visitors can't change it. |
| `RESEND_FROM_EMAIL` | `Muzna's Creative World <onboarding@resend.dev>` | A sender Resend accepts. |

None of these has a `NEXT_PUBLIC_` prefix, so none reaches the browser.

`RESEND_BASE_URL` exists only for local tests against a fake Resend server; leave it unset everywhere else.

## Setup

### 1. Create the Resend account

Sign up at [resend.com](https://resend.com) **with the address that should receive
the messages** (the `CONTACT_EMAIL` address), and confirm it from the email Resend
sends.

Why: until a domain is verified, Resend only sends from `onboarding@resend.dev`,
and that sender **only delivers to the address the Resend account was created
with**. Using the recipient's own address for the account makes this work without
a domain.

### 2. Sender

- **Now (no domain):** `RESEND_FROM_EMAIL=Muzna's Creative World <onboarding@resend.dev>`
- **Later (better delivery, any recipient):** in Resend open **Domains → Add Domain**,
  add the DNS records it shows (SPF and DKIM) at your domain provider, wait for
  "Verified", then use an address on that domain, e.g.
  `Muzna's Creative World <contact@yourdomain>`.

### 3. API key

Resend → **API Keys → Create API Key**, permission **Sending access**. Copy it once;
Resend won't show it again.

### 4. Local settings

Add to `.env.local` (git-ignored). Don't paste the key anywhere else.

```bash
RESEND_API_KEY=re_...
CONTACT_EMAIL=zubairy4605986@cloud.neduet.edu.pk
RESEND_FROM_EMAIL=Muzna's Creative World <onboarding@resend.dev>
```

Restart `npm run dev` after changing `.env.local`.

### 5. Test delivery

1. Open the Contact Station (menu → Contact Station), fill in all four fields, wait a
   few seconds and press **Send Message**.
2. The form should show the success message.
3. Check the inbox, **and the Junk folder** (university Microsoft 365 mailboxes
   sometimes file mail from `resend.dev` there). If it's in Junk, mark it
   "Not junk".
4. In Resend → **Emails**, the message should show as *Delivered*.
5. Press **Reply** in your mail app: it should address the visitor's email.

The form only shows that Resend **accepted** the message. Delivery is confirmed
only by the email arriving.

### 6. Vercel (only after step 5 worked)

Project → **Settings → Environment Variables** → add `RESEND_API_KEY`,
`CONTACT_EMAIL` and `RESEND_FROM_EMAIL` for **Production** (and Preview if
wanted), then redeploy. Then send one test message from the live site.

## Limits and what they don't cover

- **Rate limits and the duplicate memory live in server memory.** On Vercel each
  instance keeps its own counts, and they reset when an instance restarts, so they
  slow down bursts from one visitor but aren't an exact global quota. The
  **Resend idempotency key** is the duplicate protection that holds across instances
  (for 24 hours). Resend's own plan limits are the outer cap.
- **Spam:** the honeypot and the 3-second check stop simple bots, not determined ones.
  If spam gets through, the next step would be a CAPTCHA such as Cloudflare
  Turnstile (free); it isn't added without approval.
- No database: messages are not stored; Resend's dashboard keeps its own log.

## Troubleshooting

Server logs never contain message text, names or addresses; they name the kind of
problem only.

| Log line | Meaning |
|---|---|
| `[contact] not configured: …` | One of the three variables is missing. |
| `[contact] Resend refused the message: validation_error (403)` | Usually `onboarding@resend.dev` sending to an address that isn't the Resend account's own, or an unverified domain in `RESEND_FROM_EMAIL`. |
| `[contact] Resend refused the message: validation_error (401)` / `missing_api_key (401)` | Wrong or revoked API key. |
| `[contact] Resend refused the message: rate_limit_exceeded (429)` | Resend's sending limit. |
| `[contact] Resend refused the message: network_error (no response)` / `timeout (no response)` | Resend couldn't be reached, or didn't answer within 15 seconds. |
| `[contact] spam check: honeypot` / `too fast` | A submission was treated as spam and not sent. |
