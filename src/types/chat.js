/**
 * JSDoc type definitions for the chatbot. This module has no runtime exports;
 * reference the types with `import("@/types/chat").ChatMessage`.
 */

/** @typedef {"user" | "assistant" | "system"} ChatRole */

/**
 * @typedef {object} ChatMessage
 * @property {string} id
 * @property {ChatRole} role
 * @property {string} content
 * @property {Date} createdAt
 * @property {string[]} [sources]
 */

/**
 * @typedef {object} KnowledgeDocument
 * @property {string} id
 * @property {string} title
 * @property {string} content
 * @property {"biography" | "project" | "skill" | "education"} category
 * @property {number[]} [embedding]
 * @property {number} [similarity]
 */

export {};
