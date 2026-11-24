/**
 * Turns the approved portfolio data (src/data/portfolioData.js) into the
 * chatbot's knowledge chunks: short, self-contained texts that are embedded
 * and stored in Supabase. Each chunk keeps related facts together (one per
 * project, one for education, one per skill area, ...).
 *
 * The function is pure: the same data always gives the same chunks with the
 * same ids, so the ingest script can skip chunks whose text hasn't changed.
 *
 * Wording rule: state only what the data says, and say plainly when something
 * is not listed (a team member's individual share, dates, responsibilities).
 * The assistant answers from these texts, so a gap written here as "not
 * listed" becomes an honest "that isn't in the portfolio" in its answers.
 *
 * No path aliases here: the ingest script imports this file directly in Node.
 */

/**
 * Projects whose details are not confirmed yet. They are indexed only as
 * "listed, details not available", so the assistant never repeats unverified
 * text. Remove an id once its entry in portfolioData.js has been confirmed.
 */
export const UNCONFIRMED_PROJECT_IDS = Object.freeze(["moral-triage"]);

/**
 * @typedef {object} KnowledgeChunk
 * @property {string} id         Stable source id, e.g. "project:monster-runner".
 * @property {string} category   profile | education | experience | achievements | contact | skills | projects
 * @property {string} docType    What kind of record it is (project, skill-category, project-index, ...).
 * @property {string} title      Human-readable title (also shown as a source under answers).
 * @property {string} section    Portfolio panel where this information appears.
 * @property {string} content    The text that is embedded and given to the model.
 * @property {Record<string, string | boolean>} metadata  Extra identifiers (project id, record key, ...).
 */

/**
 * @typedef {object} PortfolioSource
 * @property {import("@/types/portfolio").ProfileData} profileData
 * @property {import("@/types/portfolio").ContactData} contactData
 * @property {import("@/types/portfolio").EducationItem[]} educationData
 * @property {import("@/types/portfolio").ExperienceItem[]} experienceData
 * @property {import("@/types/portfolio").AchievementItem[]} achievementsData
 * @property {string[]} certificationsData
 * @property {import("@/types/portfolio").LanguageItem[]} languagesData
 * @property {import("@/types/portfolio").SkillCategory[]} skillsCategories
 * @property {import("@/types/portfolio").ProjectCategoryInfo[]} projectCategories
 * @property {import("@/types/portfolio").Project[]} projectsData
 */

const NAME_FALLBACK = "Muzna";

/** Join the non-empty lines. @param {(string | false | null | undefined)[]} lines */
const text = (lines) => lines.filter((line) => typeof line === "string" && line.length > 0).join("\n");

/** "a", "a and b", "a, b and c" @param {string[]} items */
function list(items) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** Make sure a sentence ends with a full stop. @param {string} value */
const sentence = (value) => (/[.!?]$/.test(value.trim()) ? value.trim() : `${value.trim()}.`);

/**
 * @param {import("@/types/portfolio").Project} project
 * @param {string} name
 */
function teamLines(project, name) {
  const isTeam = Boolean(project.team || (project.contributors && project.contributors.length > 0));
  if (isTeam) {
    const who = [project.team ? `team "${project.team}"` : null, project.contributors?.length ? `contributors ${list(project.contributors)}` : null]
      .filter(Boolean)
      .join(", with ");
    return [
      `Team project: made with ${who}. Features listed for this project belong to the whole team, not to ${name} personally.`,
      project.contribution
        ? `${name}'s own contribution, as listed: ${sentence(project.contribution)}`
        : `${name}'s individual contribution is not listed in the portfolio.`,
    ];
  }
  if (project.category === "art" || project.category === "design") return [`Shown in the portfolio as ${name}'s own creative work.`];
  if (project.source === "This repository") return [`This is ${name}'s own portfolio website.`];
  return [`The portfolio does not say whether this was a solo or team project, or what ${name}'s specific role was.`];
}

/**
 * @param {import("@/types/portfolio").Project} project
 * @param {string} categoryLabel
 * @param {string} name
 * @returns {KnowledgeChunk}
 */
function projectChunk(project, categoryLabel, name) {
  return {
    id: `project:${project.id}`,
    category: "projects",
    docType: "project",
    title: project.title,
    section: "projects",
    metadata: { projectId: project.id, projectCategory: project.category, featured: project.featured },
    content: text([
      `Project: ${project.title}`,
      `Category: ${categoryLabel}`,
      `Summary: ${sentence(project.summary)}`,
      project.context && `Context: ${project.context}.`,
      project.date ? `Date: ${project.date}.` : "Date: not listed.",
      ...teamLines(project, name),
      project.details?.length ? `Details:\n${project.details.map((detail) => `- ${sentence(detail)}`).join("\n")}` : null,
      project.technologies.length ? `Technologies and tools listed: ${list(project.technologies)}.` : "Technologies: not listed.",
      project.note && `Note: ${sentence(project.note)}`,
      project.links?.length && `Links: ${project.links.map((link) => `${link.label}: ${link.url}`).join("; ")}.`,
      project.featured && "It is one of the featured projects in the portfolio.",
    ]),
  };
}

/**
 * @param {import("@/types/portfolio").Project} project
 * @param {string} categoryLabel
 * @returns {KnowledgeChunk}
 */
function unconfirmedProjectChunk(project, categoryLabel) {
  return {
    id: `project:${project.id}`,
    category: "projects",
    docType: "project-unconfirmed",
    title: project.title,
    section: "projects",
    metadata: { projectId: project.id, projectCategory: project.category, confirmed: false },
    content: text([
      `Project: ${project.title}`,
      `Category: ${categoryLabel}`,
      `${project.title} is listed in the portfolio as a ${categoryLabel.toLowerCase()} project, but its description, features, technologies, dates and Muzna's role are still being confirmed.`,
      `Verified details about ${project.title} are not available yet.`,
    ]),
  };
}

/**
 * Build every knowledge chunk from the portfolio data.
 * @param {PortfolioSource} data
 * @returns {KnowledgeChunk[]}
 */
export function buildKnowledgeChunks(data) {
  const { profileData: profile, contactData: contact } = data;
  const name = profile.name || NAME_FALLBACK;
  const first = name.split(" ")[0] || NAME_FALLBACK;
  const unconfirmed = new Set(UNCONFIRMED_PROJECT_IDS);
  const categoryLabel = Object.fromEntries(data.projectCategories.map((category) => [category.id, category.label]));
  const confirmedProjects = data.projectsData.filter((project) => !unconfirmed.has(project.id));

  /** @type {KnowledgeChunk[]} */
  const chunks = [];

  // ---------------------------------------------------------------- profile
  chunks.push({
    id: "profile:overview",
    category: "profile",
    docType: "profile",
    title: `About ${name}`,
    section: "about",
    metadata: { record: "profileData" },
    content: text([
      `Who is ${name}?`,
      `Name: ${name}`,
      `Headline: ${profile.headline}`,
      `Location: ${profile.location}`,
      `Current studies: ${profile.studies}. She is still an undergraduate and has not graduated yet.`,
      `Profile summary:\n${profile.summary.map((line) => `- ${sentence(line)}`).join("\n")}`,
      `Creative interests: ${list(profile.creativeInterests)}.`,
    ]),
  });

  // ---------------------------------------------------------------- education
  chunks.push({
    id: "education:all",
    category: "education",
    docType: "education",
    title: "Education",
    section: "education",
    metadata: { record: "educationData" },
    content: text([
      `${name}'s education`,
      ...data.educationData.map((item) => {
        const inProgress = /progress/i.test(item.status ?? "");
        return `- ${item.institution}: ${item.qualification}${item.specialization ? `, specialisation in ${item.specialization}` : ""}. ${
          item.dates ? `Dates: ${item.dates}.` : "Dates: not listed."
        }${item.status ? ` Status: ${item.status}.` : ""}${inProgress ? " She is currently studying for this degree and has not graduated yet." : ""}`;
      }),
      "Grades, coursework and other academic details are not listed in the portfolio.",
    ]),
  });

  // ---------------------------------------------------------------- experience
  const projectTitle = Object.fromEntries(data.projectsData.map((project) => [project.id, project.title]));
  chunks.push({
    id: "experience:all",
    category: "experience",
    docType: "experience",
    title: "Experience, internships and training",
    section: "education",
    metadata: { record: "experienceData" },
    content: text([
      `${name}'s experience, internships and training`,
      `These are all the experience entries listed in the portfolio:`,
      ...data.experienceData.map((item) =>
        text([
          `- ${item.organization}: ${item.role}, ${item.dates}${item.location ? `, ${item.location}` : ""}.`,
          item.description ? `  ${sentence(item.description)}` : `  No description of her responsibilities is listed.`,
          item.relatedProjectId && projectTitle[item.relatedProjectId] ? `  Related project: ${projectTitle[item.relatedProjectId]}.` : null,
        ])
      ),
      "No other jobs, internships or employers are listed in the portfolio.",
    ]),
  });

  // ---------------------------------------------------------------- achievements, certifications, languages
  chunks.push({
    id: "achievements:all",
    category: "achievements",
    docType: "achievements",
    title: "Achievements, certifications and languages",
    section: "education",
    metadata: { record: "achievementsData+certificationsData+languagesData" },
    content: text([
      `${name}'s achievements, certifications and languages`,
      `Achievements and awards:\n${data.achievementsData.map((item) => `- ${item.title} (${item.organization}). Date not listed.`).join("\n")}`,
      `Certifications: ${list(data.certificationsData)}. Issuers and dates are not listed.`,
      `Languages: ${data.languagesData.map((item) => `${item.language} (${item.level.toLowerCase()})`).join(", ")}.`,
      "No other awards, competitions, certifications or qualifications are listed in the portfolio.",
    ]),
  });

  // ---------------------------------------------------------------- contact
  chunks.push({
    id: "contact:all",
    category: "contact",
    docType: "contact",
    title: "Contact",
    section: "contact",
    metadata: { record: "contactData" },
    content: text([
      `How to contact ${name}`,
      `Email: ${contact.email}`,
      ...contact.links.map((link) => `${link.label}: ${link.url}`),
      "Visitors can also find these details at the Contact Station on the island. Its message form is not connected yet.",
    ]),
  });

  // ---------------------------------------------------------------- skills
  /** technology (lower case) -> project titles that list it */
  const projectsByTech = new Map();
  for (const project of confirmedProjects) {
    for (const tech of project.technologies) {
      const key = tech.toLowerCase();
      if (!projectsByTech.has(key)) projectsByTech.set(key, { label: tech, titles: [] });
      projectsByTech.get(key).titles.push(project.title);
    }
  }

  for (const category of data.skillsCategories) {
    const evidence = category.skills
      .map((skill) => {
        const match = projectsByTech.get(skill.toLowerCase());
        return match ? `- ${skill}: listed for ${list(match.titles)}.` : null;
      })
      .filter(Boolean);
    chunks.push({
      id: `skills:${category.key}`,
      category: "skills",
      docType: "skill-category",
      title: `Skills: ${category.title}`,
      section: "skills",
      metadata: { skillCategory: category.key },
      content: text([
        `${name}'s skills: ${category.title}`,
        `Tools and technologies listed under ${category.title}: ${list(category.skills)}.`,
        evidence.length ? `Projects in the portfolio that list these tools:\n${evidence.join("\n")}` : null,
        evidence.length ? "For team projects the tools were used by the team; the portfolio does not always say which ones she used herself." : null,
        "The portfolio lists tools, not proficiency levels or years of experience.",
      ]),
    });
  }

  chunks.push({
    id: "skills:overview",
    category: "skills",
    docType: "skills-overview",
    title: "Skills overview",
    section: "skills",
    metadata: { record: "skillsCategories" },
    content: text([
      `Overview of ${name}'s technical and creative skills`,
      ...data.skillsCategories.map((category) => `- ${category.title}: ${list(category.skills)}.`),
      "The portfolio lists tools, not proficiency levels or years of experience.",
    ]),
  });

  // ---------------------------------------------------------------- projects
  for (const project of data.projectsData) {
    const label = categoryLabel[project.category] ?? project.category;
    chunks.push(unconfirmed.has(project.id) ? unconfirmedProjectChunk(project, label) : projectChunk(project, label, first));
  }

  chunks.push({
    id: "projects:by-category",
    category: "projects",
    docType: "project-index",
    title: "All projects by category",
    section: "projects",
    metadata: { index: "category" },
    content: text([
      `All of ${name}'s projects in the portfolio, by category (team projects are marked)`,
      ...data.projectCategories.map((category) => {
        const titles = data.projectsData
          .filter((project) => project.category === category.id)
          .map((project) =>
            unconfirmed.has(project.id)
              ? `${project.title} (details being confirmed)`
              : `${project.title}${project.team || project.contributors?.length ? " (team project)" : ""}`
          );
        return titles.length ? `- ${category.label}: ${list(titles)}.` : null;
      }),
    ]),
  });

  chunks.push({
    id: "projects:by-technology",
    category: "projects",
    docType: "project-index",
    title: "Projects by technology",
    section: "projects",
    metadata: { index: "technology" },
    content: text([
      `Which of ${name}'s projects use which technologies and tools`,
      ...[...projectsByTech.values()]
        .sort((a, b) => b.titles.length - a.titles.length || a.label.localeCompare(b.label))
        .map((entry) => `- ${entry.label}: ${list(entry.titles)}.`),
      `For team projects, a listed tool was used by the team; it does not show which tools ${first} used herself.`,
    ]),
  });

  return chunks;
}
