import {
  ProfileData,
  SkillCategory,
  Project,
  EducationItem,
  ExperienceItem,
} from "@/types/portfolio";

export const profileData: ProfileData = {
  name: "Muzna Rizwan",
  title: "Computer Science Undergraduate",
  specialization: "Gaming and Animation",
  institution: "NED University of Engineering and Technology",
  tagline:
    "Bridging computational systems, 3D digital art, and interactive game design to create immersive digital experiences.",
  bio: [
    "I am a Computer Science undergraduate at NED University of Engineering and Technology, specializing in Gaming and Animation. My academic journey combines algorithmic thinking and software engineering with digital art, 3D modeling, and real-time graphics.",
    "As a student, artist, game developer, and aspiring professional, I focus on crafting interactive environments, expressive character animations, and game systems where technical precision meets creative storytelling.",
    "Whether developing gameplay logic in Unity, sculpting and rigging assets in Blender, or composing motion graphics in After Effects, I am passionate about exploring the intersection of art and code.",
  ],
  contactEmail: "muzna.portfolio@example.com",
  socials: {
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    itch: "https://itch.io",
  },
};

export const skillsCategories: SkillCategory[] = [
  {
    key: "programming",
    title: "Programming & Development",
    subtitle: "Core software engineering and modern web technologies",
    accent: "blue",
    skills: [
      { name: "C++", description: "Systems, algorithms, and performance-critical logic", highlight: true },
      { name: "C#", description: "Unity gameplay programming and object-oriented architecture", highlight: true },
      { name: "Python", description: "Scripting, tooling, and data manipulation" },
      { name: "TypeScript", description: "Type-safe frontend and full-stack development", highlight: true },
      { name: "JavaScript", description: "Modern ES6+ asynchronous web scripting" },
      { name: "Next.js / React", description: "Server-side rendering and interactive component design" },
      { name: "Tailwind CSS", description: "Utility-first responsive layouts and styling" },
      { name: "SQL & Databases", description: "Relational data modeling and queries" },
    ],
  },
  {
    key: "gameDev",
    title: "Game Development",
    subtitle: "Real-time engine mechanics, logic, and interactive systems",
    accent: "lavender",
    skills: [
      { name: "Unity Engine", description: "Scene assembly, 2D/3D development, physics and prefab systems", highlight: true },
      { name: "Gameplay Scripting", description: "Player controls, camera state machines, and inventory systems", highlight: true },
      { name: "Game Physics", description: "Colliders, raycasting, and kinematic simulations" },
      { name: "Level Design", description: "Spatial pacing, player guidance, and environment blockouts" },
      { name: "Game Loop & UI", description: "HUDs, game state managers, and pause menus" },
      { name: "Audio Integration", description: "Sound effect triggers and atmospheric background audio" },
    ],
  },
  {
    key: "modeling3D",
    title: "3D Modeling & Animation",
    subtitle: "Polygon modeling, rigging, texturing, and character motion",
    accent: "pink",
    skills: [
      { name: "Blender", description: "Primary 3D creation suite for modeling, rigging, and animation", highlight: true },
      { name: "Character Rigging", description: "Armature setups, bone constraints, and weight painting", highlight: true },
      { name: "3D Keyframe Animation", description: "Walk cycles, idle poses, and action sequences", highlight: true },
      { name: "Low-Poly & High-Poly", description: "Mesh topology optimized for real-time engines" },
      { name: "UV Unwrapping & Texturing", description: "PBR texture assignment, seam placement, and baking" },
      { name: "Three.js / WebGL", description: "Real-time 3D web asset display via R3F and Drei" },
    ],
  },
  {
    key: "graphicDesign",
    title: "Graphic Design",
    subtitle: "Visual composition, typography, and digital art foundations",
    accent: "lavender",
    skills: [
      { name: "Adobe Photoshop", description: "Texture editing, digital illustration, and post-processing", highlight: true },
      { name: "Adobe Illustrator", description: "Vector illustration, logo design, and iconography", highlight: true },
      { name: "Visual Composition", description: "Balance, negative space, visual hierarchy, and framing" },
      { name: "Color Theory", description: "Palette selection, emotional resonance, and contrast" },
      { name: "Digital Painting", description: "Concept art sketches, moods, and character silhouettes" },
    ],
  },
  {
    key: "videoMotion",
    title: "Video Editing & Motion Graphics",
    subtitle: "Cinematic pacing, kinetic graphics, and visual effects",
    accent: "blue",
    skills: [
      { name: "Adobe After Effects", description: "Motion design, kinetic typography, and promotional video production", highlight: true },
      { name: "Adobe Premiere Pro", description: "Timeline editing, sequence cutting, and multi-track audio sync", highlight: true },
      { name: "Keyframe Dynamics", description: "Graph editor curves, easing, and spatial interpolations" },
      { name: "Visual Transitions", description: "Camera wipes, seamless match cuts, and stylized glitches" },
      { name: "Audio-Visual Timing", description: "Beat matching, sonic emphasis, and mood pacing" },
    ],
  },
  {
    key: "uiUx",
    title: "UI/UX Design",
    subtitle: "Human-centered interfaces for games and web applications",
    accent: "pink",
    skills: [
      { name: "Figma", description: "Wireframing, high-fidelity UI mockups, and interactive prototypes", highlight: true },
      { name: "Game UI & HUD Design", description: "Non-intrusive gameplay telemetry and clean inventory displays" },
      { name: "User Flow Mapping", description: "Intuitive player navigation and interaction pipelines" },
      { name: "Responsive Layouts", description: "Mobile-first, desktop-adaptive design grids" },
      { name: "Accessibility Basics", description: "Contrast compliance, readable typography, and visual clarity" },
    ],
  },
];

export const projectsData: Project[] = [
  {
    id: "moral-triage",
    title: "Moral Triage",
    tagline: "A narrative decision-making game exploring ethical dilemmas under severe crisis constraints.",
    category: "game",
    categoryLabel: "Game Development",
    description:
      "An interactive choice-driven game built to test players' moral reasoning under time-sensitive emergency scenarios. Players are tasked with managing limited resources and allocating critical aid, where every choice incurs realistic consequences.",
    longDescription:
      "Moral Triage is a narrative-driven game project developed to investigate how interactive media can simulate real-world ethical dilemmas. The player assumes the role of an emergency coordinator during a high-stakes crisis, forced to allocate scarce medical and operational resources across conflicting priorities. The project emphasizes atmospheric sound design, branched dialogue trees, and tension-building gameplay loops created in Unity.",
    technologies: ["Unity", "C#", "Blender", "Figma", "Photoshop"],
    keyFeatures: [
      "Branching narrative tree with multiple distinct story outcomes",
      "Dynamic resource management system with real-time consequences",
      "Custom UI system designed in Figma and implemented via Unity UI Toolkit",
      "Original low-poly environment assets and props modeled in Blender",
      "Atmospheric audio triggers and tense situational pacing",
    ],
    role: "Lead Developer & Game Designer — responsible for core mechanics scripting, branching logic, UI implementation, and 3D prop modeling.",
    previewGradient: "from-indigo-900/60 via-purple-900/40 to-neutral-900",
    featured: true,
    githubUrl: "https://github.com",
    demoUrl: "https://itch.io",
  },
  {
    id: "interactive-3d-portfolio",
    title: "Interactive 3D Web Portfolio",
    tagline: "Next-generation personal portfolio featuring real-time Three.js graphics and a custom Blender avatar.",
    category: "web",
    categoryLabel: "3D Web Engineering",
    description:
      "An interactive web platform built with Next.js, React Three Fiber, and Three.js. Showcases real-time 3D rendering of a custom-rigged avatar with responsive orbit controls and editorial design.",
    longDescription:
      "This web portfolio is designed as an architectural showcase combining modern web standards with real-time 3D graphics. Built using Next.js App Router and React Three Fiber, it integrates custom GLB 3D assets, smooth Framer Motion transitions, and a modular component hierarchy ready for vector-based AI retrieval.",
    technologies: ["Next.js", "React Three Fiber", "Three.js", "TypeScript", "Tailwind CSS", "Blender"],
    keyFeatures: [
      "Real-time 3D canvas with dynamic lighting, shadows, and camera controls",
      "Modular GLB asset pipeline optimized for low-latency web streaming",
      "Custom editorial typography and cohesive lavender/blue/pink color palette",
      "Fully responsive single-page navigation with active scroll tracking",
    ],
    role: "Full-Stack Developer & 3D Artist — architected the Next.js foundation, styled the UI, and mounted the R3F canvas.",
    previewGradient: "from-blue-900/60 via-indigo-900/40 to-neutral-900",
    featured: true,
    githubUrl: "https://github.com",
  },
  {
    id: "avatar-modeling-rigging",
    title: "Stylized Character Modeling & Rigging",
    tagline: "Custom 3D avatar designed from concept sketch to complete armature rigging and keyframe animation.",
    category: "3d",
    categoryLabel: "3D Animation",
    description:
      "A complete 3D character pipeline executed in Blender. Includes clean quad topology, armature setup with inverse kinematics (IK), weight painting, and idle animation loops.",
    longDescription:
      "A specialized character art and animation project developed in Blender. The model features clean mesh flow for deformation, custom armatures with IK/FK switching for the limbs, facial bone controllers, and stylized PBR materials. The final asset is exported in GLTF/GLB binary format for real-time web rendering.",
    technologies: ["Blender", "PBR Texturing", "Weight Painting", "glTF / GLB", "Rigging"],
    keyFeatures: [
      "Optimized polygon count suitable for real-time web and mobile rendering",
      "Custom skeleton hierarchy with IK constraints for fluid limb movement",
      "Hand-tuned weight painting to eliminate mesh pinching at joints",
      "Modular textures with metallic, roughness, and normal map support",
    ],
    role: "3D Modeler & Animator — designed concept silhouettes, modeled mesh, rigged armature, and animated cycles.",
    previewGradient: "from-purple-900/60 via-pink-900/40 to-neutral-900",
    featured: false,
  },
  {
    id: "motion-intro-showcase",
    title: "Portfolio Brand & Motion Showcase",
    tagline: "High-impact 30–60 second promotional video created in Adobe After Effects with kinetic typography.",
    category: "motion",
    categoryLabel: "Motion Graphics",
    description:
      "A dynamic promotional video presenting creative identity, project highlights, and animation workflows. Features kinetic text reveals, synced sound design, and custom 3D composite passes.",
    longDescription:
      "Created entirely in Adobe After Effects, this promotional video delivers a fast-paced overview of creative and technical accomplishments. It merges stylized rendering passes from Blender with kinetic typography, geometric motion elements, and precise audio synchronization.",
    technologies: ["Adobe After Effects", "Adobe Premiere Pro", "Audio Editing", "Kinetic Typography"],
    keyFeatures: [
      "Custom motion graphics templates and graph editor easing curves",
      "Seamless visual transitions between 3D renders and UI designs",
      "Web-optimized 1080p H.264 export for smooth online playback",
      "Maintained modular .aep project file with non-destructive composition structure",
    ],
    role: "Motion Designer & Video Editor — storyboarded narrative flow, animated graphical layers, and mastered audio.",
    previewGradient: "from-pink-900/60 via-indigo-900/40 to-neutral-900",
    featured: false,
  },
];

export const educationData: EducationItem[] = [
  {
    institution: "NED University of Engineering and Technology",
    degree: "Bachelor of Science in Computer Science",
    specialization: "Specialization in Gaming and Animation",
    timeline: "Undergraduate Program (In Progress)",
    status: "Enrolled Undergraduate",
    location: "Karachi, Pakistan",
    description:
      "Pursuing a specialized curriculum that unifies core computational principles (algorithms, data structures, graphics programming, systems design) with specialized studies in game development, real-time animation, interactive storytelling, and digital multimedia.",
    relevantCoursework: [
      "Computer Graphics & Real-Time Rendering",
      "Game Design & Development Principles",
      "3D Modeling, Rigging & Animation",
      "Data Structures & Algorithms",
      "Object-Oriented Programming (C++ & C#)",
      "Human-Computer Interaction & UI/UX",
      "Database Systems & Software Engineering",
    ],
  },
];

export const experienceData: ExperienceItem[] = [
  {
    role: "Game Development & 3D Modeling Projects",
    organization: "NED University Academic Portfolio",
    type: "Academic",
    timeline: "Ongoing",
    description:
      "Designed and developed multiple interactive game prototypes and 3D assets exploring player psychology, resource allocation, and real-time mesh optimization.",
    responsibilities: [
      "Engineered game mechanics, player movement controllers, and event managers in Unity (C#).",
      "Modeled, UV-unwrapped, and rigged 3D props and stylized character assets using Blender.",
      "Conducted user testing sessions to iterate on HUD readability, player onboarding, and gameplay feel.",
    ],
    technologies: ["Unity", "C#", "Blender", "Git"],
  },
  {
    role: "Multimedia & Visual Design Initiatives",
    organization: "Student Creative & Technical Collaborations",
    type: "Creative",
    timeline: "Recent",
    description:
      "Produced digital design assets, branding collateral, and motion graphics for university academic showcases and digital events.",
    responsibilities: [
      "Created promotional motion clips and title sequences using Adobe After Effects and Premiere Pro.",
      "Designed vector layouts, event posters, and visual presentation decks in Adobe Illustrator and Photoshop.",
      "Structured UI/UX wireframes and game interface prototypes in Figma.",
    ],
    technologies: ["After Effects", "Photoshop", "Illustrator", "Figma"],
  },
  {
    role: "Interactive 3D Web Development",
    organization: "Personal & Capstone Exploration",
    type: "Technical",
    timeline: "Current",
    description:
      "Investigating the convergence of modern web frameworks and real-time graphics engines using Three.js and React Three Fiber.",
    responsibilities: [
      "Built responsive, accessible web layouts using Next.js 15, TypeScript, and Tailwind CSS.",
      "Integrated GLTF/GLB binary models with WebGL lighting, orbital camera controls, and shadow maps.",
      "Maintained modular component architectures separating data models from presentation views.",
    ],
    technologies: ["Next.js", "TypeScript", "Three.js", "Tailwind CSS"],
  },
];
