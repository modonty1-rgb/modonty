"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ar } from "@/lib/ar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { createSeoIntake } from "../actions/seo-actions";
import type { SeoIntake } from "@prisma/client";
import {
  INTAKE_SECTIONS,
  getAllQuestionIds,
  getCountableQuestionIds,
  getAllChecklistIds,
  getFieldConfig,
  getQuestionHelp,
  PROFILE_SOURCED_QUESTION_IDS,
} from "../helpers/intake-questions";
import { cn } from "@/lib/utils";
import { IntakeField } from "./intake-field";
import { SeoSubNav } from "./seo-sub-nav";

const AUXILIARY_KEYS = ["q10_tools", "q44_count"];

const PROFILE_SOURCED_SET = new Set(PROFILE_SOURCED_QUESTION_IDS);
/** 1-based display index for countable questions only (excludes profile-sourced). */
function buildCountableDisplayIndex(): Record<string, number> {
  const map: Record<string, number> = {};
  let i = 1;
  for (const section of INTAKE_SECTIONS) {
    for (const q of section.questions) {
      if (!PROFILE_SOURCED_SET.has(q.id)) map[q.id] = i++;
    }
  }
  return map;
}
const COUNTABLE_DISPLAY_INDEX = buildCountableDisplayIndex();

function getInitialAnswers(
  existing: Record<string, unknown>,
  questionIds: string[],
  checklistIds: string[]
): Record<string, string> {
  const out: Record<string, string> = {};
  const allIds = new Set([...questionIds, ...checklistIds, ...AUXILIARY_KEYS]);
  for (const id of allIds) {
    let v = existing[id];
    let str =
      typeof v === "string"
        ? v
        : Array.isArray(v)
          ? JSON.stringify(v)
          : v !== null && typeof v === "object"
            ? JSON.stringify(v)
            : "";
    const config = getFieldConfig(id);
    if (config?.options && (config.type === "select") && str.trim()) {
      const inOptions = config.options.some((o) => o.value === str);
      if (!inOptions && config.allowOther) {
        out[`${id}_other`] = str;
        str = "other";
      } else if (!inOptions) {
        str = "";
          }
    }
    out[id] = str;
  }
  for (const id of checklistIds) {
    const noteKey = `${id}_note`;
    if (!(noteKey in out)) {
      const v = existing[noteKey];
      out[noteKey] = typeof v === "string" ? v : "";
    }
  }
  for (const [k, v] of Object.entries(existing)) {
    if (typeof k === "string" && (k.endsWith("_other") || k.endsWith("_note")) && typeof v === "string" && v.trim()) {
      out[k] = v;
    }
  }
  return out;
}

function isQuestionDone(id: string, answers: Record<string, string>, config: ReturnType<typeof getFieldConfig>): boolean {
  const v = (answers[id] ?? "").trim();
  if (config?.type === "multiselect") {
    try {
      const arr = JSON.parse(v || "[]") as unknown;
      return Array.isArray(arr) && arr.length > 0;
    } catch {
      return v.length > 0;
    }
  }
  return v.length > 0;
}

function shouldShowSection(sectionId: string, answers: Record<string, string>): boolean {
  switch (sectionId) {
    case "s4": // الموقع حالياً
      return answers.q0 === "yes";
    case "s6": // صفحات الموقع
      return answers.q0 === "yes";
    case "s7": // الظهور المحلي
      return answers.q44 === "yes";
    case "s8": // المتجر الإلكتروني
      return !!answers.q50 && answers.q50 !== "none";
    default:
      return true;
  }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://modonty.com";

const IS_DEV = process.env.NODE_ENV === "development";

function buildTestAnswers(): Record<string, string> {
  const questionIdsFull = getAllQuestionIds();
  const checklistIds = getAllChecklistIds();
  const allIds = new Set([...questionIdsFull, ...checklistIds, ...AUXILIARY_KEYS]);
  const out: Record<string, string> = {};
  for (const id of allIds) {
    const config = getFieldConfig(id);
    if (config?.type === "select" && config.options?.length) {
      out[id] = config.options[0].value ?? "";
    } else if (config?.type === "multiselect" && config.options?.length) {
      out[id] = JSON.stringify([config.options[0].value]);
    } else if (config?.type === "textarea" || config?.type === "input") {
      out[id] = "عينة تجريبية";
    }
  }
  out.q0 = "yes";
  out.q44 = "yes";
  out.q50 = "1_50";
  out.q44_count = "2";
  out.q10_tools = JSON.stringify(["gtm", "ga4"]);
  return out;
}

export function IntakeTab({
  clientId,
  clientSlug = null,
  clientUrl = null,
  clientSameAs = null,
  latestIntake,
}: {
  clientId: string;
  clientSlug?: string | null;
  clientUrl?: string | null;
  clientSameAs?: string[] | null;
  latestIntake: SeoIntake | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const questionIdsFull = useMemo(() => getAllQuestionIds(), []);
  const countableQuestionIds = useMemo(() => getCountableQuestionIds(), []);
  const checklistIds = useMemo(() => getAllChecklistIds(), []);
  const existingAnswers = (latestIntake?.answers as Record<string, unknown>) ?? {};
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const a = getInitialAnswers(existingAnswers, questionIdsFull, checklistIds);
    if (a.q0 === "modonty_page" || !a.q0?.trim()) {
      a.q0 = clientUrl?.trim() ? "yes" : "no";
    }
    return a;
  });

  const visibleNavItems = useMemo(() => {
    return INTAKE_SECTIONS.filter((s) => shouldShowSection(s.id, answers)).map((s) => ({
      id: s.id,
      title: s.title,
    }));
  }, [answers]);

  const visibleQuestionIds = useMemo(() => {
    return countableQuestionIds.filter((id) => {
      const section = INTAKE_SECTIONS.find((s) => s.questions.some((q) => q.id === id));
      if (!section) return true;
      return shouldShowSection(section.id, answers);
    });
  }, [answers, countableQuestionIds]);

  const answeredCount = useMemo(() => {
    let n = 0;
    for (const id of visibleQuestionIds) {
      if (isQuestionDone(id, answers, getFieldConfig(id))) n++;
    }
    return n;
  }, [answers, visibleQuestionIds]);
  const totalCount = visibleQuestionIds.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload: Record<string, unknown> = {};
    const allowedKeys = new Set([
      ...countableQuestionIds,
      ...AUXILIARY_KEYS,
      ...countableQuestionIds.map((id) => `${id}_other`),
    ]);
    for (const [k, v] of Object.entries(answers)) {
      if (!allowedKeys.has(k)) continue;
      const trimmed = typeof v === "string" ? v.trim() : v;
      if (trimmed === "") continue;
      if (k === "q10_tools") {
        try {
          payload[k] = JSON.parse(trimmed as string) as unknown;
        } catch {
          payload[k] = trimmed;
        }
      } else {
        payload[k] = trimmed;
      }
    }
    const res = await createSeoIntake(clientId, payload);
    setLoading(false);
    if (res.success) router.refresh();
    else setError(res.error ?? "Failed");
  }

  function setAnswer(id: string, value: string) {
    setAnswers((p) => ({ ...p, [id]: value }));
  }

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <Card className="text-right shadow-sm hover:shadow-md transition-shadow rounded-lg border border-border">
        <CardHeader className="p-4 text-right">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-1 text-right">
            <p className="text-xs leading-normal text-muted-foreground" aria-live="polite">
              {answeredCount} / {totalCount} مكتمل
            </p>
            {clientSlug && (
              <a
                href={`${SITE_URL.replace(/\/$/, "")}/${clientSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors w-fit text-right"
              >
                <span>رابطك:</span>
                <span className="underline">{SITE_URL.replace(/\/$/, "")}/{clientSlug}</span>
              </a>
            )}
          </div>
          <h1 className="text-2xl font-semibold leading-tight text-foreground mt-2 text-right">{ar.nav.seo}</h1>
          <p className="text-sm text-muted-foreground mt-1 text-right">إدارة بيانات SEO واستمارة الاستقبال والمنافسين والكلمات المفتاحية</p>
          <p className="text-base leading-relaxed text-foreground mt-2 text-right">
            {ar.seo.heroDescription}
          </p>
          <p className="text-sm leading-normal text-muted-foreground mt-1 text-right">
            الإجابات المعبأة تظهر بخلفية ملونة لتتبع ما تم إنجازه.
          </p>
          <p className="text-sm leading-normal text-muted-foreground mt-1 text-right">
            هدف الاستمارة: جمع معلومات تساعد مودونتي على كتابة مقالات صحيحة وقوية لمشروعك.
          </p>
        </CardHeader>
      </Card>

      <SeoSubNav />

      <form onSubmit={handleSubmit} className="space-y-6 text-end">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md text-end">{error}</div>
          )}

          <div dir="rtl" className="space-y-4">
            {visibleNavItems.map((item, index) => {
              const section = INTAKE_SECTIONS.find((s) => s.id === item.id);
              if (!section) return null;
              const isFirst = index === 0;
              const sectionQuestions = section.questions.filter((q) => !PROFILE_SOURCED_SET.has(q.id));
              const sectionTotal = sectionQuestions.length;
              const sectionAnswered = sectionQuestions.filter((q) => isQuestionDone(q.id, answers, getFieldConfig(q.id))).length;
              return (
                <Collapsible key={item.id} defaultOpen={isFirst} className={cn("group rounded-lg border overflow-hidden bg-card", isFirst ? "border-border" : "border-primary/30")}>
                  <CollapsibleTrigger className={cn("flex w-full items-center justify-between gap-2 px-4 py-3 text-sm font-medium transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-t-lg outline-none", isFirst ? "bg-muted/50 hover:bg-muted data-[state=open]:bg-muted" : "bg-primary/10 hover:bg-primary/15 data-[state=open]:bg-primary/15")}>
                    <ChevronDown className="size-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" aria-hidden />
                    <span className="flex-1 flex items-center justify-end gap-2 text-right">
                      <span>{section.title}</span>
                      <span className="text-muted-foreground font-normal" aria-label={`${sectionAnswered} من ${sectionTotal} مكتمل`}>
                        {sectionAnswered}/{sectionTotal}
                      </span>
                    </span>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <Card className="overflow-hidden rounded-none border-0 border-t border-border text-end shadow-none">
                      {item.id === "s2" || item.id === "s5" ? (
                        <CardHeader className="p-4 py-3">
                          {item.id === "s2" && (
                            <p className="text-xs text-muted-foreground">
                              {ar.profile.goalsDisclaimer}
                            </p>
                          )}
                          {item.id === "s5" && (
                            <p className="text-xs text-muted-foreground">
                              {ar.seo.keywordsTabNote}
                            </p>
                          )}
                        </CardHeader>
                      ) : null}
                      <CardContent className={cn("space-y-4", item.id === "s2" || item.id === "s5" ? "pt-0" : "pt-4")}>
                        {section.questions.filter((q) => !PROFILE_SOURCED_SET.has(q.id)).map((q) => {
                          const config = getFieldConfig(q.id);
                          const value = answers[q.id] ?? "";
                          const extraValue = answers[`${q.id}_other`] ?? "";
                          const isDone = isQuestionDone(q.id, answers, config);
                          return (
                            <div key={q.id} className="space-y-2">
                              <IntakeField
                                id={q.id}
                                label={`${COUNTABLE_DISPLAY_INDEX[q.id] ?? ""}. ${q.text}`}
                                placeholder={q.placeholder}
                                config={config}
                                value={value}
                                extraValue={extraValue}
                                onValueChange={setAnswer}
                                onExtraChange={setAnswer}
                                isDone={isDone}
                                helpContent={getQuestionHelp(q.id)}
                              />
                              {q.id === "q44" && value === "yes" && (
                                <div className="rounded-md p-3 border-s-4 border-primary bg-muted/30">
                                  <Label htmlFor="q44_count" className="text-sm font-normal">
                                    عدد المواقع/الفروع
                                  </Label>
                                  <Input
                                    id="q44_count"
                                    value={answers.q44_count ?? ""}
                                    onChange={(e) => setAnswer("q44_count", e.target.value)}
                                    placeholder="مثال: 1، 5"
                                    className="mt-1.5"
                                  />
                                </div>
                              )}
                              {q.id === "q10" && value === "yes" && (
                                <IntakeField
                                  id="q10_tools"
                                  label="أي أدوات تتبع التحويلات؟"
                                  placeholder="اختر الأدوات"
                                  config={getFieldConfig("q10_tools")}
                                  value={answers.q10_tools ?? ""}
                                  onValueChange={setAnswer}
                                  isDone={(answers.q10_tools ?? "").trim().length > 0}
                                />
                              )}
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {IS_DEV && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setAnswers((prev) => ({ ...prev, ...buildTestAnswers() }))}
              >
                تعبئة تجريبية (dev)
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "جاري الحفظ…" : ar.seo.saveIntake}
            </Button>
          </div>
      </form>
    </div>
  );
}
