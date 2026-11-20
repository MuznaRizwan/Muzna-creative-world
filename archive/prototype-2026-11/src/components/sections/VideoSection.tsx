"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Video, Film, Sparkles, AlertCircle, FileVideo } from "lucide-react";

export function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoExists, setVideoExists] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check if the exported video file actually exists in public/videos/
    fetch("/videos/portfolio-intro.mp4", { method: "HEAD" })
      .then((res) => {
        if (res.ok) setVideoExists(true);
      })
      .catch(() => setVideoExists(false));
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  return (
    <section id="video" className="py-24 relative border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-pink-400">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
            05 / Motion &amp; Cinematics
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Promotional Video Showcase
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Reserved showcase for the 30–60 second promotional intro produced in Adobe After Effects.
            Communicates creative identity, motion graphics mastery, and technical highlights.
          </p>
        </div>

        {/* Video Player Container */}
        <div className="max-w-5xl mx-auto">
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-2xl flex items-center justify-center group">
            {videoExists ? (
              <>
                <video
                  ref={videoRef}
                  src="/videos/portfolio-intro.mp4"
                  className="w-full h-full object-cover"
                  onEnded={() => setIsPlaying(false)}
                  controls={isPlaying}
                />
                {!isPlaying && (
                  <div
                    onClick={togglePlay}
                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer transition-opacity group-hover:bg-black/50"
                  >
                    <div className="w-20 h-20 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-600/40 hover:scale-105 transition-all">
                      <Play className="w-8 h-8 fill-current translate-x-0.5" />
                    </div>
                    <span className="mt-4 text-xs font-mono text-neutral-300">
                      Play Promotional Intro (30-60s)
                    </span>
                  </div>
                )}
              </>
            ) : (
              /* Fallback / Creative Placeholder when video asset is pending */
              <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-5 max-w-lg">
                <div className="w-20 h-20 rounded-3xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-center text-pink-400 shadow-xl group-hover:scale-105 transition-transform">
                  <Film className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">
                    Adobe After Effects Motion Teaser
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-normal">
                    This frame is mapped to receive the final promotional render exported in
                    H.264 MP4 format.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 w-full text-left space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-neutral-400 pb-1.5 border-b border-neutral-800/60">
                    <span>Export Target:</span>
                    <span className="text-indigo-300">public/videos/portfolio-intro.mp4</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400 pb-1.5 border-b border-neutral-800/60">
                    <span>Source Project:</span>
                    <span className="text-purple-300">Portfolio_Intro.aep</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Format &amp; Length:</span>
                    <span className="text-emerald-400">1080p H.264 &bull; 30–60 Seconds</span>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                  Ready to mount video asset upon export
                </span>
              </div>
            )}
          </div>

          {/* Production Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="p-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/30 space-y-1.5">
              <span className="text-xs font-mono text-pink-400">01 / Kinetic Typography</span>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Dynamic text reveals synchronized with upbeat audio pacing and editorial transitions.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/30 space-y-1.5">
              <span className="text-xs font-mono text-purple-400">02 / 3D Asset Integration</span>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Render passes of Blender character animations, game blockouts, and UI design layers.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/30 space-y-1.5">
              <span className="text-xs font-mono text-indigo-400">03 / Sound Architecture</span>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Layered sound effects, whooshes, and rhythmic beat matching created in Premiere &amp; After Effects.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
