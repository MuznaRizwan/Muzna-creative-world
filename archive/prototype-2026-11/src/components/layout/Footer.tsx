"use client";

import React from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { profileData } from "@/data/portfolioData";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-neutral-900 bg-neutral-950 py-12 text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-neutral-900">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-semibold text-sm text-white tracking-tight">
              {profileData.name}
            </span>
            <span className="text-[11px] font-mono text-neutral-500">
              BS Computer Science (Gaming &amp; Animation) &bull; {profileData.institution}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#skills" className="hover:text-white transition-colors">Skills</a>
            <a href="#projects" className="hover:text-white transition-colors">Projects</a>
            <a href="#experience" className="hover:text-white transition-colors">Experience</a>
            <a href="#video" className="hover:text-white transition-colors">Video</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-white transition-all cursor-pointer font-mono"
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-neutral-500">
          <p>
            &copy; {new Date().getFullYear()} {profileData.name}. All rights reserved.
          </p>
          <p>
            Design &amp; Development of an Interactive 3D Web Portfolio &bull; University Capstone
          </p>
        </div>
      </div>
    </footer>
  );
}
