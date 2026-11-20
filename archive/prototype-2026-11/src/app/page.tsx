import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { EducationExperienceSection } from "@/components/sections/EducationExperienceSection";
import { VideoSection } from "@/components/sections/VideoSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Fixed Responsive Navigation */}
      <Navbar />

      {/* Main Single Page Portfolio Flow */}
      <main className="relative">
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection />
        <EducationExperienceSection />
        <VideoSection />
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
