import { ChatPanel } from "@/components/chat/chat-panel";

export const metadata = {
  title: "Chat | Chris Portfolio",
  description: "Chat with my virtual CV about my projects, skills, and experience.",
};

export default function ChatPage() {
  return (
    <div className="py-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 lg:px-6">
        <header>
          <p className="mb-2 text-sm font-medium tracking-wider text-primary uppercase">Virtual CV</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
            Chat with me
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Ask me about my background, projects, technologies I use, or how I approach problems.
            I&apos;ll answer in first person and link to relevant portfolio evidence when it helps.
          </p>
        </header>

        <section className="rounded-lg border border-border bg-card">
          {/* Reuse the existing chat panel, but force it to render as if it were open */}
          <ChatPanel />
        </section>
      </div>
    </div>
  );
}

