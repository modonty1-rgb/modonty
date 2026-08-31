"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  GUIDELINE_STAGES,
  GUIDELINE_FOUNDATION,
} from "@/app/(public)/guidelines/lib/sections";

/**
 * The guideline hub's side navigation.
 *
 * It reads the SAME list the directory page reads (`guidelines/lib/sections`). It used to
 * keep its own hand-written copy, which silently went stale: it still linked «البراند» as a
 * separate page after that merged into the identity page, and never showed any section added
 * afterwards. One list, one truth — adding a section here is impossible to forget.
 */
export function HubSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/");

  const linkClass = (href: string) =>
    cn(
      "flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] transition-colors",
      isActive(href)
        ? "bg-primary text-primary-foreground"
        : "text-foreground/70 hover:bg-muted hover:text-foreground",
    );

  return (
    <aside className="sticky top-[49px] hidden h-[calc(100vh-49px)] w-[260px] shrink-0 overflow-y-auto border-e bg-card/40 backdrop-blur-sm lg:block">
      <nav className="space-y-5 p-4">
        <Link href="/guidelines" className={linkClass("/guidelines")}>
          <BookOpen className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate font-semibold">دليل الفريق</span>
        </Link>

        {GUIDELINE_STAGES.map((stage) => (
          <div key={stage.n}>
            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {stage.n} · {stage.title}
            </p>
            <div className="space-y-0.5">
              {stage.items.map((item) => (
                <Link key={item.id} href={`/guidelines/${item.id}`} className={linkClass(`/guidelines/${item.id}`)}>
                  <item.icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div>
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            الأساس
          </p>
          <div className="space-y-0.5">
            {GUIDELINE_FOUNDATION.map((item) => (
              <Link key={item.id} href={`/guidelines/${item.id}`} className={linkClass(`/guidelines/${item.id}`)}>
                <item.icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}
