import { ExternalLink, Users } from "lucide-react";
import Image from "next/image";

import { PROJECT_CATEGORY_BY_ID } from "@/data/portfolioData";

/**
 * Small building blocks shared by the section views.
 */

/**
 * Marks where finished portfolio content will go. Placeholders say what
 * belongs there instead of inventing it.
 * @param {{ children: import("react").ReactNode }} props
 */
export function Placeholder({ children }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-raised/40 px-4 py-3 text-sm leading-relaxed text-muted">
      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-lamp/80">Content coming soon</p>
      {children}
    </div>
  );
}

/** @param {{ children: import("react").ReactNode }} props */
export function Lead({ children }) {
  return <p className="text-[15px] leading-relaxed text-fg/90">{children}</p>;
}

/**
 * @param {{ title: string, children: import("react").ReactNode }} props
 */
export function Block({ title, children }) {
  return (
    <section className="space-y-2.5">
      <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{title}</h3>
      {children}
    </section>
  );
}

/**
 * A two-column list of facts.
 * @param {{ items: [string, string][] }} props
 */
export function Facts({ items }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
      {items.map(([term, value]) => (
        <div key={term} className="contents">
          <dt className="text-muted">{term}</dt>
          <dd className="text-fg">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Small pill labels (tools, interests).
 * @param {{ items: string[], accent?: string }} props
 */
export function Chips({ items, accent }) {
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full border border-line bg-raised/60 px-2.5 py-0.5 text-xs text-fg/90"
          style={accent ? { borderColor: `${accent}66` } : undefined}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * Card-style frame for one item (experience, education, award).
 * @param {{ children: import("react").ReactNode, accent?: string }} props
 */
export function Card({ children, accent }) {
  return (
    <div className="rounded-xl border border-line bg-raised/50 px-3.5 py-3" style={accent ? { borderLeft: `3px solid ${accent}` } : undefined}>
      {children}
    </div>
  );
}

/**
 * External link styled as a small button; opens in a new tab.
 * @param {{ href: string, children: import("react").ReactNode }} props
 */
export function LinkButton({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-raised/60 px-3 py-1.5 text-sm text-fg hover:border-lamp/60 hover:text-lamp"
    >
      {children}
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
    </a>
  );
}

/**
 * A project's image, or a styled block in its category colour when there is
 * none (so cards keep their shape). `fit="contain"` shows the whole picture
 * (detail view); `cover` fills the frame (cards).
 * @param {{ project: import("@/types/portfolio").Project, sizes: string, fit?: "cover" | "contain", className?: string }} props
 */
export function ProjectImage({ project, sizes, fit = "cover", className = "aspect-video" }) {
  const category = PROJECT_CATEGORY_BY_ID[project.category];
  return (
    <div className={`relative overflow-hidden rounded-lg bg-ink ${className}`}>
      {project.image ? (
        <Image src={project.image.src} alt={project.image.alt} fill sizes={sizes} className={fit === "contain" ? "object-contain" : "object-cover"} />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center p-3 text-center"
          style={{ background: `linear-gradient(135deg, ${category?.accent ?? "#C084FC"}55, #181523 70%)` }}
        >
          <span className="font-display text-sm font-bold text-fg/80">{project.title}</span>
        </div>
      )}
    </div>
  );
}

/**
 * "Team project" marker for projects with named contributors or a team.
 * @param {{ project: import("@/types/portfolio").Project }} props
 */
export function TeamBadge({ project }) {
  if (!project.contributors && !project.team) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
      <Users className="h-3 w-3" aria-hidden="true" /> Team
    </span>
  );
}
