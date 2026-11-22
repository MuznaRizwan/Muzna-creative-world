"use client";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";

import { projectsData } from "@/data/portfolioData";

import { Block, Placeholder } from "./shared";

/**
 * Game Development Zone: the project list, or one project when opened from
 * its arcade cabinet (params.projectId).
 * @param {{ params: Record<string, string> }} props
 */
export function ProjectsSection({ params }) {
  const [selected, setSelected] = useState(params.projectId ?? null);
  const project = projectsData.find((p) => p.id === selected);

  if (project) {
    return (
      <div className="space-y-6">
        <button type="button" onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-sm text-muted hover:text-fg">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All projects
        </button>
        <div className="space-y-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-lamp">{project.categoryLabel}</p>
          <h3 className="font-display text-xl font-bold text-fg">{project.title}</h3>
        </div>
        <Placeholder>The project description, Muzna&apos;s role, screenshots or video, and links will go here.</Placeholder>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Block title="Projects">
        <ul className="space-y-2">
          {projectsData.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setSelected(p.id)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-raised/50 px-3.5 py-3 text-left hover:border-lamp/50"
              >
                <span className="text-sm font-medium text-fg">{p.title}</span>
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{p.categoryLabel}</span>
              </button>
            </li>
          ))}
        </ul>
      </Block>
      <p className="text-sm text-muted">Each project also has its own arcade cabinet in the hall.</p>
    </div>
  );
}
