"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { CommentStatus } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Check,
  X,
  Trash2,
  RotateCcw,
  Search as SearchIcon,
  UserCircle2,
  CornerDownLeft,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import type { ClientCommentWithDetails } from "../helpers/client-comment-queries";
import {
  approveClientComment,
  rejectClientComment,
  deleteClientComment,
  restoreClientComment,
} from "../actions/client-comment-actions";

interface Props {
  comments: ClientCommentWithDetails[];
}

type FilterKey = "all" | CommentStatus;

function fmt(d: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

function statusMeta(status: CommentStatus) {
  if (status === "PENDING")
    return { label: "بانتظار المراجعة", classes: "bg-amber-50 text-amber-700 ring-amber-200" };
  if (status === "APPROVED")
    return { label: "معتمد", classes: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
  if (status === "REJECTED")
    return { label: "مرفوض", classes: "bg-red-50 text-red-700 ring-red-200" };
  return { label: "محذوف", classes: "bg-slate-100 text-slate-600 ring-slate-200" };
}

export function ClientCommentsTable({ comments }: Props) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    let r = comments;
    if (filter !== "all") r = r.filter((c) => c.status === filter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      r = r.filter(
        (c) =>
          c.content.toLowerCase().includes(q) ||
          (c.author?.name ?? "").toLowerCase().includes(q) ||
          (c.author?.email ?? "").toLowerCase().includes(q)
      );
    }
    return r;
  }, [comments, filter, query]);

  const counts = useMemo(
    () => ({
      all: comments.length,
      PENDING: comments.filter((c) => c.status === "PENDING").length,
      APPROVED: comments.filter((c) => c.status === "APPROVED").length,
      REJECTED: comments.filter((c) => c.status === "REJECTED").length,
      DELETED: comments.filter((c) => c.status === "DELETED").length,
    }),
    [comments]
  );

  function run(id: string, fn: () => Promise<{ success: boolean; error?: string }>, msg: string) {
    setActionId(id);
    startTransition(async () => {
      const res = await fn();
      if (res.success) toast.success(msg);
      else toast.error(res.error || "فشل التنفيذ");
      setActionId(null);
    });
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-4 p-6">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-sm">
            <SearchIcon className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث في المحتوى أو الكاتب..."
              className="ps-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterPill active={filter === "all"} onClick={() => setFilter("all")} label="الكل" count={counts.all} />
            <FilterPill active={filter === "PENDING"} onClick={() => setFilter("PENDING")} label="بانتظار" count={counts.PENDING} tone="amber" />
            <FilterPill active={filter === "APPROVED"} onClick={() => setFilter("APPROVED")} label="معتمد" count={counts.APPROVED} tone="emerald" />
            <FilterPill active={filter === "REJECTED"} onClick={() => setFilter("REJECTED")} label="مرفوض" count={counts.REJECTED} tone="red" />
            <FilterPill active={filter === "DELETED"} onClick={() => setFilter("DELETED")} label="محذوف" count={counts.DELETED} tone="slate" />
          </div>
        </div>

        {/* Body */}
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            لا توجد تعليقات تطابق الفلتر.
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => {
              const status = statusMeta(c.status);
              const isWorking = actionId === c.id;
              const isDeleted = c.status === "DELETED";
              const isRejected = c.status === "REJECTED";
              const isPending = c.status === "PENDING";
              const isApproved = c.status === "APPROVED";
              return (
                <div key={c.id} className="rounded-lg border bg-card p-4">
                  <div className="flex items-start gap-3">
                    <UserCircle2 className="h-9 w-9 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${status.classes}`}>
                          {status.label}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {c.author?.name || "زائر"}
                        </span>
                        {c.author?.email && (
                          <span className="text-[11px] text-muted-foreground">
                            · {c.author.email}
                          </span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {c.content}
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground tabular-nums">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {c._count.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsDown className="h-3 w-3" />
                            {c._count.dislikes}
                          </span>
                          <span className="flex items-center gap-1">
                            <CornerDownLeft className="h-3 w-3" />
                            {c._count.replies}
                          </span>
                          <span>·</span>
                          <span>{fmt(c.createdAt)}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(isDeleted || isRejected) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => run(c.id, () => restoreClientComment(c.id), "تمت الاستعادة")}
                              disabled={isWorking}
                              className="gap-1.5"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              استعادة
                            </Button>
                          )}
                          {!isApproved && !isDeleted && (
                            <Button
                              size="sm"
                              onClick={() => run(c.id, () => approveClientComment(c.id), "تمت الموافقة")}
                              disabled={isWorking}
                              className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                              <Check className="h-3.5 w-3.5" />
                              موافقة
                            </Button>
                          )}
                          {isPending && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => run(c.id, () => rejectClientComment(c.id), "تم الرفض")}
                              disabled={isWorking}
                              className="gap-1.5 border-destructive text-destructive hover:bg-destructive/10"
                            >
                              <X className="h-3.5 w-3.5" />
                              رفض
                            </Button>
                          )}
                          {!isDeleted && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => run(c.id, () => deleteClientComment(c.id), "تم الحذف")}
                              disabled={isWorking}
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              title="حذف"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  count,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  tone?: "amber" | "emerald" | "red" | "slate";
}) {
  const accent =
    !active && tone
      ? {
          amber: "border-amber-200 text-amber-700",
          emerald: "border-emerald-200 text-emerald-700",
          red: "border-red-200 text-red-700",
          slate: "border-slate-200 text-slate-600",
        }[tone]
      : "";
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className={`gap-2 whitespace-nowrap ${accent}`}
    >
      {label}
      <span
        className={`inline-flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums ${
          active ? "bg-background/20 text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        {count}
      </span>
    </Button>
  );
}
