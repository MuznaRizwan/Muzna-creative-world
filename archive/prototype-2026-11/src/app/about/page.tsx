import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen p-6 sm:p-12 md:p-24 max-w-4xl mx-auto space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="space-y-4">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">About Muzna</h1>
        <p className="text-neutral-400 text-lg leading-relaxed">
          This section introduces Muzna&apos;s academic background, creative competencies,
          technical skill set, and project objectives for the Interactive 3D Web Portfolio.
        </p>
      </div>

      <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30 space-y-2">
        <h2 className="text-lg font-semibold text-indigo-300">Curriculum &amp; Capabilities</h2>
        <p className="text-sm text-neutral-400 leading-relaxed">
          Specializing in 3D digital art (Blender), motion graphics (Adobe After Effects),
          and full-stack software development (React, Next.js, Node.js, Supabase, Three.js).
        </p>
      </div>
    </div>
  );
}
