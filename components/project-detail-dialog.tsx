"use client";

import { getProjectById, getEvidenceById } from "@/lib/data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Github, ExternalLink, FileText, Image, Link as LinkIcon, CheckCircle2 } from "lucide-react";

interface Props {
  projectId: string;
  open: boolean;
  onClose: () => void;
}

const typeIcons = {
  pdf: FileText,
  image: Image,
  link: LinkIcon,
};

export function ProjectDetailDialog({ projectId, open, onClose }: Props) {
  const project = getProjectById(projectId);
  if (!project) return null;

  const linkedEvidence = project.evidenceIds
    .map((id) => getEvidenceById(id))
    .filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl p-0">
        <ScrollArea className="max-h-[85vh]">
          <div className="p-6">
            <DialogHeader>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <DialogTitle className="text-2xl">{project.name}</DialogTitle>
              <DialogDescription className="text-base leading-relaxed">
                {project.oneLiner}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 flex flex-col gap-6">
              {/* Overview */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground uppercase tracking-wider">Overview</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{project.description}</p>
              </div>

              {/* My Role */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground uppercase tracking-wider">My Role</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{project.myRole}</p>
              </div>

              {/* Tech Stack */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground uppercase tracking-wider">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded bg-secondary px-2.5 py-1 font-mono text-xs text-secondary-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Highlights */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground uppercase tracking-wider">Key Highlights</h3>
                <ul className="flex flex-col gap-2">
                  {project.highlights.map((h, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Links */}
              <div className="flex gap-2">
                {project.repoUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="mr-1.5 h-4 w-4" />
                      Repository
                    </a>
                  </Button>
                )}
                {project.demoUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1.5 h-4 w-4" />
                      Live Demo
                    </a>
                  </Button>
                )}
              </div>

              {/* Evidence drawer */}
              {linkedEvidence.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-foreground uppercase tracking-wider">
                      Evidence ({linkedEvidence.length})
                    </h3>
                    <div className="flex flex-col gap-2">
                      {linkedEvidence.map((ev) => {
                        if (!ev) return null;
                        const Icon = typeIcons[ev.type];
                        return (
                          <div
                            key={ev.id}
                            className="flex gap-3 rounded-md border border-border bg-secondary/50 p-3"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-secondary text-muted-foreground">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-foreground">
                                {ev.title}
                              </p>
                              <p className="text-xs leading-relaxed text-muted-foreground">
                                {ev.notes}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
