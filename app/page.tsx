import { HeroSection } from "@/components/home/hero-section";
import { CompetencesSection } from "@/components/home/competences-section";
import { ProjectsSection } from "@/components/home/projects-section";
import { EvidenceSection } from "@/components/home/evidence-section";
import { ContactSection } from "@/components/home/contact-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CompetencesSection />
      <ProjectsSection />
      <EvidenceSection />
      <ContactSection />
    </>
  );
}
