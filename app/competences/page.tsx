import { CompetencesSection } from "@/components/home/competences-section";

export const metadata = {
  title: "Competences | Chris Portfolio",
  description: "Overview of my technical competences and skills.",
};

export default function CompetencesPage() {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <header className="mb-8">
          <p className="mb-2 text-sm font-medium tracking-wider text-primary uppercase">
            What I do
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
            Competences
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground leading-relaxed">
            A structured view of my core competence areas, from architecture and backend engineering
            to data/ML and collaboration. Each competence is backed by concrete projects and
            evidence in my portfolio.
          </p>
        </header>

        <CompetencesSection />
      </div>
    </div>
  );
}

