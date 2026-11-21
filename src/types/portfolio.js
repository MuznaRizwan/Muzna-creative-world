/**
 * JSDoc type definitions for portfolio content. This module has no runtime
 * exports; reference the types with `import("@/types/portfolio").Project`.
 */

/** @typedef {"game" | "3d" | "web" | "motion"} ProjectCategory */

/**
 * @typedef {object} Project
 * @property {string} id
 * @property {string} title
 * @property {string} tagline
 * @property {ProjectCategory} category
 * @property {string} categoryLabel
 * @property {string} description
 * @property {string} longDescription
 * @property {string[]} technologies
 * @property {string[]} keyFeatures
 * @property {string} role
 * @property {string} previewGradient
 * @property {string} [aspectRatio]
 * @property {string} [githubUrl]
 * @property {string} [demoUrl]
 * @property {boolean} featured
 */

/** @typedef {"programming" | "gameDev" | "modeling3D" | "graphicDesign" | "videoMotion" | "uiUx"} SkillCategoryKey */

/**
 * @typedef {object} SkillItem
 * @property {string} name
 * @property {string} [description]
 * @property {boolean} [highlight]
 */

/**
 * @typedef {object} SkillCategory
 * @property {SkillCategoryKey} key
 * @property {string} title
 * @property {string} subtitle
 * @property {"lavender" | "blue" | "pink"} accent
 * @property {SkillItem[]} skills
 */

/**
 * @typedef {object} EducationItem
 * @property {string} institution
 * @property {string} degree
 * @property {string} specialization
 * @property {string} timeline
 * @property {string} status
 * @property {string} location
 * @property {string} description
 * @property {string[]} relevantCoursework
 */

/**
 * @typedef {object} ExperienceItem
 * @property {string} role
 * @property {string} organization
 * @property {"Academic" | "Creative" | "Technical" | "Internship"} type
 * @property {string} timeline
 * @property {string} description
 * @property {string[]} responsibilities
 * @property {string[]} [technologies]
 */

/**
 * @typedef {object} ProfileData
 * @property {string} name
 * @property {string} title
 * @property {string} specialization
 * @property {string} institution
 * @property {string[]} bio
 * @property {string} tagline
 * @property {string} contactEmail
 * @property {{ github?: string, linkedin?: string, artstation?: string, itch?: string }} socials
 */

export {};
