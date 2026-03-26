"use client";

import { getProjects } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProjectDetailDialog } from "@/components/project-detail-dialog";

export function ProjectsSection() {
  const projects = getProjects();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <section className="border-t border-border py-20" id="projects">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="mb-2 text-sm font-medium tracking-wider text-primary uppercase">
              Selected work
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Projects</h2>
          </div>
          <Button variant="ghost" asChild className="hidden sm:flex">
            <Link href="/projects">
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {projects.slice(0, 3).map((project) => (
            <div
              key={project.id}
              className="group flex flex-col rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/30"
            >
              <div className="mb-3 flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h3 className="mb-1 text-lg font-semibold text-card-foreground">{project.name}</h3>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                {project.oneLiner}
              </p>
              <div className="mb-4 flex flex-wrap gap-1.5">
                {project.techStack.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="rounded bg-secondary px-2 py-0.5 font-mono text-xs text-secondary-foreground"
                  >
                    {tech}
                  </span>
                ))}
                {project.techStack.length > 4 && (
                  <span className="rounded bg-secondary px-2 py-0.5 font-mono text-xs text-muted-foreground">
                    +{project.techStack.length - 4}
                  </span>
                )}
              </div>
              <div className="mt-auto flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedId(project.id)}
                >
                  Open details
                </Button>
                {project.repoUrl && (
                  <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                    <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" aria-label={`GitHub repo for ${project.name}`}>
                      <Github className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {project.demoUrl && (
                  <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Demo for ${project.name}`}>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Button variant="outline" asChild>
            <Link href="/projects">
              View all projects
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {selectedId && (
        <ProjectDetailDialog
          projectId={selectedId}
          open={!!selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </section>
  );
}
