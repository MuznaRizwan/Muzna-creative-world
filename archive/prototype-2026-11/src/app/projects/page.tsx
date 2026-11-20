import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="min-h-screen p-6 sm:p-12 md:p-24 max-w-5xl mx-auto space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="space-y-4">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">Featured Projects</h1>
        <p className="text-neutral-400 text-lg leading-relaxed">
          A showcase of creative 3D modeling, interactive web applications, motion design, and university capstone work.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30 space-y-4">
          <div className="h-44 rounded-lg bg-neutral-800/60 border border-neutral-700/40 flex items-center justify-center text-xs text-neutral-500 font-mono">
            [Interactive 3D Demo Preview]
          </div>
          <h2 className="text-xl font-semibold">Interactive 3D Web Portfolio</h2>
          <p className="text-sm text-neutral-400">
            Next.js, Three.js, R3F, Blender 3D Avatar, Supabase pgvector RAG chatbot.
          </p>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium">
            <span>Current Project</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30 space-y-4">
          <div className="h-44 rounded-lg bg-neutral-800/60 border border-neutral-700/40 flex items-center justify-center text-xs text-neutral-500 font-mono">
            [Promotional Video Showcase]
          </div>
          <h2 className="text-xl font-semibold">Brand &amp; Portfolio Intro</h2>
          <p className="text-sm text-neutral-400">
            After Effects motion graphics, typography, audio sync, exported to 1080p H.264 MP4.
          </p>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium">
            <span>Video Asset</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
