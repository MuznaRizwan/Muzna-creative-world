import { skillsCategories } from "@/data/portfolioData";

import { Block, Chips } from "./shared";

/** Technology Lab: the skill areas (one garden bed each in the lab) and their tools. */
export function SkillsSection() {
  return (
    <div className="space-y-6">
      <Block title="Skill areas">
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {skillsCategories.map((category) => (
            <li key={category.key} className="space-y-2 rounded-xl border border-line bg-raised/50 px-3.5 py-3">
              <p className="flex items-center gap-2 text-sm font-medium text-fg">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: category.accent }} aria-hidden="true" />
                {category.title}
              </p>
              <Chips items={category.skills} accent={category.accent} />
            </li>
          ))}
        </ul>
      </Block>
      <p className="text-xs text-muted">Tools used across the projects in the Game Development Zone and the Creative Studio.</p>
    </div>
  );
}
