/**
 * JSDoc type definitions for portfolio content. This module has no runtime
 * exports; reference the types with `import("@/types/portfolio").Project`.
 *
 * Content rule: only fill a field when the supplied sources (LinkedIn profile,
 * LinkedIn projects, muzna.zubairy.world, this repository) support it.
 * Optional fields are left out rather than guessed.
 */

/** @typedef {"game" | "web3d" | "software" | "art" | "design"} ProjectCategory */

/**
 * @typedef {object} ProjectCategoryInfo
 * @property {ProjectCategory} id
 * @property {string} label
 * @property {string} accent  Hex colour for chips and image fallbacks.
 */

/**
 * @typedef {object} ProjectImage
 * @property {string} src   Public URL (under /images/projects/).
 * @property {string} alt   What the image actually shows.
 */

/**
 * @typedef {object} ProjectLink
 * @property {string} label
 * @property {string} url
 */

/**
 * @typedef {object} Project
 * @property {string} id
 * @property {string} title
 * @property {ProjectCategory} category
 * @property {string} summary          One or two sentences for cards.
 * @property {string[]} [details]      Bullet points from the source description.
 * @property {string} [contribution]   Muzna's own part, as stated on muzna.zubairy.world (team projects).
 * @property {string[]} technologies   Verified technologies only (may be empty).
 * @property {ProjectImage} [image]
 * @property {string} [date]           Only when supplied.
 * @property {string[]} [contributors] Collaborators named in the source (makes it a team project).
 * @property {string} [team]           Team name, when supplied (e.g. "Team Unpaid").
 * @property {string} [context]        Event or organisation the project belongs to.
 * @property {string} [note]           Important caveat shown with the details (e.g. not a medical tool).
 * @property {ProjectLink[]} [links]   Only real, publicly reachable links.
 * @property {boolean} featured
 * @property {"LinkedIn" | "muzna.zubairy.world" | "This repository"} source
 */

/**
 * @typedef {object} SkillCategory
 * @property {string} key
 * @property {string} title
 * @property {string} accent   Hex colour.
 * @property {string[]} skills
 */

/**
 * @typedef {object} EducationItem
 * @property {string} institution
 * @property {string} qualification
 * @property {string} [specialization]
 * @property {string} [dates]
 * @property {string} [status]
 */

/**
 * @typedef {object} ExperienceItem
 * @property {string} organization
 * @property {string} role
 * @property {string} dates
 * @property {string} [location]
 * @property {string} [description]
 * @property {string} [relatedProjectId]
 */

/**
 * @typedef {object} AchievementItem
 * @property {string} title
 * @property {string} organization
 */

/**
 * @typedef {object} LanguageItem
 * @property {string} language
 * @property {string} level
 */

/**
 * @typedef {object} ProfileData
 * @property {string} name
 * @property {string} headline
 * @property {string} location
 * @property {string} studies         Current degree, phrased as in progress.
 * @property {string[]} summary
 * @property {string[]} creativeInterests
 */

/**
 * @typedef {object} ContactData
 * @property {string} email
 * @property {boolean} emailProvisional  Shown, but the form stays off until it is confirmed.
 * @property {ProjectLink[]} links
 */

export {};
