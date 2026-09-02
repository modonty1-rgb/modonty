"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { TASK_STATUS_META, type TaskStatusKey } from "../helpers/task-config";

/**
 * Board / mine switch, plus the per-column counters.
 *
 * The counters are READ-ONLY here, not filters: on a four-column board every
 * column is already on screen, so a pill that hid three of them would remove
 * the one thing a board is for. They are the `CountTab` shape from the admin
 * entity standard (label | count) so the numbers read the same as everywhere
 * else in the admin.
 */
export function TaskNav({
  counts,
}: {
  counts: Array<{ key: TaskStatusKey; label: string; count: number }>;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="hidden items-center gap-1.5 sm:flex">
        {counts.map(({ key, label, count }) => (
          <span
            key={key}
            className="inline-flex items-center overflow-hidden rounded-full border border-border text-xs font-medium"
          >
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-foreground">
              <span className={cn("size-1.5 rounded-full", TASK_STATUS_META[key].dot)} aria-hidden />
              {label}
            </span>
            <span className="border-s border-border bg-muted px-2 py-1 font-bold tabular-nums text-muted-foreground">
              {count}
            </span>
          </span>
        ))}
      </div>

      <nav className="flex items-center gap-1 rounded-full border border-border p-0.5" aria-label="عرض المهام">
        {[
          { href: "/tasks", label: "اللوح" },
          { href: "/tasks/mine", label: "مهامي" },
        ].map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
