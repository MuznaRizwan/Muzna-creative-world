import { KnowledgeDocument } from "@/types/chat";

export const initialKnowledgeBase: Omit<KnowledgeDocument, "id">[] = [
  {
    title: "Muzna Portfolio Overview",
    category: "biography",
    content: "Muzna is a digital designer and developer specializing in 3D interactive web applications, Blender modeling and rigging, Adobe After Effects motion design, and modern full-stack web engineering using Next.js and Supabase.",
  },
  {
    title: "Interactive 3D Web Portfolio Project",
    category: "project",
    content: "The Interactive 3D Web Portfolio is a university capstone project showcasing an interactive 3D avatar modeled in Blender, dynamic real-time Three.js/R3F lighting and controls, an After Effects promotional video, and a RAG chatbot powered by Supabase pgvector.",
  },
  {
    title: "Technical Stack",
    category: "skill",
    content: "Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS, Framer Motion. 3D: Three.js, React Three Fiber, React Three Drei. Creative: Blender (GLB/glTF), Adobe After Effects (H.264 MP4). Backend & DB: Next.js Route Handlers, Supabase (PostgreSQL, pgvector), Resend API.",
  },
];
