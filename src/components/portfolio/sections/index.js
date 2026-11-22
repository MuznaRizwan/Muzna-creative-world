import { AboutSection } from "./AboutSection";
import { AssistantSection } from "./AssistantSection";
import { ContactSection } from "./ContactSection";
import { EducationSection } from "./EducationSection";
import { ProjectsSection } from "./ProjectsSection";
import { ShowreelSection } from "./ShowreelSection";
import { SkillsSection } from "./SkillsSection";
import { WelcomeSection } from "./WelcomeSection";

/**
 * Which view renders each portfolio section inside the panel.
 * @type {Record<import("@/data/portfolioSections").SectionId, (props: { params: Record<string, string> }) => import("react").ReactNode>}
 */
export const SECTION_VIEWS = {
  welcome: WelcomeSection,
  about: AboutSection,
  skills: SkillsSection,
  projects: ProjectsSection,
  education: EducationSection,
  showreel: ShowreelSection,
  assistant: AssistantSection,
  contact: ContactSection,
};
