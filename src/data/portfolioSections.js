/**
 * The portfolio sections, one per location. Used by the panels, the site menu
 * and the interactable objects that open them. Titles and summaries describe
 * what each section is for; the content itself comes from portfolioData.js.
 */

/** @typedef {"welcome" | "about" | "skills" | "projects" | "education" | "showreel" | "assistant" | "contact"} SectionId */

/**
 * @typedef {object} PortfolioSection
 * @property {SectionId} id
 * @property {string} title
 * @property {string} zoneId   Location in the world where it lives.
 * @property {string} summary  One line shown in the menu.
 */

/** @type {readonly PortfolioSection[]} */
export const SECTIONS = Object.freeze([
  { id: "welcome", title: "Welcome", zoneId: "plaza", summary: "What this world is and how to explore it" },
  { id: "about", title: "About", zoneId: "studio", summary: "Who Muzna is and the creative profile" },
  { id: "skills", title: "Skills", zoneId: "lab", summary: "Skills and technologies" },
  { id: "projects", title: "Projects", zoneId: "gamedev", summary: "Game development and other projects" },
  { id: "education", title: "Education", zoneId: "campus", summary: "Education and achievements" },
  { id: "showreel", title: "Showreel", zoneId: "cinema", summary: "The promotional video" },
  { id: "assistant", title: "Portfolio assistant", zoneId: "ai", summary: "Ask questions about the portfolio" },
  { id: "contact", title: "Contact", zoneId: "contact", summary: "Get in touch" },
]);

/** @type {Readonly<Record<SectionId, PortfolioSection>>} */
export const SECTION_BY_ID = Object.freeze(Object.fromEntries(SECTIONS.map((section) => [section.id, section])));
