import Link from "next/link";
import { BookOpen, XCircle } from "lucide-react";
import { HubSidebar } from "./components/hub-sidebar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full bg-background flex flex-col">
      {/* Minimal public header */}
      <header className="border-b bg-card/60 backdrop-blur-sm sticky top-0 z-20">
        <div className="px-6 py-3 flex items-center justify-between gap-3">
          <Link href="/guidelines" className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">Modonty</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Knowledge Hub</p>
            </div>
          </Link>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/guidelines/prohibitions"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border border-red-500/40 bg-red-500/[0.08] text-red-400 hover:bg-red-500/[0.15] hover:border-red-500/60 transition-colors"
              title="المرجع الموحّد لكل ممنوعات Modonty — SEO · Brand · Video"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>الممنوعات</span>
            </Link>
            <Link
              href="/login"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Admin Sign In →
            </Link>
          </div>
        </div>
      </header>

      {/* Body: persistent sidebar + scrollable main */}
      <div className="flex-1 flex overflow-hidden">
        <HubSidebar />
        <main className="flex-1 overflow-y-auto scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}
