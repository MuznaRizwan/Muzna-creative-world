/**
 * The email Muzna receives for a Contact Station message: a plain-text part
 * and a simple HTML part. Every visitor value is escaped before it goes into
 * the HTML, so nothing a visitor types can become markup or a script.
 */

/** @param {string} value */
export function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** @param {Date} date */
function karachiTime(date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

/**
 * @param {import("./validation").ContactValues} values  Validated and normalised.
 * @param {Date} [sentAt]
 * @returns {{ subject: string, text: string, html: string }}
 */
export function buildContactEmail(values, sentAt = new Date()) {
  const { name, email, subject, message } = values;
  const local = `${karachiTime(sentAt)} (Karachi time)`;
  const utc = sentAt.toISOString();

  const text = [
    "New message from the Contact Station on Muzna's Creative World.",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${subject}`,
    `Sent: ${local}, ${utc}`,
    "",
    "Message:",
    message,
    "",
    "Reply to this email to answer the sender directly.",
  ].join("\n");

  const row = (/** @type {string} */ label, /** @type {string} */ html) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#6b6280;font-size:13px;vertical-align:top;white-space:nowrap">${label}</td><td style="padding:6px 0;color:#1d1830;font-size:14px">${html}</td></tr>`;

  const html = `<!doctype html>
<html lang="en">
<body style="margin:0;padding:24px;background:#f4f1fa;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e4def0;overflow:hidden">
    <div style="padding:18px 24px;background:#211b33;color:#f3eefc">
      <p style="margin:0;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#c9b6f5">Contact Station</p>
      <h1 style="margin:6px 0 0;font-size:18px;font-weight:bold">${escapeHtml(subject)}</h1>
    </div>
    <div style="padding:20px 24px">
      <table role="presentation" style="border-collapse:collapse;width:100%">
        ${row("Name", escapeHtml(name))}
        ${row("Email", `<a href="mailto:${escapeHtml(email)}" style="color:#7c4dcc">${escapeHtml(email)}</a>`)}
        ${row("Subject", escapeHtml(subject))}
        ${row("Sent", `${escapeHtml(local)}<br><span style="color:#6b6280;font-size:12px">${escapeHtml(utc)}</span>`)}
      </table>
      <div style="margin-top:16px;padding:16px;border-radius:8px;background:#f8f6fc;border-left:3px solid #c084fc;color:#1d1830;font-size:14px;line-height:1.6;white-space:pre-wrap">${escapeHtml(message)}</div>
      <p style="margin:18px 0 0;color:#6b6280;font-size:12px">Reply to this email to answer the sender directly. Sent from the contact form on Muzna's Creative World.</p>
    </div>
  </div>
</body>
</html>`;

  return { subject: `[Portfolio] ${subject}`, text, html };
}
