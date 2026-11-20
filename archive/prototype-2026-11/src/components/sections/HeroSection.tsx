"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, Gamepad2, Sparkles, Layers, Terminal } from "lucide-react";
import { HeroScene } from "@/components/three/HeroScene";
import { profileData } from "@/data/portfolioData";

export function HeroSection() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen pt-28 pb-16 flex flex-col justify-center overflow-hidden"
    >
      {/* Background Subtle Gradient Accents */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-48 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-pink-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Hero Copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            {/* Identity Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-800 bg-neutral-900/60 backdrop-blur-md text-xs font-mono text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span>Student &bull; 3D Artist &bull; Game Developer</span>
            </div>

            {/* Name & Title */}
            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-mono tracking-widest uppercase text-neutral-400">
                Portfolio of
              </p>
              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
                {profileData.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-lg sm:text-2xl font-medium text-neutral-200">
                  {profileData.title}
                </span>
                <span className="text-neutral-500 font-light text-xl sm:text-2xl">|</span>
                <span className="text-lg sm:text-2xl font-medium bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                  {profileData.specialization}
                </span>
              </div>
            </div>

            {/* University & Focus Statement */}
            <p className="text-sm sm:text-base text-neutral-300 font-normal leading-relaxed max-w-xl">
              Undergraduate at{" "}
              <strong className="text-white font-medium">
                {profileData.institution}
              </strong>
              . Exploring the convergence of computational logic, interactive game
              architecture, and real-time 3D character animation.
            </p>

            {/* Spec Highlights Mini Bar */}
            <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg">
              <div className="p-3 rounded-xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-mono mb-1">
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span>Game Dev</span>
                </div>
                <p className="text-xs text-neutral-400">Unity, C#, Gameplay Systems</p>
              </div>

              <div className="p-3 rounded-xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-purple-400 text-xs font-mono mb-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>3D Art</span>
                </div>
                <p className="text-xs text-neutral-400">Blender, Rigging &amp; Animation</p>
              </div>

              <div className="p-3 rounded-xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-pink-400 text-xs font-mono mb-1">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Engineering</span>
                </div>
                <p className="text-xs text-neutral-400">C++, WebGL, Next.js</p>
              </div>
            </div>

            {/* Call To Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => scrollTo("projects")}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 cursor-pointer"
              >
                <span>Explore My Work</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => scrollTo("contact")}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 text-neutral-200 hover:text-white font-medium text-sm transition-all cursor-pointer"
              >
                <span>Contact Me</span>
              </button>
            </div>
          </motion.div>

          {/* Right Column: 3D Interactive Canvas & Avatar Mount */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 w-full flex justify-center"
          >
            <HeroScene />
          </motion.div>
        </div>
      </div>

      {/* Subtle Scroll Down Indicator */}
      <div className="max-w-7xl mx-auto px-4 w-full flex justify-center pt-12">
        <button
          onClick={() => scrollTo("about")}
          className="flex flex-col items-center gap-1.5 text-neutral-500 hover:text-neutral-300 transition-colors text-xs font-mono"
          aria-label="Scroll down to About section"
        >
          <span>Scroll to explore</span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
        </button>
      </div>
    </section>
  );
}
