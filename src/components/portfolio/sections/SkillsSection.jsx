import { skillsCategories } from "@/data/portfolioData";

import { Block, Placeholder } from "./shared";

/** Technology Lab: the skill areas (one garden bed each in the lab). */
export function SkillsSection() {
  return (
    <div className="space-y-6">
      <Block title="Skill areas">
        <ul className="grid gap-2 sm:grid-cols-2">
          {skillsCategories.map((category) => (
            <li key={category.key} className="rounded-xl border border-line bg-raised/50 px-3.5 py-3 text-sm font-medium text-fg">
              {category.title}
            </li>
          ))}
        </ul>
      </Block>
      <Placeholder>The skills and tools in each area, with examples, will go here.</Placeholder>
    </div>
  );
}
