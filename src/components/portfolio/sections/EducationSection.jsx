"use client";

import { Award } from "lucide-react";

import { useWorld } from "@/components/world/WorldContext";
import {
  PROJECT_BY_ID,
  achievementsData,
  certificationsData,
  educationData,
  experienceData,
  languagesData,
} from "@/data/portfolioData";

import { Block, Card } from "./shared";

/**
 * University Campus: education, experience, achievements and languages, with
 * certifications as a short secondary list at the end.
 */
export function EducationSection() {
  const { state } = useWorld();

  return (
    <div className="space-y-6">
      <Block title="Education">
        <ul className="space-y-2">
          {educationData.map((item) => (
            <li key={item.institution}>
              <Card accent="#46598C">
                <p className="text-sm font-semibold text-fg">{item.qualification}</p>
                {item.specialization && <p className="text-sm text-fg/80">{item.specialization}</p>}
                <p className="text-sm text-muted">{item.institution}</p>
                {(item.dates || item.status) && (
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-lamp/90">
                    {[item.dates, item.status].filter(Boolean).join(" · ")}
                  </p>
                )}
              </Card>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Experience">
        <ul className="space-y-2">
          {experienceData.map((item) => {
            const related = item.relatedProjectId ? PROJECT_BY_ID[item.relatedProjectId] : null;
            return (
              <li key={item.organization}>
                <Card>
                  <p className="text-sm font-semibold text-fg">
                    {item.organization} <span className="font-normal text-muted">— {item.role}</span>
                  </p>
                  <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-lamp/90">
                    {[item.dates, item.location].filter(Boolean).join(" · ")}
                  </p>
                  {item.description && <p className="mt-1.5 text-sm leading-relaxed text-fg/85">{item.description}</p>}
                  {related && (
                    <button
                      type="button"
                      onClick={() => state.openPanel("projects", { params: { projectId: related.id } })}
                      className="mt-1.5 text-sm text-lavender hover:text-lamp"
                    >
                      Project: {related.title} →
                    </button>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      </Block>

      <Block title="Achievements">
        <ul className="space-y-2">
          {achievementsData.map((item) => (
            <li key={item.title} className="flex items-start gap-3 rounded-xl border border-lamp/40 bg-lamp/5 px-3.5 py-3">
              <Award className="mt-0.5 h-4 w-4 shrink-0 text-lamp" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-fg">{item.title}</p>
                <p className="text-sm text-muted">{item.organization}</p>
              </div>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Languages">
        <ul className="space-y-1 text-sm">
          {languagesData.map((item) => (
            <li key={item.language}>
              <span className="text-fg">{item.language}</span> <span className="text-muted">· {item.level}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Other certifications">
        <p className="text-xs leading-relaxed text-muted">{certificationsData.join(" · ")}</p>
      </Block>
    </div>
  );
}
