"use client";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";

import { PROJECT_BY_ID, PROJECT_CATEGORY_BY_ID, projectCategories, projectsData } from "@/data/portfolioData";

import { Block, Chips, LinkButton, ProjectImage, TeamBadge } from "./shared";

/** @typedef {import("@/types/portfolio").Project} Project */

const FEATURED = projectsData.filter((p) => p.featured);
const OTHERS = projectsData.filter((p) => !p.featured);

/**
 * Game Development Zone: featured projects as large cards, the rest grouped by
 * category, and one project's full entry when chosen (or when opened from its
 * arcade cabinet / a gallery piece: params.projectId).
 * @param {{ params: Record<string, string> }} props
 */
export function ProjectsSection({ params }) {
  const [selected, setSelected] = useState(params.projectId ?? null);
  const project = selected ? PROJECT_BY_ID[selected] : null;

  if (project) return <ProjectDetail project={project} onBack={() => setSelected(null)} />;

  return (
    <div className="space-y-7">
      <Block title="Featured">
        <ul className="grid gap-3 sm:grid-cols-2">
          {FEATURED.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setSelected(p.id)}
                className="group flex h-full w-full flex-col gap-2 rounded-xl border border-line bg-raised/50 p-2.5 text-left hover:border-lamp/50"
              >
                <span className="relative block">
                  <ProjectImage project={p} sizes="(min-width: 768px) 220px, 90vw" />
                  <span className="absolute right-1.5 top-1.5 rounded-full bg-glass/85">
                    <TeamBadge project={p} />
                  </span>
                </span>
                <CategoryLabel project={p} />
                <span className="font-display text-[15px] font-bold leading-snug text-fg group-hover:text-lamp">{p.title}</span>
                <span className="line-clamp-3 text-xs leading-relaxed text-muted">{p.summary}</span>
              </button>
            </li>
          ))}
        </ul>
      </Block>

      {projectCategories.map((category) => {
        const items = OTHERS.filter((p) => p.category === category.id);
        if (items.length === 0) return null;
        return (
          <Block key={category.id} title={category.label}>
            <ul className="space-y-2">
              {items.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(p.id)}
                    className="group flex w-full items-center gap-3 rounded-xl border border-line bg-raised/50 p-2 text-left hover:border-lamp/50"
                  >
                    <ProjectImage project={p} sizes="96px" className="aspect-[4/3] w-20 shrink-0" />
                    <span className="min-w-0 flex-1 space-y-0.5">
                      <span className="block text-sm font-medium leading-snug text-fg group-hover:text-lamp">{p.title}</span>
                      <span className="line-clamp-2 block text-xs leading-relaxed text-muted">{p.summary}</span>
                    </span>
                    <TeamBadge project={p} />
                  </button>
                </li>
              ))}
            </ul>
          </Block>
        );
      })}

      <p className="text-sm text-muted">The featured projects also stand in the Arcade Hall courtyard: walk up to a cabinet and press E.</p>
    </div>
  );
}

/** @param {{ project: Project }} props */
function CategoryLabel({ project }) {
  const category = PROJECT_CATEGORY_BY_ID[project.category];
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: category?.accent }}>
      {category?.label}
    </span>
  );
}

/**
 * One project's full entry. Every line comes from the project's data; empty
 * fields are simply not shown.
 * @param {{ project: Project, onBack: () => void }} props
 */
function ProjectDetail({ project, onBack }) {
  const category = PROJECT_CATEGORY_BY_ID[project.category];
  const meta = [project.date, project.context].filter(Boolean).join(" · ");
  return (
    <div className="space-y-5">
      <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All projects
      </button>

      <ProjectImage project={project} sizes="(min-width: 768px) 440px, 95vw" fit="contain" />

      <div className="space-y-1">
        <CategoryLabel project={project} />
        <h3 className="font-display text-xl font-bold leading-tight text-fg">{project.title}</h3>
        {meta && <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-lamp/90">{meta}</p>}
      </div>

      <p className="text-sm leading-relaxed text-fg/90">{project.summary}</p>

      {project.details && (
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-fg/85 marker:text-muted">
          {project.details.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}

      {project.note && <p className="rounded-xl border border-lamp/40 bg-lamp/5 px-3.5 py-2.5 text-xs leading-relaxed text-fg/90">{project.note}</p>}

      {project.contribution && (
        <Block title="Muzna's part">
          <p className="text-sm leading-relaxed text-fg/90">{project.contribution}</p>
        </Block>
      )}

      {(project.team || project.contributors) && (
        <Block title="Team">
          <p className="text-sm leading-relaxed text-fg/90">
            {project.team && <span>{project.team}</span>}
            {project.team && project.contributors && <span> · </span>}
            {project.contributors && <span>With {joinNames(project.contributors)}</span>}
          </p>
        </Block>
      )}

      {project.technologies.length > 0 && (
        <Block title="Technologies">
          <Chips items={project.technologies} accent={category?.accent} />
        </Block>
      )}

      {project.links && (
        <Block title="Links">
          <div className="flex flex-wrap gap-2">
            {project.links.map((link) => (
              <LinkButton key={link.url} href={link.url}>
                {link.label}
              </LinkButton>
            ))}
          </div>
        </Block>
      )}
    </div>
  );
}

/** "A", "A and B", "A, B and C" @param {string[]} names */
function joinNames(names) {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
