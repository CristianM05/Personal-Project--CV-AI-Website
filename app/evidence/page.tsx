import { EvidenceSection } from "@/components/home/evidence-section";

export const metadata = {
  title: "Evidence | Chris Portfolio",
  description: "Supporting reports, diagrams, case studies, and other evidence for my work.",
};

export default function EvidencePage() {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <header className="mb-8">
          <p className="mb-2 text-sm font-medium tracking-wider text-primary uppercase">
            Supporting materials
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
            Evidence
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground leading-relaxed">
            Browse reports, diagrams, case studies, and other artefacts that back up the claims in
            my projects and competences. Use the search to quickly find relevant proof.
          </p>
        </header>

        <EvidenceSection />
      </div>
    </div>
  );
}

