import { getCompetences } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Blocks, Server, Monitor, TestTube, Brain, Users, type LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Blocks,
  Server,
  Monitor,
  TestTube,
  Brain,
  Users,
};

export function CompetencesSection() {
  const competences = getCompetences();

  return (
    <section className="py-20" id="competences">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="mb-12">
          <p className="mb-2 text-sm font-medium tracking-wider text-primary uppercase">
            What I do
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Competences</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {competences.map((comp) => {
            const Icon = iconMap[comp.icon] || Blocks;
            return (
              <div
                key={comp.id}
                className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/30 hover:bg-card/80"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">{comp.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {comp.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {comp.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
