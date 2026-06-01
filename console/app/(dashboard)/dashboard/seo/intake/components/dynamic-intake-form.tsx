"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText, Heart, Users, MessageCircleQuestion, Target, Mic2, Lightbulb,
  ShieldAlert, Swords, MapPin, Stethoscope, ListChecks,
  CheckCircle2, AlertCircle, Loader2,
} from "lucide-react";
import { saveIntakeAction } from "../actions/save-intake";
import type { ClientIntake } from "../lib/intake-types";
import type { IntakeFormDef, IntakeQuestionDef, IntakeOptionDef } from "../lib/intake-queries";

// lucide icon name (stored on section.icon) → component
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText, Heart, Users, MessageCircleQuestion, Target, Mic2, Lightbulb,
  ShieldAlert, Swords, MapPin, Stethoscope,
};

type MarketCountry = "SA" | "EG";
type AnyObj = Record<string, unknown>;

interface DynamicIntakeFormProps {
  form: IntakeFormDef;
  initial: AnyObj | null;
  intakeUpdatedAt: Date | null;
  detectedGbpUrl?: string | null;
  isYmyl: boolean;
  country?: string | null;
}

// ─── dotted-path helpers — answers stay in the exact Client.intake shape ─────
function getAtPath(obj: AnyObj, path: string): unknown {
  return path.split(".").reduce<unknown>(
    (acc, k) => (acc && typeof acc === "object" ? (acc as AnyObj)[k] : undefined),
    obj,
  );
}
function setAtPath(obj: AnyObj, path: string, value: unknown): AnyObj {
  const keys = path.split(".");
  const root: AnyObj = { ...obj };
  let cur: AnyObj = root;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const next = cur[k];
    cur[k] = next && typeof next === "object" ? { ...(next as AnyObj) } : {};
    cur = cur[k] as AnyObj;
  }
  cur[keys[keys.length - 1]] = value;
  return root;
}

const asString = (v: unknown): string => (typeof v === "string" ? v : "");
const asArray = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);
const asBool = (v: unknown): boolean => v === true;

function detectDefaultMarket(country: string | null | undefined): MarketCountry {
  if (!country) return "SA";
  const lower = country.toLowerCase();
  if (lower.includes("مصر") || lower.includes("egypt") || lower === "eg") return "EG";
  return "SA";
}

function questionConfig(q: IntakeQuestionDef): AnyObj {
  return (q.config && typeof q.config === "object" ? q.config : {}) as AnyObj;
}

function isFilled(q: IntakeQuestionDef, value: unknown): boolean {
  switch (q.type) {
    case "BOOLEAN":
      return value === true;
    case "MULTI_PILL":
    case "CHECKBOX":
      if (Array.isArray(value)) return value.length > 0;
      return asString(value).trim().length > 0; // joinedString multipill
    case "REPEATED_GROUP":
      return Array.isArray(value) && value.some((row) => row && typeof row === "object" &&
        Object.values(row as AnyObj).some((x) => asString(x).trim().length > 0));
    default:
      return asString(value).trim().length > 0;
  }
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm transition ${
        active ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

export function DynamicIntakeForm({
  form, initial, intakeUpdatedAt, detectedGbpUrl, isYmyl, country,
}: DynamicIntakeFormProps) {
  const [marketCountry, setMarketCountry] = useState<MarketCountry>(detectDefaultMarket(country));
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(intakeUpdatedAt);
  const [error, setError] = useState<string | null>(null);
  // Render the saved-time only after mount — the formatted time differs between
  // server (UTC) and browser timezone, which would cause a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Seed state from saved answers; pre-fill auto-detected GBP if that field is empty.
  const [data, setData] = useState<AnyObj>(() => {
    let base: AnyObj = initial ? { ...initial } : {};
    if (detectedGbpUrl && !getAtPath(base, "technical.googleBusinessProfileUrl")) {
      base = setAtPath(base, "technical.googleBusinessProfileUrl", detectedGbpUrl);
    }
    return base;
  });

  const update = (path: string, value: unknown) => setData((prev) => setAtPath(prev, path, value));

  // Visible sections: drop YMYL-only sections for non-YMYL clients.
  const sections = useMemo(
    () =>
      form.sections.filter((s) => {
        const vis = (s.visibility && typeof s.visibility === "object" ? s.visibility : {}) as AnyObj;
        if (vis.ymylOnly === true && !isYmyl) return false;
        return true;
      }),
    [form.sections, isYmyl],
  );

  const allQuestions = useMemo(() => sections.flatMap((s) => s.questions), [sections]);
  const hasMarketScoped = useMemo(
    () => allQuestions.some((q) => q.options.some((o) => o.marketScope)),
    [allQuestions],
  );

  const visibleOptions = (q: IntakeQuestionDef): IntakeOptionDef[] =>
    q.options.filter((o) => !o.marketScope || o.marketScope === marketCountry);

  const totalFields = allQuestions.length;
  const filledFields = allQuestions.filter((q) => isFilled(q, getAtPath(data, q.key))).length;
  const progress = totalFields ? Math.round((filledFields / totalFields) * 100) : 0;

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const res = await saveIntakeAction(data as unknown as ClientIntake);
      if (res.ok) setSavedAt(new Date());
      else setError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Progress */}
      <div className="rounded-xl border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">اكتمال معلومات نشاطك</span>
          <span className="text-sm font-bold tabular-nums">{filledFields} / {totalFields} · {progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full transition-all duration-300 ${progress === 100 ? "bg-emerald-500" : "bg-primary"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Market toggle — only if some options are market-scoped */}
      {hasMarketScoped && (
        <div className="rounded-xl border bg-card p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Label className="text-sm font-bold">السوق المستهدف</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">نستخدمه لتخصيص المواسم ومصادر الاستشهاد</p>
            </div>
            <div className="inline-flex gap-1 rounded-lg border bg-muted/30 p-1">
              {(["SA", "EG"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMarketCountry(m)}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                    marketCountry === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "SA" ? "🇸🇦 السعودية" : "🇪🇬 مصر"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {sections.map((section, sIdx) => {
        const Icon = (section.icon && ICONS[section.icon]) || ListChecks;
        const filled = section.questions.filter((q) => isFilled(q, getAtPath(data, q.key))).length;
        const total = section.questions.length;
        const complete = total > 0 && filled === total;
        return (
          <Card key={section.id} className="overflow-hidden p-0">
            <div className="flex items-start gap-3 border-b px-6 pb-3 pt-6">
              <div className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl ${complete ? "bg-emerald-100 text-emerald-700" : "bg-primary/10 text-primary"}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground">{sIdx + 1}/{sections.length}</span>
                  <h3 className="text-base font-bold">{section.title}</h3>
                  {complete && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                </div>
                {section.description && <p className="mt-0.5 text-xs text-muted-foreground">{section.description}</p>}
              </div>
              <span className={`flex-shrink-0 rounded-full px-2 py-1 text-xs font-medium ${complete ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                {filled}/{total}
              </span>
            </div>
            <CardContent className="space-y-5 p-6">
              {section.questions.map((q) => (
                <QuestionField
                  key={q.id}
                  question={q}
                  value={getAtPath(data, q.key)}
                  options={visibleOptions(q)}
                  onChange={(v) => update(q.key, v)}
                />
              ))}
            </CardContent>
          </Card>
        );
      })}

      {/* Sticky save */}
      <div className="sticky bottom-4 z-30">
        <div className="flex items-center justify-between gap-4 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur">
          <div className="flex items-center gap-2 text-xs">
            {pending ? (
              <><Loader2 className="h-4 w-4 animate-spin text-primary" /><span className="text-muted-foreground">جارٍ الحفظ...</span></>
            ) : savedAt ? (
              <><CheckCircle2 className="h-4 w-4 text-emerald-600" /><span className="font-medium text-emerald-700">حُفظ{mounted ? ` · ${new Intl.DateTimeFormat("ar-SA", { timeStyle: "short" }).format(savedAt)}` : ""}</span></>
            ) : (
              <span className="text-muted-foreground">جاهز للحفظ</span>
            )}
          </div>
          <Button onClick={handleSave} disabled={pending} size="sm" className="font-bold">
            {pending ? "جارٍ الحفظ..." : "حفظ التغييرات"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── One question, rendered by type ───────────────────────────────────────────
function QuestionField({
  question, value, options, onChange,
}: {
  question: IntakeQuestionDef;
  value: unknown;
  options: IntakeOptionDef[];
  onChange: (value: unknown) => void;
}) {
  const cfg = questionConfig(question);
  const dir = cfg.dir === "ltr" ? "ltr" : undefined;

  const labelBlock = (
    <div className="space-y-1">
      <Label className="text-sm">{question.label}</Label>
      {question.helpText && <p className="text-xs text-muted-foreground">{question.helpText}</p>}
    </div>
  );

  switch (question.type) {
    case "TEXT":
      return (
        <div className="space-y-2">
          {labelBlock}
          <Input
            dir={dir}
            value={asString(value)}
            maxLength={question.maxLength ?? undefined}
            placeholder={question.placeholder ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    case "TEXTAREA":
      return (
        <div className="space-y-2">
          {labelBlock}
          <Textarea
            rows={3}
            value={asString(value)}
            maxLength={question.maxLength ?? undefined}
            placeholder={question.placeholder ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    case "SELECT":
      return (
        <div className="space-y-2">
          {labelBlock}
          <select
            value={asString(value)}
            onChange={(e) => onChange(e.target.value || null)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">— اختر —</option>
            {options.map((o) => <option key={o.id} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      );

    case "RADIO":
      return (
        <div className="space-y-2">
          {labelBlock}
          <div className="grid grid-cols-1 gap-2">
            {options.map((o) => {
              const active = asString(value) === o.value;
              return (
                <label key={o.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition ${active ? "border-primary bg-primary/5" : "border-input hover:bg-muted"}`}>
                  <input type="radio" name={question.id} checked={active} onChange={() => onChange(o.value)} />
                  {o.label}
                </label>
              );
            })}
          </div>
        </div>
      );

    case "CHECKBOX": {
      const arr = asArray(value);
      return (
        <div className="space-y-2">
          {labelBlock}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {options.map((o) => {
              const active = arr.includes(o.value);
              return (
                <label key={o.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition ${active ? "border-primary bg-primary/5" : "border-input hover:bg-muted"}`}>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => onChange(active ? arr.filter((x) => x !== o.value) : [...arr, o.value])}
                  />
                  {o.label}
                </label>
              );
            })}
          </div>
        </div>
      );
    }

    case "MULTI_PILL": {
      const joined = cfg.storeAs === "joinedString";
      if (joined) {
        const current = asString(value);
        const selected = current.split(/[,،\n]/).map((s) => s.trim()).filter(Boolean);
        const toggle = (optVal: string) => {
          const next = selected.includes(optVal) ? selected.filter((s) => s !== optVal) : [...selected, optVal];
          onChange(next.join("، "));
        };
        return (
          <div className="space-y-3">
            {labelBlock}
            <div className="flex flex-wrap gap-2">
              {options.map((o) => <Pill key={o.id} active={selected.includes(o.value)} onClick={() => toggle(o.value)}>{o.label}</Pill>)}
            </div>
            {cfg.allowCustom === true && (
              <Input value={current} onChange={(e) => onChange(e.target.value)} placeholder="مصادر إضافية (مفصولة بفواصل)" />
            )}
          </div>
        );
      }
      const arr = asArray(value);
      return (
        <div className="space-y-2">
          {labelBlock}
          <div className="flex flex-wrap gap-2">
            {options.map((o) => {
              const active = arr.includes(o.value);
              return (
                <Pill key={o.id} active={active} onClick={() => onChange(active ? arr.filter((x) => x !== o.value) : [...arr, o.value])}>
                  {o.label}
                </Pill>
              );
            })}
          </div>
        </div>
      );
    }

    case "BOOLEAN":
      return (
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm">
          <input type="checkbox" checked={asBool(value)} onChange={(e) => onChange(e.target.checked)} />
          <span>{question.label}</span>
        </label>
      );

    case "REPEATED_GROUP": {
      const count = typeof cfg.count === "number" ? cfg.count : 3;
      const itemLabel = typeof cfg.itemLabel === "string" ? cfg.itemLabel : "عنصر";
      const fields = (Array.isArray(cfg.fields) ? cfg.fields : []) as Array<{ key: string; placeholder?: string; dir?: string }>;
      const rows = Array.isArray(value) ? (value as AnyObj[]) : [];
      const setField = (rowIdx: number, fieldKey: string, fieldVal: string) => {
        const next: AnyObj[] = Array.from({ length: count }, (_, i) => ({ ...(rows[i] ?? {}) }));
        next[rowIdx] = { ...next[rowIdx], [fieldKey]: fieldVal };
        onChange(next);
      };
      return (
        <div className="space-y-4">
          {labelBlock}
          {Array.from({ length: count }, (_, i) => (
            <div key={i} className="space-y-2 rounded-lg bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">{i + 1}</span>
                <span>{itemLabel} {i + 1}</span>
              </div>
              {fields.map((f) => (
                <Input
                  key={f.key}
                  dir={f.dir === "ltr" ? "ltr" : undefined}
                  placeholder={f.placeholder ?? ""}
                  value={asString((rows[i] ?? {})[f.key])}
                  onChange={(e) => setField(i, f.key, e.target.value)}
                />
              ))}
            </div>
          ))}
        </div>
      );
    }

    case "GROUP":
    default:
      return (
        <div className="space-y-2">
          {labelBlock}
          <Input
            dir={dir}
            value={asString(value)}
            placeholder={question.placeholder ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
  }
}
