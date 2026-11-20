"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, CheckCircle2, Box, Layers, Code, Sparkles } from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
import { Project } from "@/types/portfolio";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (project) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10"
        >
          {/* Header Graphic Preview Banner */}
          <div
            className={`w-full h-44 sm:h-52 bg-gradient-to-r ${project.previewGradient} p-6 flex flex-col justify-between relative border-b border-neutral-800`}
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-neutral-950/70 border border-neutral-800 text-neutral-300 backdrop-blur-md">
                {project.categoryLabel}
              </span>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-neutral-950/70 hover:bg-neutral-900 text-neutral-400 hover:text-white flex items-center justify-center border border-neutral-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                {project.title}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 line-clamp-1 mt-1 font-light">
                {project.tagline}
              </p>
            </div>
          </div>

          {/* Modal Content Scrollable Area */}
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
            {/* Overview */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-indigo-400">
                Project Overview
              </h4>
              <p className="text-sm text-neutral-300 leading-relaxed font-normal">
                {project.longDescription}
              </p>
            </div>

            {/* My Role */}
            <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 space-y-1">
              <span className="text-xs font-mono text-purple-400 uppercase tracking-wide">
                Role &amp; Responsibilities
              </span>
              <p className="text-xs sm:text-sm text-neutral-300">
                {project.role}
              </p>
            </div>

            {/* Key Architectural & Technical Highlights */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-pink-400">
                Key Technical &amp; Design Features
              </h4>
              <ul className="space-y-2">
                {project.keyFeatures.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technologies Used */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                Technologies &amp; Tools
              </h4>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 rounded-lg text-xs font-mono bg-neutral-950 border border-neutral-800 text-neutral-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Links */}
            <div className="pt-4 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 hover:text-white transition-all"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>Repository</span>
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Live Preview</span>
                  </a>
                )}
              </div>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-mono text-neutral-400 hover:text-white transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
