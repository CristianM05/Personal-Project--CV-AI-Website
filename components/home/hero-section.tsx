"use client";

import { useChat } from "@/components/chat/chat-provider";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  const { open } = useChat();

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Subtle background accent */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm font-medium tracking-wider text-primary uppercase">
            ICT Student · Software Engineering & AI
          </p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground lg:text-6xl text-balance">
            {"Hi, I'm Cristian."}
          </h1>
          <p className="mb-8 text-lg leading-relaxed text-muted-foreground lg:text-xl text-pretty">
            I&apos;m an ICT student with a strong interest in software engineering, AI, and full-stack
            development. I enjoy working on real projects, from scientific data processing with
            Euclid telescope images to interactive installations like the GLOW festival.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/projects">
                View Projects
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" onClick={open}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Ask my CV
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
