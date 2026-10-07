"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface DashboardTab {
  key: string;
  label: string;
  /** Short count beside the label — omitted when the tab has no single headline number. */
  count?: string;
  panel: React.ReactNode;
}

const STORAGE_KEY = "dashTab";

/**
 * The detail sections, one at a time (Khalid, 30 Sep 2026 — approved mockup
 * `documents/HTML/admin-dashboard-mockup.html`): fourteen stacked sections became tabs, so the
 * page is two screens instead of seven. The panels are server-rendered and passed in; this
 * only switches which one shows, and remembers the last tab per browser like the old
 * sections remembered open/closed.
 */
export function DashboardTabs({ tabs }: { tabs: DashboardTab[] }) {
  const [active, setActive] = useState(tabs[0]?.key);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && tabs.some((t) => t.key === saved)) setActive(saved);
    } catch {
      // storage blocked — the first tab stays
    }
  }, [tabs]);

  const pick = (key: string) => {
    setActive(key);
    try {
      window.localStorage.setItem(STORAGE_KEY, key);
    } catch {
      // storage blocked — the choice just isn't remembered
    }
  };

  return (
    <section className="rounded-xl border bg-card shadow-sm" aria-label="التفاصيل">
      {/* Negative top = the scrolling <main>'s padding (p-4 sm:p-6): at top-0 the bar stuck
          24px low and the panel showed through above it (measured 1 Oct 2026). */}
      <div
        role="tablist"
        aria-label="أقسام التفاصيل"
        className="sticky -top-4 z-10 flex flex-wrap gap-1 rounded-t-xl border-b bg-card px-3 py-2.5 sm:-top-6"
      >
        {tabs.map((t) => {
          const on = t.key === active;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              id={`tab-${t.key}`}
              aria-selected={on}
              aria-controls={`panel-${t.key}`}
              onClick={() => pick(t.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-bold transition-colors",
                on ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {t.label}
              {t.count && (
                <span className="rounded-full bg-muted px-1.5 py-px text-xs tabular-nums text-foreground">{t.count}</span>
              )}
            </button>
          );
        })}
      </div>
      {tabs.map((t) => (
        <div
          key={t.key}
          role="tabpanel"
          id={`panel-${t.key}`}
          aria-labelledby={`tab-${t.key}`}
          hidden={t.key !== active}
          className="p-4"
        >
          {t.panel}
        </div>
      ))}
    </section>
  );
}
