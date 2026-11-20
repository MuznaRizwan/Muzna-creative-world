"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Sparkles,
  Palette,
  Code2,
  Compass,
  CheckCircle2,
} from "lucide-react";
import { profileData } from "@/data/portfolioData";

export function AboutSection() {
  return (
    <section id="about" className="py-24 relative border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-400">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            01 / Background &amp; Philosophy
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            About Me
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Bridging technical rigour with artistic expression. A dedicated student of
            computer science specializing in real-time gaming environments and 3D digital art.
          </p>
        </div>

        {/* Two-Column About Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Narrative Column */}
          <div className="lg:col-span-7 space-y-6 text-neutral-300 text-sm sm:text-base leading-relaxed">
            {profileData.bio.map((paragraph, idx) => (
              <p key={idx} className="text-neutral-300/90 font-normal">
                {paragraph}
              </p>
            ))}

            {/* Core Values / Creative Pillars */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/30 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Code2 className="w-4 h-4" />
                </div>
                <h4 className="font-semibold text-sm text-white">Engineering Foundations</h4>
                <p className="text-xs text-neutral-400 leading-normal">
                  Algorithms, object-oriented systems in C++/C#, computational graphics, and clean architecture.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/30 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Palette className="w-4 h-4" />
                </div>
                <h4 className="font-semibold text-sm text-white">3D Art &amp; Animation</h4>
                <p className="text-xs text-neutral-400 leading-normal">
                  Blender character modeling, IK rigging, weight painting, texturing, and expressive keyframed motion.
                </p>
              </div>
            </div>
          </div>

          {/* Academic Snapshot Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl border border-neutral-800 bg-gradient-to-b from-neutral-900/50 via-neutral-900/30 to-neutral-950 shadow-xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-neutral-800">
                <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">Academic Identity</h3>
                  <p className="text-xs font-mono text-neutral-400">
                    NED University of Engineering &amp; Technology
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div className="flex justify-between py-2 border-b border-neutral-800/60">
                  <span className="text-neutral-500">Degree Program:</span>
                  <span className="text-neutral-200 text-right font-medium">BS Computer Science</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-800/60">
                  <span className="text-neutral-500">Specialization:</span>
                  <span className="text-indigo-300 text-right font-medium">Gaming &amp; Animation</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-800/60">
                  <span className="text-neutral-500">Status:</span>
                  <span className="text-emerald-400 text-right font-medium">Enrolled Undergraduate</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-800/60">
                  <span className="text-neutral-500">Location:</span>
                  <span className="text-neutral-200 text-right font-medium">Karachi, Pakistan</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-neutral-500">Interests:</span>
                  <span className="text-purple-300 text-right font-medium">3D Art &bull; Game Loops &bull; Motion</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Committed to developing thoughtful interactive experiences and expanding the boundaries of student-led game development.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
