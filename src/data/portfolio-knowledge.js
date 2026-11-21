/** @typedef {import("@/types/chat").KnowledgeDocument} KnowledgeDocument */

/** @type {Omit<KnowledgeDocument, "id">[]} */
export const initialKnowledgeBase = [
  {
    title: "Muzna Portfolio Overview",
    category: "biography",
    content: "Muzna is a digital designer and developer specializing in 3D interactive web applications, Blender modeling and rigging, Adobe After Effects motion design, and modern full-stack web engineering using Next.js and Supabase.",
  },
  {
    title: "Interactive 3D Web Portfolio Project",
    category: "project",
    content: "Muzna's Creative World is a university capstone project: an interactive 3D web portfolio in which visitors explore a small island town as a cat character modeled in Blender. Each location opens a section of the portfolio. The project also includes an After Effects promotional video and a RAG chatbot powered by Supabase pgvector. It is under development.",
  },
  {
    title: "Technical Stack",
    category: "skill",
    content: "Frontend: Next.js (App Router), React, JavaScript, Tailwind CSS, Framer Motion. 3D: vanilla Three.js with a custom lightweight physics and collision system. Creative: Blender (GLB/glTF), Adobe After Effects (H.264 MP4). Backend & DB: Next.js Route Handlers, Supabase (PostgreSQL, pgvector), LLM and embeddings, Resend API. Hosting: Vercel.",
  },
];
