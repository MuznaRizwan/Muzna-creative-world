import { CONTACT_LIMITS } from "@/constants/contact";

/**
 * Contact form rules, used by the form (for instant feedback) and by
 * /api/contact (which never trusts the browser). Pure functions only.
 */

/** @typedef {"name" | "email" | "subject" | "message"} ContactField */
/** @typedef {Record<ContactField, string>} ContactValues */
/** @typedef {Partial<Record<ContactField, string>>} ContactErrors */

/** @type {readonly ContactField[]} */
export const CONTACT_FIELDS = Object.freeze(["name", "email", "subject", "message"]);

/**
 * A practical address check: a local part without spaces or angle brackets,
 * then a domain with at least one dot and a letters-only ending.
 */
const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:"]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

/**
 * One-line fields (name, email, subject): control characters, including line
 * breaks, become spaces, so a value can never add an email header.
 * @param {unknown} value
 */
export function singleLine(value) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]+/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * The message keeps its line breaks and tabs but loses other control characters.
 * @param {unknown} value
 */
export function multiLine(value) {
  if (typeof value !== "string") return "";
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

/**
 * Take exactly the four fields from untrusted input and clean them.
 * @param {Record<string, unknown>} input
 * @returns {ContactValues}
 */
export function normaliseContact(input) {
  return {
    name: singleLine(input?.name),
    email: singleLine(input?.email),
    subject: singleLine(input?.subject),
    message: multiLine(input?.message),
  };
}

/** @param {number} n */
const count = (n) => n.toLocaleString("en-US");

/**
 * Check one field. Returns the message to show, or "" when it's fine.
 * @param {ContactField} field
 * @param {string} value  Already normalised.
 */
export function fieldError(field, value) {
  switch (field) {
    case "name":
      if (!value) return "Please enter your name.";
      if (value.length > CONTACT_LIMITS.name) return `Please keep your name under ${count(CONTACT_LIMITS.name)} characters.`;
      return "";
    case "email":
      if (!value) return "Please enter your email address.";
      if (value.length > CONTACT_LIMITS.email || !EMAIL_PATTERN.test(value)) {
        return "Please enter a valid email address, like name@example.com.";
      }
      return "";
    case "subject":
      if (!value) return "Please add a subject.";
      if (value.length > CONTACT_LIMITS.subject) return `Please keep the subject under ${count(CONTACT_LIMITS.subject)} characters.`;
      return "";
    case "message":
      if (!value) return "Please write a message.";
      if (value.length > CONTACT_LIMITS.message) {
        const over = value.length - CONTACT_LIMITS.message;
        return `Your message is ${count(over)} ${over === 1 ? "character" : "characters"} over the ${count(CONTACT_LIMITS.message)}-character limit.`;
      }
      return "";
    default:
      return "";
  }
}

/**
 * @param {Record<string, unknown>} input  Raw form values or a request body.
 * @returns {{ ok: true, values: ContactValues } | { ok: false, values: ContactValues, errors: ContactErrors }}
 */
export function validateContact(input) {
  const values = normaliseContact(input);
  /** @type {ContactErrors} */
  const errors = {};
  for (const field of CONTACT_FIELDS) {
    const message = fieldError(field, values[field]);
    if (message) errors[field] = message;
  }
  return Object.keys(errors).length ? { ok: false, values, errors } : { ok: true, values };
}
