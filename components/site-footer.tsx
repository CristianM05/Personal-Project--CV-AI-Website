import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row lg:px-6">
        <p className="text-balance text-center sm:text-left">
          {"AI-assisted portfolio demo. Built with Next.js & TypeScript."}
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:justify-end">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <Link href="/projects" className="transition-colors hover:text-foreground">
            Projects
          </Link>
          <Link href="/competences" className="transition-colors hover:text-foreground">
            Competences
          </Link>
          <Link href="/evidence" className="transition-colors hover:text-foreground">
            Evidence
          </Link>
          <Link href="/chat" className="transition-colors hover:text-foreground">
            Chat
          </Link>
        </div>
      </div>
    </footer>
  );
}
