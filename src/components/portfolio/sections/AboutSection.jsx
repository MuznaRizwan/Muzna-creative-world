"use client";

import { useWorld } from "@/components/world/WorldContext";
import { profileData, projectCategories, projectsData } from "@/data/portfolioData";

import { Block, Chips, Facts, Lead, ProjectImage } from "./shared";

/** Studio walls: the art and design pieces (the same entries as the Projects panel). */
const GALLERY = projectCategories.filter((c) => c.id === "art" || c.id === "design");

/**
 * Creative Studio: who Muzna is, her creative interests, and a gallery of her
 * traditional art and design work. A gallery piece opens its full entry in the
 * Projects panel.
 */
export function AboutSection() {
  const { state } = useWorld();

  return (
    <div className="space-y-6">
      <Lead>{profileData.headline}</Lead>
      <Block title="Profile">
        <Facts
          items={[
            ["Name", profileData.name],
            ["Based in", profileData.location],
            ["Studying", profileData.studies],
          ]}
        />
      </Block>

      <Block title="About">
        <p className="text-sm leading-relaxed text-fg/90">{profileData.summary.join(" ")}</p>
      </Block>

      <Block title="Creative interests">
        <Chips items={profileData.creativeInterests} />
      </Block>

      {GALLERY.map((category) => (
        <Block key={category.id} title={category.label}>
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {projectsData
              .filter((p) => p.category === category.id)
              .map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => state.openPanel("projects", { params: { projectId: p.id } })}
                    className="group w-full space-y-1.5 text-left"
                  >
                    <ProjectImage project={p} sizes="160px" className="aspect-square ring-1 ring-line group-hover:ring-lamp/60" />
                    <span className="block text-xs leading-snug text-fg/90 group-hover:text-lamp">{p.title}</span>
                  </button>
                </li>
              ))}
          </ul>
        </Block>
      ))}
    </div>
  );
}
