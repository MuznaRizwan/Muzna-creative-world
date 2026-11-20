export type ProjectCategory = "game" | "3d" | "web" | "motion";

export interface Project {
  id: string;
  title: string;
  tagline: string;
  category: ProjectCategory;
  categoryLabel: string;
  description: string;
  longDescription: string;
  technologies: string[];
  keyFeatures: string[];
  role: string;
  previewGradient: string;
  aspectRatio?: string;
  githubUrl?: string;
  demoUrl?: string;
  featured: boolean;
}

export type SkillCategoryKey =
  | "programming"
  | "gameDev"
  | "modeling3D"
  | "graphicDesign"
  | "videoMotion"
  | "uiUx";

export interface SkillItem {
  name: string;
  description?: string;
  highlight?: boolean;
}

export interface SkillCategory {
  key: SkillCategoryKey;
  title: string;
  subtitle: string;
  accent: "lavender" | "blue" | "pink";
  skills: SkillItem[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  specialization: string;
  timeline: string;
  status: string;
  location: string;
  description: string;
  relevantCoursework: string[];
}

export interface ExperienceItem {
  role: string;
  organization: string;
  type: "Academic" | "Creative" | "Technical" | "Internship";
  timeline: string;
  description: string;
  responsibilities: string[];
  technologies?: string[];
}

export interface ProfileData {
  name: string;
  title: string;
  specialization: string;
  institution: string;
  bio: string[];
  tagline: string;
  contactEmail: string;
  socials: {
    github?: string;
    linkedin?: string;
    artstation?: string;
    itch?: string;
  };
}
