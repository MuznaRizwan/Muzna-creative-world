"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { CONTACT_LIMITS, CONTACT_MESSAGES } from "@/constants/contact";
import { contactData } from "@/data/portfolioData";
import { CONTACT_FIELDS, fieldError, multiLine, singleLine } from "@/lib/contact/validation";
import { createStore } from "@/lib/state/createStore";

/** @typedef {import("@/lib/contact/validation").ContactField} ContactField */
/** @typedef {import("@/lib/contact/validation").ContactValues} ContactValues */

/** @type {ContactValues} */
const EMPTY = { name: "", email: "", subject: "", message: "" };

/**
 * The unsent draft, kept in memory for the page's lifetime so closing the
 * panel (Esc, the close button) doesn't throw a half-written message away.
 * Cleared after a successful send; never stored in the browser.
 */
const draftStore = createStore(EMPTY);

const LINKEDIN = contactData.links.find((link) => link.label === "LinkedIn")?.url;

const FIELD =
  "w-full rounded-lg border bg-raised/60 px-3 py-2 text-sm text-fg placeholder:text-muted/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender/40 disabled:opacity-60";

/** A random id for one filled-in form (duplicate protection on the server). */
function newSubmissionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/** @param {ContactField} field @param {string} value */
const clean = (field, value) => (field === "message" ? multiLine(value) : singleLine(value));

/** The failure text, with "LinkedIn" as a link. @param {{ text: string }} props */
function WithLinkedIn({ text }) {
  if (!LINKEDIN || !text.includes("LinkedIn")) return text;
  const [before, after] = text.split("LinkedIn");
  return (
    <>
      {before}
      <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className="font-medium text-lamp underline underline-offset-2">
        LinkedIn
      </a>
      {after}
    </>
  );
}

/**
 * The Contact Station form. Checks fields as the visitor goes, sends them to
 * /api/contact (which checks again and emails Muzna through Resend), and
 * keeps the text if sending fails.
 */
export function ContactForm() {
  const id = useId();
  const reduceMotion = useReducedMotion();
  const [values, setValues] = useState(() => draftStore.getState());
  const [touched, setTouched] = useState(/** @type {Partial<Record<ContactField, boolean>>} */ ({}));
  const [serverErrors, setServerErrors] = useState(/** @type {Partial<Record<ContactField, string>>} */ ({}));
  const [status, setStatus] = useState(/** @type {"idle" | "sending" | "success" | "error"} */ ("idle"));
  const [notice, setNotice] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const sending = useRef(false);
  const submissionId = useRef("");
  const openedAt = useRef(0);
  const inputs = useRef(/** @type {Partial<Record<ContactField, HTMLInputElement | HTMLTextAreaElement | null>>} */ ({}));

  useEffect(() => {
    submissionId.current = newSubmissionId();
    openedAt.current = Date.now();
  }, []);

  /** @param {ContactField} field */
  const errorFor = (field) => serverErrors[field] || (touched[field] ? fieldError(field, clean(field, values[field])) : "");

  /** @param {ContactField} field @param {string} value */
  const update = (field, value) => {
    const next = { ...values, [field]: value };
    draftStore.setState(next);
    setValues(next);
    setServerErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
    if (status === "success" || status === "error") setStatus("idle");
  };

  /** @param {import("react").FormEvent<HTMLFormElement>} event */
  const onSubmit = async (event) => {
    event.preventDefault();
    if (sending.current) return; // no double sends while one is on its way

    setTouched({ name: true, email: true, subject: true, message: true });
    const firstInvalid = CONTACT_FIELDS.find((field) => fieldError(field, clean(field, values[field])));
    if (firstInvalid) {
      inputs.current[firstInvalid]?.focus();
      return;
    }

    sending.current = true;
    setStatus("sending");
    setNotice("");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONTACT_LIMITS.timeoutMs);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...values,
          website: honeypot,
          elapsedMs: Date.now() - openedAt.current,
          submissionId: submissionId.current,
        }),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => null);

      if (response.ok && data?.ok) {
        setStatus("success");
        setNotice(CONTACT_MESSAGES.success);
        draftStore.setState(EMPTY);
        setValues(EMPTY);
        setTouched({});
        setServerErrors({});
        submissionId.current = newSubmissionId();
        openedAt.current = Date.now();
        return;
      }
      if (response.status === 400 && data?.fieldErrors) {
        setServerErrors(data.fieldErrors);
        const field = CONTACT_FIELDS.find((name) => data.fieldErrors[name]);
        if (field) inputs.current[field]?.focus();
        setStatus("idle");
        return;
      }
      setStatus("error");
      setNotice(response.status === 429 ? CONTACT_MESSAGES.tooMany : CONTACT_MESSAGES.error);
    } catch {
      setStatus("error");
      setNotice(controller.signal.aborted ? CONTACT_MESSAGES.timeout : CONTACT_MESSAGES.offline);
    } finally {
      clearTimeout(timer);
      sending.current = false;
    }
  };

  const isSending = status === "sending";
  const messageLength = clean("message", values.message).length;
  const remaining = CONTACT_LIMITS.message - messageLength;

  /**
   * @param {ContactField} field
   * @param {{ label: string, type?: string, autoComplete?: string, placeholder?: string, maxLength?: number, multiline?: boolean }} options
   */
  const renderField = (field, { label, type = "text", autoComplete, placeholder, maxLength, multiline }) => {
    const error = errorFor(field);
    const inputId = `${id}-${field}`;
    const errorId = `${inputId}-error`;
    const shared = {
      id: inputId,
      name: field,
      value: values[field],
      placeholder,
      disabled: isSending,
      "aria-invalid": Boolean(error),
      "aria-describedby": error ? errorId : undefined,
      "aria-required": true,
      onBlur: () => setTouched((current) => ({ ...current, [field]: true })),
      className: `${FIELD} ${error ? "border-rose/70 focus:border-rose" : "border-line focus:border-lavender/70"}`,
    };
    return (
      <div className="space-y-1">
        <label htmlFor={inputId} className="text-xs font-medium text-muted">
          {label}
        </label>
        {multiline ? (
          <textarea
            {...shared}
            ref={(node) => {
              inputs.current[field] = node;
            }}
            rows={6}
            onChange={(event) => update(field, event.target.value)}
            className={`${shared.className} min-h-32 resize-y`}
          />
        ) : (
          <input
            {...shared}
            ref={(node) => {
              inputs.current[field] = node;
            }}
            type={type}
            autoComplete={autoComplete}
            maxLength={maxLength}
            onChange={(event) => update(field, event.target.value)}
          />
        )}
        {error && (
          <p id={errorId} className="text-xs text-rose">
            {error}
          </p>
        )}
      </div>
    );
  };

  const feedbackMotion = reduceMotion ? {} : { initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, transition: { duration: 0.2 } };

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-3" aria-busy={isSending}>
      <div className="grid gap-3 sm:grid-cols-2">
        {renderField("name", { label: "Name", autoComplete: "name", placeholder: "Your name", maxLength: CONTACT_LIMITS.name })}
        {renderField("email", { label: "Email", type: "email", autoComplete: "email", placeholder: "you@example.com", maxLength: CONTACT_LIMITS.email })}
      </div>
      {renderField("subject", { label: "Subject", placeholder: "What's it about?", maxLength: CONTACT_LIMITS.subject })}
      {renderField("message", { label: "Message", placeholder: "Write your message…", multiline: true })}

      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
      <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input
          id={`${id}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button
          type="submit"
          disabled={isSending}
          className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-lavender to-rose px-4 py-2 text-sm font-semibold text-ink transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:opacity-60"
        >
          {isSending ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink/30 border-t-ink motion-reduce:animate-none" aria-hidden="true" />
              Sending…
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" aria-hidden="true" /> Send Message
            </>
          )}
        </button>
        <span className={`text-[11px] ${remaining < 0 ? "text-rose" : "text-muted"}`} aria-live="polite">
          {remaining < 0
            ? `${(-remaining).toLocaleString("en-US")} characters over the limit`
            : remaining <= 500
              ? `${remaining.toLocaleString("en-US")} characters left`
              : ""}
        </span>
      </div>

      <div aria-live="polite">
        <AnimatePresence mode="wait">
          {status === "success" && (
            <motion.p
              key="success"
              role="status"
              className="flex items-start gap-2 rounded-xl border border-lavender/45 bg-lavender/10 px-3.5 py-3 text-sm text-fg"
              {...feedbackMotion}
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-lavender" aria-hidden="true" />
              {notice}
            </motion.p>
          )}
          {status === "error" && (
            <motion.p
              key="error"
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-rose/40 bg-rose/10 px-3.5 py-3 text-sm text-fg"
              {...feedbackMotion}
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose" aria-hidden="true" />
              <span>
                <WithLinkedIn text={notice} />
              </span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
