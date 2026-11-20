"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles, Layers, Box, Gamepad2, Video } from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
import { Project } from "@/types/portfolio";

interface ProjectCardProps {
  project: Project;
  onOpenDetails: (project: Project) => void;
}

const categoryIcons = {
  game: <Gamepad2 className="w-3.5 h-3.5" />,
  "3d": <Box className="w-3.5 h-3.5" />,
  web: <Layers className="w-3.5 h-3.5" />,
  motion: <Video className="w-3.5 h-3.5" />,
};

export function ProjectCard({ project, onOpenDetails }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`rounded-3xl border ${
        project.featured
          ? "border-indigo-500/30 bg-gradient-to-b from-neutral-900/60 via-neutral-900/40 to-neutral-950 shadow-xl shadow-indigo-950/20"
          : "border-neutral-800/80 bg-neutral-900/30 hover:border-neutral-700/80"
      } backdrop-blur-sm overflow-hidden flex flex-col justify-between transition-all group`}
    >
      <div>
        {/* Visual Mockup Preview Header */}
        <div
          className={`h-48 sm:h-56 bg-gradient-to-br ${project.previewGradient} p-5 relative flex flex-col justify-between overflow-hidden border-b border-neutral-800/60`}
        >
          {/* Subtle Abstract Grid Lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Top Badges */}
          <div className="flex items-center justify-between z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-neutral-950/80 border border-neutral-800/80 text-neutral-300 backdrop-blur-md">
              {categoryIcons[project.category]}
              <span>{project.categoryLabel}</span>
            </span>

            {project.featured && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Featured
              </span>
            )}
          </div>

          {/* Centered Graphic Hint */}
          <div className="my-auto z-10 flex flex-col items-center text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-950/60 border border-white/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              {categoryIcons[project.category]}
            </div>
            <span className="text-[11px] font-mono text-neutral-300/80 uppercase tracking-widest">
              {project.title}
            </span>
          </div>

          {/* Bottom subtle indicator */}
          <div className="z-10 flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span>Case Study</span>
            <span className="text-neutral-500">Academic &bull; Portfolio</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
              {project.title}
            </h3>
            <p className="text-xs font-mono text-indigo-400/90 line-clamp-1">
              {project.tagline}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed line-clamp-3">
            {project.description}
          </p>

          {/* Tech Badges */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.technologies.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-neutral-950 border border-neutral-800 text-neutral-400"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 4 && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-neutral-500">
                +{project.technologies.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="p-6 pt-0 flex items-center justify-between border-t border-neutral-800/60 mt-4">
        <button
          onClick={() => onOpenDetails(project)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer py-2"
        >
          <span>View Details &amp; Spec</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-2">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
              title="GitHub Code Repository"
              aria-label="GitHub Code Repository"
            >
              <GithubIcon className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
