import { educationData } from "@/data/portfolioData";

import { Block, Facts, Placeholder } from "./shared";

/** University Campus: education (basic facts only for now). */
export function EducationSection() {
  return (
    <div className="space-y-6">
      {educationData.map((item) => (
        <Block key={item.institution} title="Education">
          <Facts
            items={[
              ["Degree", item.degree],
              ["Track", item.specialization],
              ["University", item.institution],
              ["Status", item.timeline],
            ]}
          />
        </Block>
      ))}
      <Placeholder>Coursework highlights, achievements and certificates will go here.</Placeholder>
    </div>
  );
}
