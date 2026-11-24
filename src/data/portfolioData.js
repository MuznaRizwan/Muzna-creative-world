/**
 * All portfolio content, in one place. Panels, the 3D world (arcade cabinets,
 * lab beds, campus timeline) and the site menu read from here.
 *
 * Sources (Phase 7B, 2026-11-23): Muzna's LinkedIn profile (profile/Profile.pdf),
 * her LinkedIn projects (profile/linkedin-projects.md), her website
 * muzna.zubairy.world, and this repository. Nothing here is invented: a field is
 * only filled when a source supports it, and team projects describe the project,
 * not an individual share of the work. Open questions are listed in
 * profile/phase-7b-content-mapping.md.
 */

/** @typedef {import("@/types/portfolio").ProfileData} ProfileData */
/** @typedef {import("@/types/portfolio").ContactData} ContactData */
/** @typedef {import("@/types/portfolio").SkillCategory} SkillCategory */
/** @typedef {import("@/types/portfolio").Project} Project */
/** @typedef {import("@/types/portfolio").ProjectCategoryInfo} ProjectCategoryInfo */
/** @typedef {import("@/types/portfolio").EducationItem} EducationItem */
/** @typedef {import("@/types/portfolio").ExperienceItem} ExperienceItem */
/** @typedef {import("@/types/portfolio").AchievementItem} AchievementItem */
/** @typedef {import("@/types/portfolio").LanguageItem} LanguageItem */

// ---------------------------------------------------------------- profile

/** @type {ProfileData} */
export const profileData = {
  name: "Muzna Zubairy",
  headline: "Game Developer & 3D Animator in Training | Gaming & Animation Undergraduate at NED University | Bringing Virtual Worlds to Life",
  location: "Karachi, Sindh, Pakistan",
  studies: "Bachelor in Computer Science (Gaming and Animation), NED University of Engineering and Technology, 2023–2027 (in progress)",
  summary: [
    "Creative and self-motivated concept artist with interests in character, environment, and prop design.",
    "Experienced with Adobe Creative Suite, Figma, Blender, and VR design tools.",
    "Interested in game development, visual storytelling, and creative collaboration.",
  ],
  creativeInterests: ["Character design", "Environment design", "Prop design", "Game development", "Visual storytelling", "Creative collaboration"],
};

/** @type {ContactData} */
export const contactData = {
  email: "zubairy4605986@cloud.neduet.edu.pk",
  emailProvisional: true,
  links: [
    { label: "Website", url: "https://muzna.zubairy.world" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/muzna-zubairy" },
    { label: "Behance", url: "https://www.behance.net/muznazubairy" },
  ],
};

// ---------------------------------------------------------------- education & experience

/** @type {EducationItem[]} */
export const educationData = [
  {
    institution: "NED University of Engineering and Technology",
    qualification: "Bachelor in Computer Science",
    specialization: "Gaming and Animation",
    dates: "August 2023 – August 2027",
    status: "In progress",
  },
  {
    institution: "Generations School",
    qualification: "A Levels",
  },
];

/** @type {ExperienceItem[]} */
export const experienceData = [
  {
    organization: "MadForFilms",
    role: "Trainee",
    dates: "June 2026",
    location: "Karachi",
    description:
      "Hands-on training in filmmaking fundamentals, camera systems, and visual effects. Applied production techniques to develop and pitch a vertical-format story.",
  },
  {
    organization: "MLabs",
    role: "Participant",
    dates: "July 2024 – August 2024",
    relatedProjectId: "sling-shot",
  },
  {
    organization: "Stratesfy, Inc.",
    role: "Intern",
    dates: "January 2024 – June 2024",
    location: "Karachi",
  },
];

/** @type {AchievementItem[]} */
export const achievementsData = [{ title: "Top 3 Finalist – Best Vertical Film", organization: "Micro Drama Lab" }];

/** Shown after the creative and technical material, as a short secondary list. */
export const certificationsData = ["Certificate of Achievement", "Essential Baking Course", "Instant Baking Course"];

/** @type {LanguageItem[]} */
export const languagesData = [
  { language: "Urdu", level: "Native or bilingual" },
  { language: "English", level: "Professional working" },
];

// ---------------------------------------------------------------- skills

/**
 * Six areas (the Technology Lab has one garden bed per area). Tools only: each
 * one appears in the sources (profile summary, project technologies, this
 * portfolio's own production).
 * @type {SkillCategory[]}
 */
export const skillsCategories = [
  { key: "gameDev", title: "Game Development", accent: "#A97FD8", skills: ["Unity", "C#", "C", "SDL"] },
  { key: "threeD", title: "3D & Animation", accent: "#E07AA0", skills: ["Blender", "Three.js", "Adobe After Effects"] },
  { key: "web", title: "Web Development", accent: "#7F88E0", skills: ["JavaScript", "React", "Next.js", "Vite", "Supabase", "Vercel"] },
  {
    key: "artDesign",
    title: "Art & Design",
    accent: "#E9A93B",
    skills: ["Adobe Creative Suite", "Adobe Photoshop", "Adobe Illustrator", "Figma", "Acrylic painting", "Calligraphy"],
  },
  { key: "film", title: "Video & Motion", accent: "#A83A4B", skills: ["Adobe After Effects", "Filmmaking", "Camera systems", "Visual effects"] },
  {
    key: "software",
    title: "Software & Networking",
    accent: "#5FA39A",
    skills: ["Python", "Cisco Packet Tracer", "OpenFlow", "ONOS", "Ryu", "Mininet"],
  },
];

// ---------------------------------------------------------------- projects

/** @type {ProjectCategoryInfo[]} */
export const projectCategories = [
  { id: "game", label: "Game Development", accent: "#A97FD8" },
  { id: "web3d", label: "3D and Web Development", accent: "#7F88E0" },
  { id: "software", label: "Software and Networking", accent: "#5FA39A" },
  { id: "art", label: "Traditional Art", accent: "#E07AA0" },
  { id: "design", label: "Graphic Design and Motion Work", accent: "#E9A93B" },
];

/** @type {Readonly<Record<string, ProjectCategoryInfo>>} */
export const PROJECT_CATEGORY_BY_ID = Object.freeze(Object.fromEntries(projectCategories.map((c) => [c.id, c])));

const IMG = "/images/projects";

/**
 * Order matters in the 3D world: the first featured project stands on the
 * Arcade Hall stage, and the next three get the arcade cabinets.
 * @type {Project[]}
 */
export const projectsData = [
  // ---------------- featured
  {
    id: "moral-triage",
    title: "Moral Triage",
    category: "game",
    summary:
      "A narrative decision-making game about ethical dilemmas in a crisis: players allocate limited aid under time pressure, and every choice has consequences.",
    details: [
      "Branching narrative with multiple story outcomes.",
      "Resource management with real-time consequences.",
      "UI designed in Figma and built in Unity.",
      "Low-poly environment assets and props modelled in Blender.",
      "Atmospheric audio and tense situational pacing.",
    ],
    technologies: ["Unity", "C#", "Blender", "Figma", "Photoshop"],
    image: {
      src: `${IMG}/moral-triage.jpg`,
      alt: "Moral Triage main menu, a hospital ethics simulator: Play, Shop, Build, Settings and Exit beside a doctor reading a tablet in a hospital corridor",
    },
    featured: true,
    source: "This repository",
  },
  {
    id: "monster-runner",
    title: "Monster Runner",
    category: "game",
    summary: "A 3D endless runner made in Unity by Team Unpaid for GameCon '26 at NED University TechFest '26.",
    details: [
      "Selectable playable monsters.",
      "Dynamic obstacle spawning and coin collection.",
      "AI enemies that chase the player.",
      "Snow, desert, and water environments.",
      "Survival-time scoring and a leaderboard.",
      "Prototype pitched and demonstrated to judges and attendees at GameCon '26.",
    ],
    technologies: ["Unity", "C#"],
    image: { src: `${IMG}/monster-runner.jpg`, alt: "Monster Runner: a green monster running along an icy track through the snow level" },
    date: "October 2026 – Present",
    team: "Team Unpaid",
    context: "GameCon '26, NED University TechFest '26",
    featured: true,
    source: "LinkedIn",
  },
  {
    id: "blockcraft",
    title: "BlockCraft",
    category: "web3d",
    summary: "A browser-based, single-player 3D voxel sandbox where players explore, build, and customise block worlds.",
    details: [
      "3D world and block building with Three.js, React, and Vite.",
      "Supabase authentication and cloud saves, so players can resume their worlds.",
      "Deployed on Vercel.",
    ],
    technologies: ["Three.js", "React", "Vite", "Supabase", "Vercel"],
    image: { src: `${IMG}/blockcraft.jpg`, alt: "BlockCraft dashboard: play time, blocks placed and broken, saved worlds and recent games" },
    context: "NED University",
    featured: true,
    source: "LinkedIn",
  },
  {
    id: "masketeer",
    title: "Masketeer",
    category: "game",
    summary: "A 2D action-puzzle platformer with unique combat mechanics and a vibrant pixel-art style.",
    technologies: ["Unity"],
    image: { src: `${IMG}/masketeer.jpg`, alt: "Masketeer title screen: a pixel-art castle hall with a Play button" },
    featured: true,
    source: "muzna.zubairy.world",
  },
  {
    id: "solar-system",
    title: "3D Interactive Solar System Simulation",
    category: "web3d",
    summary: "An interactive 3D model of the Solar System in the browser, showing planetary rotation, orbits, and meteor movement.",
    details: [
      "Planetary rotation, orbital paths, and meteor movement.",
      "Custom textures, lighting, and emissive glow for the Sun and planets.",
      "Lightweight browser rendering with Three.js and Vite.",
    ],
    technologies: ["Three.js", "Vite"],
    image: { src: `${IMG}/solar-system.jpg`, alt: "Solar System simulation: the Sun and planets on their orbits, with an information panel about Jupiter" },
    context: "NED University",
    featured: true,
    source: "LinkedIn",
  },
  {
    id: "findit",
    title: "FindIt — Campus Lost & Found Platform",
    category: "web3d",
    summary: "A lost-and-found web platform for the NED University campus community.",
    details: [
      "Lost and found reports with a title, description, photo, and last-known campus location.",
      "Duplicate-report detection.",
      "Admin moderation dashboard.",
    ],
    technologies: ["React", "Supabase"],
    image: { src: `${IMG}/findit.jpg`, alt: "FindIt student profile page with personal details blurred, showing a lost-item report" },
    contributors: ["Ifrah", "Mashal", "two other contributors"],
    context: "NED University",
    featured: true,
    source: "LinkedIn",
  },

  // ---------------- game development
  {
    id: "trivia-quiz",
    title: "Trivia Quiz Game",
    category: "game",
    summary: "A console trivia quiz game with subject selection and multiple-choice questions.",
    contribution: "UI/UX design, including the menu, leaderboard, and console interfaces, in Figma.",
    technologies: ["Figma"],
    image: { src: `${IMG}/trivia-quiz.jpg`, alt: "Trivia Quiz console screen: a multiple-choice question with a score bar" },
    date: "September 2025 – November 2025",
    contributors: ["Zainab Kinza", "Areefa"],
    context: "NED University",
    featured: false,
    source: "LinkedIn",
  },
  {
    id: "apollo-and-artimis",
    title: "Apollo and Artimis",
    category: "game",
    summary: "A game built in C with SDL.",
    contribution: "Game mechanics and visual assets.",
    technologies: ["C", "SDL"],
    image: { src: `${IMG}/apollo-and-artimis.jpg`, alt: "Title art reading Artemis & Apollo over a painted background" },
    contributors: ["Mashal", "Zarina"],
    context: "NED University",
    featured: false,
    source: "LinkedIn",
  },
  {
    id: "beaky-bounce",
    title: "Beaky Bounce",
    category: "game",
    summary: "A bird-themed arcade game built in C with SDL.",
    contribution: "Character designs and game art.",
    technologies: ["C", "SDL"],
    image: { src: `${IMG}/beaky-bounce.jpg`, alt: "Beaky Bounce: a pixel-art bird flying between pillars under the game's logo" },
    contributors: ["Aasia", "Naverah"],
    context: "NED University",
    featured: false,
    source: "LinkedIn",
  },
  {
    id: "crimson-bastion",
    title: "Crimson Bastion",
    category: "game",
    summary: "A game built with SDL, with art made in Photoshop.",
    contribution: "Menu systems and level environments with a cohesive visual style.",
    technologies: ["Adobe Photoshop", "SDL"],
    image: { src: `${IMG}/crimson-bastion.jpg`, alt: "Crimson Bastion pixel-art main menu with Start, Credits and Quit buttons" },
    contributors: ["Aasia", "Ifrah"],
    context: "NED University",
    featured: false,
    source: "LinkedIn",
  },
  {
    id: "red-at-war",
    title: "Red at War",
    category: "game",
    summary: "An action game.",
    contribution: "Character concepts and environment art.",
    technologies: ["Adobe Photoshop", "Python"],
    image: { src: `${IMG}/red-at-war.jpg`, alt: "Pixel-art group of green and blue aliens in white lab coats against a purple sky" },
    context: "NED University",
    featured: false,
    source: "LinkedIn",
  },
  {
    id: "sling-shot",
    title: "Sling Shot / Heist the Bags",
    category: "game",
    summary: "A Unity mobile game made at MLabs.",
    contribution: "Game assets and UI elements.",
    technologies: ["Unity", "Adobe Illustrator"],
    image: { src: `${IMG}/sling-shot.jpg`, alt: "Heist the Bags phone gameplay: a level with hanging money bags and a robber" },
    contributors: ["Hadia"],
    context: "MLabs",
    featured: false,
    source: "LinkedIn",
  },
  {
    id: "tiny-triads",
    title: "Tiny Triads",
    category: "game",
    summary: "Three games in one package.",
    contribution: "A puzzle game featuring triad mechanics.",
    technologies: ["Adobe Photoshop", "SDL"],
    image: { src: `${IMG}/tiny-triads.jpg`, alt: "Tiny Triads menu collage with a play button and game tiles" },
    contributors: ["Mashal", "Aasia", "one other contributor"],
    context: "NED University",
    featured: false,
    source: "LinkedIn",
  },

  // ---------------- 3D and web
  {
    id: "creative-world",
    title: "Muzna's Creative World",
    category: "web3d",
    summary: "This portfolio: an explorable 3D island in the browser, visited as a cat. Each location opens a section of the portfolio.",
    details: [
      "3D world rendered with vanilla Three.js inside a Next.js application.",
      "Cat avatar modelled, rigged, and animated in Blender, loaded as GLB files.",
      "Eight locations, each opening a portfolio panel; a menu opens the same panels directly.",
      "Promotional video made in Adobe After Effects, shown in the Cinema.",
    ],
    technologies: ["Next.js", "React", "JavaScript", "Three.js", "Tailwind CSS", "Framer Motion", "Blender", "Adobe After Effects"],
    image: {
      src: `${IMG}/creative-world.jpg`,
      alt: "The cat in its red jacket at Welcome Plaza, framed by the gate pillars, with signposts to the other locations",
    },
    featured: false,
    source: "This repository",
  },

  // ---------------- software and networking
  {
    id: "dermacare",
    title: "DermaCare — Skin & Hair Symptom Triage System",
    category: "software",
    summary: "A Python triage prototype that matches selected skin and hair symptoms to possible conditions and suggests next steps.",
    details: [
      "Rule-based symptom-to-condition matching and ranking.",
      "Urgency flagging for symptoms that need prompt attention.",
      "Next-step guidance after each evaluation.",
      "A knowledge base designed to be extended with more conditions.",
    ],
    technologies: ["Python"],
    image: { src: `${IMG}/dermacare.jpg`, alt: "DermaCare symptom checklist: skin symptoms, hair and nail changes, background and history" },
    contributors: ["Iffat", "Mashal"],
    context: "NED University",
    note: "Educational prototype only: not a medical diagnostic tool and not a replacement for a qualified healthcare practitioner.",
    featured: false,
    source: "LinkedIn",
  },
  {
    id: "enterprise-routing",
    title: "Enterprise Routing & Switching Design",
    category: "software",
    summary: "Enterprise network topologies designed, configured, and tested in Cisco Packet Tracer.",
    details: ["Multi-router and multi-switch topologies.", "Static and dynamic routing.", "VLANs and inter-VLAN routing."],
    technologies: ["Cisco Packet Tracer"],
    context: "NED University",
    featured: false,
    source: "LinkedIn",
  },
  {
    id: "sdn-routing",
    title: "SDN Controller & Shortest-Path Routing",
    category: "software",
    summary: "Software-defined network simulations with shortest-path routing between switches.",
    details: [
      "OpenFlow 1.3 networks with the ONOS and Ryu controllers.",
      "Custom topologies emulated in Mininet and MiniEdit.",
      "Dijkstra shortest-path routing in Python (Ryu), with link-failure handling.",
    ],
    technologies: ["Python", "OpenFlow", "ONOS", "Ryu", "Mininet"],
    image: { src: `${IMG}/sdn-routing.jpg`, alt: "Ryu topology viewer showing three connected switches" },
    context: "NED University",
    featured: false,
    source: "LinkedIn",
  },

  // ---------------- traditional art
  {
    id: "acrylic-painting",
    title: "Acrylic Painting & Visual Art Portfolio",
    category: "art",
    summary: "Original acrylic paintings on canvas: landscapes, portraits, and abstract work.",
    details: ["Layering, blending, texture building, and brushwork.", "Colour harmony, lighting, and perspective in composition."],
    technologies: ["Acrylic on canvas"],
    image: { src: `${IMG}/acrylic-painting.jpg`, alt: "Acrylic painting: silhouetted pine trees against a glowing teal moonlit sky, with two birds" },
    featured: false,
    source: "LinkedIn",
  },
  {
    id: "calligraphy",
    title: "Calligraphy & Hand-Lettering Portfolio",
    category: "art",
    summary: "Original calligraphic pieces in traditional and modern scripts.",
    technologies: ["Calligraphy", "Hand-lettering"],
    image: { src: `${IMG}/calligraphy.jpg`, alt: "Arabic letters written in ink on paper" },
    featured: false,
    source: "LinkedIn",
  },

  // ---------------- graphic design and motion
  {
    id: "youtube-thumbnails",
    title: "YouTube Thumbnail Design",
    category: "design",
    summary: "Thumbnail designs for various YouTube videos.",
    technologies: ["Adobe Photoshop"],
    image: { src: `${IMG}/youtube-thumbnails.jpg`, alt: "A before-and-after style YouTube thumbnail featuring the video's subject" },
    note: "Thumbnail design work: the person in the photograph is the video's subject, not Muzna.",
    featured: false,
    source: "muzna.zubairy.world",
  },
  {
    id: "fish",
    title: "Fish — 2D Character Design",
    category: "design",
    summary: "A simple 2D fish character design.",
    technologies: ["Adobe Illustrator"],
    image: { src: `${IMG}/fish.jpg`, alt: "Three stylised fish characters in orange, teal and dark blue" },
    featured: false,
    source: "muzna.zubairy.world",
  },
  {
    id: "one-more",
    title: "One More — 2D Character Design",
    category: "design",
    summary: "A simple 2D character design.",
    technologies: ["Adobe Illustrator"],
    image: { src: `${IMG}/one-more.jpg`, alt: "Illustrated living room with a sofa and a wall clock showing nine o'clock" },
    featured: false,
    source: "muzna.zubairy.world",
  },
  {
    id: "video-editing",
    title: "Video Editing and Motion Graphics",
    category: "design",
    summary: "Video editing and motion graphics: three YouTube videos and two Canva designs.",
    technologies: [],
    image: { src: `${IMG}/video-editing.jpg`, alt: "Frame from one of the videos: an owl on a pile of stickers" },
    links: [
      { label: "Video 1 (YouTube)", url: "https://www.youtube.com/watch?v=RbK0XpS1v6I" },
      { label: "Video 2 (YouTube)", url: "https://www.youtube.com/watch?v=uklSdIO04cw" },
      { label: "Video 3 (YouTube)", url: "https://www.youtube.com/watch?v=kA64OzM9xc4" },
      { label: "Canva design 1", url: "https://www.canva.com/design/DAHEHECF9HU/cpDvKXRz4sAvNcL2Swgtqw/view" },
      { label: "Canva design 2", url: "https://www.canva.com/design/DAHBjfYKiCs/yCDwe5H4MmcznqmJymhTMw/view" },
    ],
    featured: false,
    source: "muzna.zubairy.world",
  },
];

/** @type {Readonly<Record<string, Project>>} */
export const PROJECT_BY_ID = Object.freeze(Object.fromEntries(projectsData.map((p) => [p.id, p])));
