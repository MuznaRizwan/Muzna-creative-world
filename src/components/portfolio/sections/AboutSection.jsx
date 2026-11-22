import { profileData } from "@/data/portfolioData";

import { Block, Facts, Placeholder } from "./shared";

/** Creative Studio: who Muzna is. Only the basic facts are shown for now. */
export function AboutSection() {
  return (
    <div className="space-y-6">
      <Block title="Profile">
        <Facts
          items={[
            ["Name", profileData.name],
            ["Studying", profileData.title],
            ["Specialisation", profileData.specialization],
            ["University", profileData.institution],
          ]}
        />
      </Block>
      <Placeholder>Muzna&apos;s biography and creative profile will go here.</Placeholder>
      <Placeholder>A selection of artwork and design pieces will hang in this studio.</Placeholder>
    </div>
  );
}
