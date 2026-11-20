"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Briefcase,
  Calendar,
  MapPin,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { educationData, experienceData } from "@/data/portfolioData";

export function EducationExperienceSection() {
  const [activeTab, setActiveTab] = useState<"education" | "experience">("education");

  return (
    <section id="experience" className="py-24 relative border-t border-neutral-900 bg-neutral-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-pink-400">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
              04 / Journey &amp; Milestones
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Education &amp; Experience
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              Academic progression at NED University alongside hands-on technical and
              creative practical roles.
            </p>
          </div>

          {/* Segmented Toggle Tabs */}
          <div className="p-1 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center gap-1">
            <button
              onClick={() => setActiveTab("education")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                activeTab === "education"
                  ? "bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/25"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Academic Education</span>
            </button>
            <button
              onClick={() => setActiveTab("experience")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                activeTab === "experience"
                  ? "bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/25"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Practical Experience</span>
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        {activeTab === "education" ? (
          <div className="space-y-8">
            {educationData.map((edu, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-8 sm:p-10 rounded-3xl border border-neutral-800 bg-neutral-900/30 backdrop-blur-sm space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest">
                      {edu.specialization}
                    </span>
                    <h3 className="text-2xl font-bold text-white">
                      {edu.degree}
                    </h3>
                    <p className="text-base text-neutral-300 font-medium">
                      {edu.institution}
                    </p>
                  </div>

                  <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 text-xs font-mono text-neutral-400">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-950 border border-neutral-800">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      {edu.timeline}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-950 border border-neutral-800">
                      <MapPin className="w-3.5 h-3.5 text-pink-400" />
                      {edu.location}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-neutral-300 leading-relaxed max-w-4xl font-normal">
                  {edu.description}
                </p>

                {/* Relevant Coursework */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <span>Specialized &amp; Relevant Coursework</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {edu.relevantCoursework.map((course, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-850 flex items-center gap-2.5 text-xs text-neutral-300 font-mono"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{course}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {experienceData.map((exp, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="p-6 sm:p-8 rounded-3xl border border-neutral-800 bg-neutral-900/30 backdrop-blur-sm space-y-4 hover:border-neutral-700 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-800/60">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {exp.type}
                      </span>
                      <span className="text-xs font-mono text-neutral-400">{exp.timeline}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">{exp.role}</h3>
                    <p className="text-xs font-mono text-neutral-400">{exp.organization}</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                  {exp.description}
                </p>

                <ul className="space-y-2 pt-1">
                  {exp.responsibilities.map((resp, rIdx) => (
                    <li
                      key={rIdx}
                      className="flex items-start gap-2.5 text-xs text-neutral-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>

                {exp.technologies && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {exp.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-neutral-950 border border-neutral-800 text-neutral-400"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
