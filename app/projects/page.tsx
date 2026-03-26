"use client";

import { useState } from "react";
import { getProjects, getEvidenceById } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, ExternalLink, CheckCircle2, ChevronDown, ChevronUp, FileText, Image, Link as LinkIcon } from "lucide-react";

const typeIcons = {
  pdf: FileText,
  image: Image,
  link: LinkIcon,
};

const ALL_TAGS = ["All", "AI/ML", "Full-stack", "Backend", "Frontend", "Data", "DevOps", "Security", "Architecture"];

export default function ProjectsPage() {
  const projects = getProjects();
  const [activeTag, setActiveTag] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showEvidenceId, setShowEvidenceId] = useState<string | null>(null);

  const filtered = activeTag === "All" ? projects : projects.filter((p) => p.tags.includes(activeTag));

  return (
    <div className="py-12">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium tracking-wider text-primary uppercase">Portfolio</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">Projects</h1>
          <p className="mt-2 text-muted-foreground">A curated selection of projects showcasing my technical breadth.</p>
        </div>

        {/* Tag filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          {ALL_TAGS.map((tag) => (
            <Button
              key={tag}
              variant={activeTag === tag ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTag(tag)}
              className="text-xs"
            >
              {tag}
            </Button>
          ))}
        </div>

        {/* Project list */}
        <div className="flex flex-col gap-4">
          {filtered.map((project) => {
            const isExpanded = expandedId === project.id;
            const showEvidence = showEvidenceId === project.id;
            const linkedEvidence = project.evidenceIds.map((id) => getEvidenceById(id)).filter(Boolean);

            return (
              <div
                key={project.id}
                className="rounded-lg border border-border bg-card transition-colors hover:border-primary/20"
              >
                {/* Summary row */}
                <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    <h2 className="text-xl font-semibold text-card-foreground">{project.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{project.oneLiner}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded bg-secondary px-2 py-0.5 font-mono text-xs text-secondary-foreground"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedId(isExpanded ? null : project.id)}
                    >
                      {isExpanded ? "Collapse" : "Details"}
                      {isExpanded ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                    </Button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-border px-6 pb-6 pt-4">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <h3 className="mb-2 text-xs font-semibold text-foreground uppercase tracking-wider">Overview</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">{project.description}</p>
                      </div>
                      <div>
                        <h3 className="mb-2 text-xs font-semibold text-foreground uppercase tracking-wider">My Role</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">{project.myRole}</p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="mb-2 text-xs font-semibold text-foreground uppercase tracking-wider">Key Highlights</h3>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {project.highlights.map((h, i) => (
                          <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Evidence drawer toggle */}
                    {linkedEvidence.length > 0 && (
                      <div className="mt-6">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setShowEvidenceId(showEvidence ? null : project.id)}
                        >
                          {showEvidence ? "Hide" : "Show"} Evidence ({linkedEvidence.length})
                          {showEvidence ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                        </Button>

                        {showEvidence && (
                          <div className="mt-3 flex flex-col gap-2">
                            {linkedEvidence.map((ev) => {
                              if (!ev) return null;
                              const Icon = typeIcons[ev.type];
                              return (
                                <div key={ev.id} className="flex gap-3 rounded-md border border-border bg-secondary/50 p-3">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-secondary text-muted-foreground">
                                    <Icon className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-foreground">{ev.title}</p>
                                    <p className="text-xs leading-relaxed text-muted-foreground">{ev.notes}</p>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {ev.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="rounded-lg border border-border bg-card py-16 text-center">
              <p className="text-sm text-muted-foreground">No projects match the selected filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
