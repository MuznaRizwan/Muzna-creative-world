"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Gamepad2, Layers, Filter } from "lucide-react";
import { projectsData } from "@/data/portfolioData";
import { Project, ProjectCategory } from "@/types/portfolio";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { ProjectModal } from "@/components/sections/ProjectModal";

export function ProjectsSection() {
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | "all">("all");
  const [activeModalProject, setActiveModalProject] = useState<Project | null>(null);

  const filteredProjects =
    selectedCategory === "all"
      ? projectsData
      : projectsData.filter((p) => p.category === selectedCategory);

  return (
    <section id="projects" className="py-24 relative border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-400">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              03 / Selected Works
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Projects &amp; Prototypes
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              Showcase of interactive game systems, real-time 3D web environments,
              character rigs, and academic capstone deliverables.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "all", label: "All Projects" },
              { key: "game", label: "Games" },
              { key: "web", label: "3D Web" },
              { key: "3d", label: "Animation" },
              { key: "motion", label: "Motion" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedCategory(tab.key as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  selectedCategory === tab.key
                    ? "bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/20"
                    : "bg-neutral-900/80 hover:bg-neutral-850 text-neutral-400 hover:text-white border border-neutral-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Project Spotlight: Moral Triage */}
        {selectedCategory === "all" && (
          <div className="mb-12">
            <div className="p-8 sm:p-10 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-neutral-900/60 to-neutral-950 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Gamepad2 className="w-64 h-64 text-indigo-400" />
              </div>

              <div className="max-w-2xl space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  Primary Featured Project &bull; Game Development
                </div>

                <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
                  Moral Triage
                </h3>

                <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
                  A narrative decision-making game exploring ethical dilemmas under severe crisis constraints.
                  Players allocate scarce medical resources and make high-stakes choices where every branch carries
                  profound procedural outcomes.
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {["Unity", "C#", "Blender", "Figma", "Photoshop"].map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 rounded-lg text-xs font-mono bg-neutral-950/80 border border-neutral-800 text-neutral-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() =>
                      setActiveModalProject(
                        projectsData.find((p) => p.id === "moral-triage") || null
                      )
                    }
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
                  >
                    View Project Specification &amp; Mechanics
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpenDetails={(p) => setActiveModalProject(p)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Modal Dialog for Project Deep Dive */}
      <ProjectModal
        project={activeModalProject}
        onClose={() => setActiveModalProject(null)}
      />
    </section>
  );
}
