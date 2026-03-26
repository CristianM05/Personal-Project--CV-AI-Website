"use client";

import { useChat } from "@/components/chat/chat-provider";
import { Button } from "@/components/ui/button";
import { Mail, Linkedin, MessageCircle } from "lucide-react";

export function ContactSection() {
  const { open } = useChat();

  return (
    <section className="border-t border-border py-20" id="contact">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="mx-auto max-w-lg text-center">
          <p className="mb-2 text-sm font-medium tracking-wider text-primary uppercase">
            Get in touch
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground text-balance">
            {"Let's work together"}
          </h2>
          <p className="mb-8 text-muted-foreground leading-relaxed">
            {"Whether you have a project in mind, want to discuss an opportunity, or just want to chat about tech -- I'd love to hear from you."}
          </p>

          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href="mailto:c.magurenu@student.fontys.nl"
              className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-medium text-card-foreground transition-colors hover:border-primary/30 hover:bg-card/80"
            >
              <Mail className="h-4 w-4 text-primary" />
              Email
            </a>
            <a
              href="https://www.linkedin.com/in/magureanu-cristian/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-medium text-card-foreground transition-colors hover:border-primary/30 hover:bg-card/80"
            >
              <Linkedin className="h-4 w-4 text-primary" />
              LinkedIn
            </a>
          </div>

          <Button variant="outline" onClick={open} className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Or ask my CV directly
          </Button>
        </div>
      </div>
    </section>
  );
}
