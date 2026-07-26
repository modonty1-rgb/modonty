"use client";

import { useEffect, useMemo, useState } from "react";

import { AlertTriangle, ArrowLeft, Check, ChevronDown, GitMerge, Loader2, Search } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  getIndustryMergeImpact,
  prepareIndustryMerge,
  regenerateClientSeoForMerge,
  finalizeIndustryMerge,
  type IndustryMergeImpact,
} from "../actions/merge-industry-actions";

export interface IndustryLite {
  id: string;
  name: string;
  slug: string;
  count: number;
}

interface IndustryMergeDialogProps {
  source: IndustryLite;
  candidates: IndustryLite[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMerged: () => void;
}

type Phase = "form" | "running" | "done";

interface ProgressItem {
  id: string;
  title: string;
  status: "done" | "failed";
}

const isTestSlug = (slug: string) => slug.toLowerCase().split("-").includes("test");

export function IndustryMergeDialog({ source, candidates, open, onOpenChange, onMerged }: IndustryMergeDialogProps) {
  const { toast } = useToast();

  const [phase, setPhase] = useState<Phase>("form");
  const [search, setSearch] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [target, setTarget] = useState<IndustryLite | null>(null);
  const [impact, setImpact] = useState<IndustryMergeImpact | null>(null);
  const [confirmText, setConfirmText] = useState("");

  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<ProgressItem[]>([]);
  const [recap, setRecap] = useState<{ moved: number; regenerated: number } | null>(null);

  // Reset everything whenever the dialog is (re)opened.
  useEffect(() => {
    if (open) {
      setPhase("form");
      setSearch("");
      setPickerOpen(false);
      setTarget(null);
      setImpact(null);
      setConfirmText("");
      setCurrent(0);
      setTotal(0);
      setItems([]);
      setRecap(null);
    }
  }, [open]);

  // Fetch the real impact numbers when a target is picked (never invented figures).
  useEffect(() => {
    if (!target) {
      setImpact(null);
      return;
    }
    let alive = true;
    getIndustryMergeImpact(source.id, target.id).then((res) => {
      if (alive) setImpact(res);
    });
    return () => {
      alive = false;
    };
  }, [target, source.id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return candidates
      .filter((c) => c.id !== source.id)
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
  }, [candidates, search, source.id]);

  const confirmMatches = confirmText.trim() === source.name.trim();
  const canSubmit = !!target && confirmMatches && phase === "form";

  const handleMerge = async () => {
    if (!target) return;
    setPhase("running");
    setItems([]);
    setCurrent(0);

    const prep = await prepareIndustryMerge({
      sourceId: source.id,
      targetId: target.id,
      confirmName: confirmText,
    });

    if (!prep.success) {
      toast({ title: "Merge failed", description: prep.error, variant: "destructive" });
      setPhase("form");
      return;
    }

    const ids = prep.affectedClientIds ?? [];
    setTotal(ids.length);

    let regenerated = 0;
    for (let i = 0; i < ids.length; i++) {
      const res = await regenerateClientSeoForMerge(ids[i]);
      if (res.success) regenerated += 1;
      setItems((prev) => [
        ...prev,
        { id: ids[i], title: res.title ?? ids[i], status: res.success ? "done" : "failed" },
      ]);
      setCurrent(i + 1);
    }

    await finalizeIndustryMerge({ sourceId: source.id, targetId: target.id });

    setRecap({ moved: prep.movedCount ?? 0, regenerated });
    setPhase("done");
    toast({
      title: "تمّ الدمج",
      description: `نُقل العملاء إلى «${target.name}».`,
      variant: "success",
    });
  };

  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Don't allow closing mid-run.
        if (phase === "running") return;
        if (!next && phase === "done") onMerged();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-3xl" dir="rtl">
        {/* ---------- FORM ---------- */}
        {phase === "form" && (
          <>
            <DialogHeader className="text-start">
              <DialogTitle className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/15 text-violet-600 dark:text-violet-400">
                  <GitMerge className="h-4 w-4" />
                </span>
                دمج الصناعة في صناعة أخرى
              </DialogTitle>
              <DialogDescription>يُنقل كل العملاء إلى الوجهة، وتصبح الصناعة المصدر فارغة.</DialogDescription>
            </DialogHeader>

            {/* Two columns: right = pick target · left = review + confirm */}
            <div className="grid gap-5 sm:grid-cols-2">
              {/* ===== RIGHT column: choose destination ===== */}
              <div className="space-y-3">
                {/* source -> target */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">المصدر</div>
                    <div className="truncate text-sm font-bold">{source.name}</div>
                    <div className="text-[11px] text-muted-foreground">{source.count} عميل مرتبط</div>
                  </div>
                  <ArrowLeft className="h-5 w-5 text-violet-500" />
                  <div className="rounded-xl border border-violet-500/40 bg-violet-500/10 p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">الوجهة</div>
                    <div className="truncate text-sm font-bold">{target ? target.name : "— اختر —"}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {target ? `${target.count} عميل حالياً` : "لم تُختر بعد"}
                    </div>
                  </div>
                </div>

                {/* target picker — dropdown opens below the field, floats over the dialog */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-xs font-bold">
                    اختر صناعة الوجهة <span className="text-red-500">*</span>
                  </label>
                  <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 text-sm hover:bg-accent"
                      >
                        <span className={`flex items-center gap-1.5 truncate ${target ? "" : "text-muted-foreground"}`}>
                          {target ? (
                            <>
                              {target.name}
                              {isTestSlug(target.slug) && <AlertTriangle className="h-3 w-3 shrink-0 text-amber-500" />}
                            </>
                          ) : (
                            "— اختر صناعة الوجهة —"
                          )}
                        </span>
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-[--radix-popover-trigger-width] p-0" dir="rtl">
                      <div className="border-b p-2">
                        <div className="relative">
                          <Search className="absolute top-2.5 h-4 w-4 text-muted-foreground" style={{ insetInlineStart: "0.75rem" }} />
                          <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ابحث عن صناعة…"
                            className="h-9 ps-9"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filtered.length === 0 ? (
                          <div className="p-3 text-center text-xs text-muted-foreground">لا توجد صناعات مطابقة</div>
                        ) : (
                          filtered.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setTarget(c);
                                setPickerOpen(false);
                              }}
                              className={`flex w-full items-center justify-between border-t px-3 py-2 text-start text-sm first:border-t-0 hover:bg-accent ${
                                target?.id === c.id ? "bg-violet-500/15" : ""
                              }`}
                            >
                              <span className="flex items-center gap-1.5 truncate">
                                {c.name}
                                {isTestSlug(c.slug) && <AlertTriangle className="h-3 w-3 shrink-0 text-amber-500" />}
                              </span>
                              <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">{c.count} عميل</span>
                            </button>
                          ))
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* ===== LEFT column: impact + confirm ===== */}
              <div className="space-y-3">
                {!target ? (
                  <div className="flex h-full min-h-40 flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center">
                    <GitMerge className="mb-2 h-6 w-6 text-muted-foreground/50" />
                    <p className="text-xs text-muted-foreground">اختر صناعة الوجهة لعرض الأثر وتأكيد الدمج</p>
                  </div>
                ) : (
                  <>
                    {/* impact preview */}
                    <div className="rounded-xl border border-amber-500 bg-amber-500/10 p-3.5">
                      <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="h-4 w-4" /> ماذا سيحدث بالضبط
                      </div>
                      {impact ? (
                        <ul className="space-y-1.5 text-[12.5px]">
                          <li>
                            • <b className="tabular-nums">{impact.movedCount}</b> عميل يُنقل إلى «{target.name}».
                          </li>
                          <li>
                            • يُعاد توليد SEO + JSON-LD لـ<b className="tabular-nums">{impact.affectedCount}</b> عميل + صفحة الوجهة.
                          </li>
                          <li>
                            • يُسجَّل تحويل 308: <code dir="ltr" className="rounded bg-black/30 px-1 text-[11px] text-violet-500">/industries/{source.slug} → /industries/{target.slug}</code>
                          </li>
                          <li>• تصبح «{source.name}» بلا عملاء — تحذفها من الجدول عادي متى شئت.</li>
                        </ul>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> يحسب الأثر…
                        </div>
                      )}
                    </div>

                    {/* type-to-confirm gate */}
                    <div className="rounded-xl border border-red-500/40 bg-red-500/5 p-3">
                      <p className="mb-2 text-[12.5px] text-muted-foreground">
                        للتأكيد، اكتب اسم <span className="rounded bg-red-500/10 px-1.5 font-bold text-red-500">المصدر</span> حرفياً: «{source.name}»
                      </p>
                      <Input
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder={`اكتب: ${source.name}`}
                        className="border-red-500/40 text-center font-bold"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button
                onClick={handleMerge}
                disabled={!canSubmit}
                className="gap-2 bg-violet-600 text-white hover:bg-violet-700"
              >
                <GitMerge className="h-4 w-4" /> تنفيذ الدمج
              </Button>
            </div>
          </>
        )}

        {/* ---------- RUNNING ---------- */}
        {phase === "running" && (
          <>
            <DialogHeader className="text-start">
              <DialogTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                جارٍ الدمج… لا تُغلق النافذة
              </DialogTitle>
              <DialogDescription>
                {total > 0 ? `نقل عميل ${current} من ${total}` : "يجهّز النقل…"}
              </DialogDescription>
            </DialogHeader>

            <Progress value={pct} tone="default" />
            <div className="flex justify-between text-[11px] tabular-nums text-muted-foreground">
              <span>{pct}%</span>
              <span>
                {current} / {total} عميل
              </span>
            </div>

            <div className="max-h-52 overflow-y-auto rounded-lg border">
              {items.length === 0 ? (
                <div className="p-3 text-center text-xs text-muted-foreground">يبدأ النقل…</div>
              ) : (
                items.map((it, idx) => (
                  <div key={`${it.id}-${idx}`} className="flex items-center gap-2.5 border-t px-3 py-2 text-[12.5px] first:border-t-0">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        it.status === "done"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-red-500/15 text-red-600 dark:text-red-400"
                      }`}
                    >
                      {it.status === "done" ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    </span>
                    <span className="truncate text-muted-foreground">{it.title}</span>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ---------- DONE ---------- */}
        {phase === "done" && recap && (
          <>
            <DialogHeader className="items-center text-center">
              <span className="mb-1 flex items-center justify-center rounded-2xl border border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" style={{ height: "3.25rem", width: "3.25rem" }}>
                <Check className="h-6 w-6" />
              </span>
              <DialogTitle>تمّ الدمج بنجاح</DialogTitle>
              <DialogDescription>نُقل كل العملاء إلى «{target?.name}».</DialogDescription>
            </DialogHeader>

            <div className="space-y-2 text-[13px]">
              <div className="rounded-xl border bg-muted/40 px-3 py-2.5">
                <b className="tabular-nums">{recap.moved}</b> عميل نُقل إلى الوجهة.
              </div>
              <div className="rounded-xl border bg-muted/40 px-3 py-2.5">
                أُعيد توليد SEO + JSON-LD لـ<b className="tabular-nums">{recap.regenerated}</b> عميل + صفحة الوجهة + القوائم.
              </div>
              <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-2.5">
                سُجِّل تحويل 308 — يشتغل فور حذفك للمصدر من الجدول.
              </div>
            </div>

            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3.5 py-3">
              <div className="text-sm font-bold">
                {source.name} <span className="ms-1 rounded-full border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">بلا عملاء</span>
              </div>
              <div className="mt-1 text-[11.5px] text-muted-foreground">صارت فارغة — احذفها من الجدول عادي متى شئت.</div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  onMerged();
                  onOpenChange(false);
                }}
              >
                إغلاق
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
