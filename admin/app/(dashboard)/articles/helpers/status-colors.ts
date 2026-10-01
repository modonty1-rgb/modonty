import type { ArticleStatus } from "@prisma/client";

/**
 * One colour per article status — the «Advanced Table» palette (Client Quotas, 27 Sep 2026):
 * emerald published · indigo scheduled · sky waiting for approval · rose needs changes ·
 * violet draft · slate writing. `dot` marks a pill or badge, `text` a number.
 * Labels are the plain words Khalid chose, not the enum names.
 */
export const STATUS_TONE: Record<ArticleStatus, { label: string; dot: string; text: string; badge: string }> = {
  WRITING: {
    label: "يُكتب",
    dot: "bg-slate-400",
    text: "text-slate-600 dark:text-slate-300",
    badge: "bg-slate-500/15 text-slate-700 ring-slate-500/30 dark:text-slate-300",
  },
  DRAFT: {
    label: "مسودة",
    dot: "bg-violet-500",
    text: "text-violet-600 dark:text-violet-400",
    badge: "bg-violet-500/15 text-violet-700 ring-violet-500/30 dark:text-violet-300",
  },
  AWAITING_APPROVAL: {
    label: "بانتظار الموافقة",
    dot: "bg-sky-500",
    text: "text-sky-600 dark:text-sky-400",
    badge: "bg-sky-500/15 text-sky-700 ring-sky-500/30 dark:text-sky-300",
  },
  // Approved by the client, waiting for the team to pick a date — cyan, between «waiting»
  // (sky) and «scheduled» (indigo).
  APPROVED: {
    label: "معتمد بلا تاريخ",
    dot: "bg-cyan-500",
    text: "text-cyan-600 dark:text-cyan-400",
    badge: "bg-cyan-500/15 text-cyan-700 ring-cyan-500/30 dark:text-cyan-300",
  },
  NEEDS_REVISION: {
    label: "يحتاج تعديل",
    dot: "bg-rose-500",
    text: "text-rose-600 dark:text-rose-400",
    badge: "bg-rose-500/15 text-rose-700 ring-rose-500/30 dark:text-rose-300",
  },
  SCHEDULED: {
    label: "مجدول",
    dot: "bg-indigo-500",
    text: "text-indigo-600 dark:text-indigo-400",
    badge: "bg-indigo-500/15 text-indigo-700 ring-indigo-500/30 dark:text-indigo-300",
  },
  PUBLISHED: {
    label: "منشور",
    dot: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300",
  },
  PUBLISHED_ON_CLIENT_SITE: {
    label: "على موقع العميل",
    dot: "bg-teal-500",
    text: "text-teal-600 dark:text-teal-400",
    badge: "bg-teal-500/15 text-teal-700 ring-teal-500/30 dark:text-teal-300",
  },
  ARCHIVED: {
    label: "مؤرشف",
    dot: "bg-zinc-500",
    text: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground ring-border",
  },
};
