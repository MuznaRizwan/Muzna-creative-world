import { CAT_METRICS } from "@/constants/world";

import { projectsData } from "./portfolioData";

/**
 * Interactable objects in the world, by id. This is the only place that says
 * what an object is called, what its prompt says, how close the cat must be,
 * and what using it does. The location builders only place each id in the
 * world (`ctx.interactable({ id, x, y, z })`), next to the prop it belongs to.
 *
 * To add an object: add an entry here, then place its id in the location
 * builder. A new kind of action is registered once with
 * `InteractionSystem.registerAction(kind, handler)`.
 */

/**
 * @typedef {object} InteractionAction
 * @property {"open-panel"} kind
 * @property {import("./portfolioSections").SectionId} section
 * @property {Record<string, string>} [params]
 */

/**
 * @typedef {object} InteractableDefinition
 * @property {string} id
 * @property {string} name     What the object is (shown in the panel's source line).
 * @property {string} zoneId
 * @property {"panel" | "video" | "chat" | "contact"} type  What kind of interface it opens.
 * @property {string} prompt   Completes "Press E to …".
 * @property {number} range    Reach in world units, measured from the interaction point.
 * @property {InteractionAction} action
 */

const DEFAULT_RANGE = CAT_METRICS.interactRadius;

/** @type {InteractableDefinition[]} */
const DEFINITIONS = [
  {
    id: "plaza-kiosk",
    name: "Welcome kiosk",
    zoneId: "plaza",
    type: "panel",
    prompt: "read the welcome",
    range: DEFAULT_RANGE,
    action: { kind: "open-panel", section: "welcome" },
  },
  {
    id: "studio-easel",
    name: "The giant easel",
    zoneId: "studio",
    type: "panel",
    prompt: "explore the Creative Studio",
    range: DEFAULT_RANGE,
    action: { kind: "open-panel", section: "about" },
  },
  {
    id: "lab-kiosk",
    name: "Lab terminal",
    zoneId: "lab",
    type: "panel",
    prompt: "explore the Technology Lab",
    range: DEFAULT_RANGE,
    action: { kind: "open-panel", section: "skills" },
  },
  {
    id: "gamedev-hall",
    name: "Arcade Hall",
    zoneId: "gamedev",
    type: "panel",
    prompt: "browse the projects",
    range: DEFAULT_RANGE,
    action: { kind: "open-panel", section: "projects" },
  },
  // One arcade cabinet (or the featured stage) per project.
  ...projectsData.map((project) => /** @type {InteractableDefinition} */ ({
    id: `gamedev-${project.id}`,
    name: `Arcade cabinet: ${project.title}`,
    zoneId: "gamedev",
    type: "panel",
    prompt: `look at ${project.title}`,
    // Cabinets stand close together, so each one has a shorter reach.
    range: 1.9,
    action: { kind: "open-panel", section: "projects", params: { projectId: project.id } },
  })),
  {
    id: "campus-noticeboard",
    name: "Campus notice board",
    zoneId: "campus",
    type: "panel",
    prompt: "read the notice board",
    range: DEFAULT_RANGE,
    action: { kind: "open-panel", section: "education" },
  },
  {
    id: "cinema-kiosk",
    name: "Cinema ticket kiosk",
    zoneId: "cinema",
    type: "video",
    prompt: "watch the showreel",
    range: DEFAULT_RANGE,
    action: { kind: "open-panel", section: "showreel" },
  },
  {
    id: "ai-desk",
    name: "Question desk",
    zoneId: "ai",
    type: "chat",
    prompt: "ask the portfolio assistant",
    range: DEFAULT_RANGE,
    action: { kind: "open-panel", section: "assistant" },
  },
  {
    id: "contact-postbox",
    name: "Post box",
    zoneId: "contact",
    type: "contact",
    prompt: "get in touch",
    range: DEFAULT_RANGE,
    action: { kind: "open-panel", section: "contact" },
  },
];

/** @type {Readonly<Record<string, InteractableDefinition>>} */
export const INTERACTABLES = Object.freeze(Object.fromEntries(DEFINITIONS.map((definition) => [definition.id, definition])));
