"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Image, Link as LinkIcon, Search } from "lucide-react";
import type { EvidenceItem } from "@/lib/data";

const typeIcons = {
  pdf: FileText,
  image: Image,
  link: LinkIcon,
};

export function EvidenceSection() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<EvidenceItem[]>([]);

  const fetchEvidence = useCallback(async (q: string) => {
    const res = await fetch(`/api/evidence/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setItems(data);
  }, []);

  useEffect(() => {
    fetchEvidence(query);
  }, [query, fetchEvidence]);

  return (
    <section className="border-t border-border py-20" id="evidence">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium tracking-wider text-primary uppercase">
              Supporting materials
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Evidence</h2>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search evidence..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = typeIcons[item.type];
            return (
              <div
                key={item.id}
                className="flex gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="mb-1 truncate text-sm font-medium text-card-foreground">
                    {item.title}
                  </p>
                  <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {item.notes}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {items.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No evidence items found matching your search.
          </div>
        )}
      </div>
    </section>
  );
}
