import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full bg-background flex flex-col">
      {/* Minimal public header */}
      <header className="border-b bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">Modonty</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Team Guidelines</p>
            </div>
          </div>
          <Link
            href="/login"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Admin Sign In →
          </Link>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
