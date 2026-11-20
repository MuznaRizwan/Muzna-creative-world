"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  Gamepad2,
  Box,
  Palette,
  Video,
  Layout,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { skillsCategories } from "@/data/portfolioData";
import { SkillCategoryKey } from "@/types/portfolio";

const categoryIcons: Record<SkillCategoryKey, React.ReactNode> = {
  programming: <Code2 className="w-4 h-4" />,
  gameDev: <Gamepad2 className="w-4 h-4" />,
  modeling3D: <Box className="w-4 h-4" />,
  graphicDesign: <Palette className="w-4 h-4" />,
  videoMotion: <Video className="w-4 h-4" />,
  uiUx: <Layout className="w-4 h-4" />,
};

export function SkillsSection() {
  const [selectedKey, setSelectedKey] = useState<SkillCategoryKey | "all">("all");

  const filteredCategories =
    selectedKey === "all"
      ? skillsCategories
      : skillsCategories.filter((cat) => cat.key === selectedKey);

  return (
    <section id="skills" className="py-24 relative border-t border-neutral-900 bg-neutral-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-purple-400">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            02 / Technical &amp; Creative Competencies
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Skills &amp; Capabilities
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            A comprehensive inventory of tools, languages, and creative workflows studied and
            practiced during my Computer Science and Gaming specialization.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-10 pb-2">
          <button
            onClick={() => setSelectedKey("all")}
            className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              selectedKey === "all"
                ? "bg-neutral-100 text-neutral-950 font-semibold shadow-md"
                : "bg-neutral-900/80 hover:bg-neutral-850 text-neutral-400 hover:text-white border border-neutral-800"
            }`}
          >
            All Categories ({skillsCategories.length})
          </button>

          {skillsCategories.map((cat) => {
            const isSelected = selectedKey === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedKey(cat.key)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/20"
                    : "bg-neutral-900/80 hover:bg-neutral-850 text-neutral-400 hover:text-white border border-neutral-800"
                }`}
              >
                {categoryIcons[cat.key]}
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>

        {/* Skills Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredCategories.map((cat) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                key={cat.key}
                className="p-6 rounded-3xl border border-neutral-800/90 bg-neutral-900/30 backdrop-blur-sm flex flex-col justify-between hover:border-neutral-700/80 transition-all group"
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-800/60">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          cat.accent === "blue"
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            : cat.accent === "lavender"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            : "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                        }`}
                      >
                        {categoryIcons[cat.key]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm sm:text-base">
                          {cat.title}
                        </h3>
                        <p className="text-[11px] text-neutral-500 line-clamp-1">
                          {cat.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Skills List */}
                  <ul className="space-y-2.5">
                    {cat.skills.map((skill, sIdx) => (
                      <li
                        key={sIdx}
                        className="p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-850/60 hover:border-neutral-750 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-neutral-200">
                            {skill.name}
                          </span>
                          {skill.highlight && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                              Core
                            </span>
                          )}
                        </div>
                        {skill.description && (
                          <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                            {skill.description}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
