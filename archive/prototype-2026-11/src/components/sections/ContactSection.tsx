"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Send,
  MapPin,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/Icons";
import { profileData } from "@/data/portfolioData";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    // Client-side simulation since backend email integration is scheduled for next phase
    setTimeout(() => {
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 800);
  };

  return (
    <section id="contact" className="py-24 relative border-t border-neutral-900 bg-neutral-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-400">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            06 / Communication &amp; Inquiries
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Get in Touch
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Have a question regarding my projects, an evaluation feedback, or an opportunity
            in game development, 3D art, or interactive systems? I would love to connect.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Info & Social Channels */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-3xl border border-neutral-800 bg-neutral-900/30 backdrop-blur-sm space-y-6">
              <h3 className="text-xl font-bold text-white">
                Contact Information
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-normal">
                Open to undergraduate discussions, game jam collaborations, and technical apprenticeships.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-850">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-neutral-500 block">Direct Email</span>
                    <a
                      href={`mailto:${profileData.contactEmail}`}
                      className="text-xs sm:text-sm font-medium text-neutral-200 hover:text-indigo-300 transition-colors"
                    >
                      {profileData.contactEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-850">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-neutral-500 block">University Affiliation</span>
                    <span className="text-xs sm:text-sm font-medium text-neutral-200">
                      {profileData.institution}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-850">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-neutral-500 block">Current Location</span>
                    <span className="text-xs sm:text-sm font-medium text-neutral-200">
                      Karachi, Pakistan
                    </span>
                  </div>
                </div>
              </div>

              {/* Social Channels */}
              <div className="pt-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block mb-3">
                  Profiles &amp; Repositories
                </span>
                <div className="flex items-center gap-3">
                  {profileData.socials.github && (
                    <a
                      href={profileData.socials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-white transition-colors"
                    >
                      <GithubIcon className="w-3.5 h-3.5" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {profileData.socials.linkedin && (
                    <a
                      href={profileData.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-white transition-colors"
                    >
                      <LinkedinIcon className="w-3.5 h-3.5" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Inquiry Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="p-8 sm:p-10 rounded-3xl border border-neutral-800 bg-neutral-900/40 backdrop-blur-md space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-mono text-neutral-400">
                    Your Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Muzna's Guest"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-indigo-500 text-xs sm:text-sm transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-mono text-neutral-400">
                    Your Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="guest@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-indigo-500 text-xs sm:text-sm transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-xs font-mono text-neutral-400">
                  Subject *
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Inquiry regarding Moral Triage / 3D Art Collaboration"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-indigo-500 text-xs sm:text-sm transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-xs font-mono text-neutral-400">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your inquiry or feedback here..."
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-indigo-500 text-xs sm:text-sm transition-colors resize-none"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs sm:text-sm transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {status === "submitting" ? "Sending Inquiry..." : "Submit Message"}
                  </span>
                </button>

                <span className="text-[11px] font-mono text-neutral-500">
                  Email API integration planned for next phase
                </span>
              </div>

              {/* Status Notifications */}
              {status === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-3 text-xs sm:text-sm text-emerald-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Thank you! Your message was submitted successfully (preview mode).
                  </span>
                </motion.div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
