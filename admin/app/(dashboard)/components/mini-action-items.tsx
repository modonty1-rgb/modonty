import Link from "next/link";
import { ChevronLeft, CheckCircle2 } from "lucide-react";

import type { ReactNode } from "react";

export type ActionSeverity = "critical" | "warning" | "info" | "success";

export interface ActionItem {
  severity: ActionSeverity;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  href?: string;
}

interface MiniActionItemsProps {
  title?: string;
  items: ActionItem[];
  emptyMessage?: string;
}

const SEVERITY_BG: Record<ActionSeverity, string> = {
  critical: "bg-red-500/10 border-red-500/20 hover:bg-red-500/15",
  warning: "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15",
  info: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15",
  success: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15",
};

const SEVERITY_TEXT: Record<ActionSeverity, string> = {
  critical: "text-red-600 dark:text-red-400",
  warning: "text-amber-600 dark:text-amber-400",
  info: "text-blue-600 dark:text-blue-400",
  success: "text-emerald-600 dark:text-emerald-400",
};

function ActionRow({ item }: { item: ActionItem }) {
  const inner = (
    <div
      className={`flex items-start gap-2.5 p-3 rounded-lg border transition-colors ${SEVERITY_BG[item.severity]} ${item.href ? "cursor-pointer" : ""}`}
    >
      <div className={`shrink-0 mt-0.5 ${SEVERITY_TEXT[item.severity]}`}>{item.icon}</div>
      <div className="flex-1 min-w-0">
        <div className={`font-bold text-sm leading-tight ${SEVERITY_TEXT[item.severity]}`}>
          {item.title}
        </div>
        {item.subtitle && (
          <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
            {item.subtitle}
          </div>
        )}
      </div>
      {item.href && <ChevronLeft className={`h-4 w-4 shrink-0 mt-0.5 ${SEVERITY_TEXT[item.severity]}`} />}
    </div>
  );

  if (item.href) {
    return (
      <Link href={item.href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

export function MiniActionItems({
  title = "Needs Your Attention",
  items,
  emptyMessage = "All caught up — nothing urgent.",
}: MiniActionItemsProps) {
  return (
    <div>
      <h3 className="text-[11px] text-muted-foreground font-bold mb-3 uppercase tracking-wider">
        {title}
      </h3>

      {items.length === 0 ? (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <ActionRow key={`${item.title}-${i}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
