import {
  FileText, Heart, Users, MessageCircleQuestion, Target, Mic2, Lightbulb,
  ShieldAlert, Swords, MapPin, Stethoscope, ListChecks, BookOpen,
} from "lucide-react";

/**
 * Writer brief — renders the client's intake answers DYNAMICALLY from the same
 * questionnaire definition the admin manages (Intake Questions) and the client
 * answers (console). Whatever questions exist in the DB show here 1:1, including
 * any newly-added question. Answers come from `Client.intake`, keyed by each
 * question's stable `key`. Choice answers are mapped back to their human label.
 */

// lucide icon name (stored on section.icon) → component
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText, Heart, Users, MessageCircleQuestion, Target, Mic2, Lightbulb,
  ShieldAlert, Swords, MapPin, Stethoscope,
};

type AnyObj = Record<string, unknown>;

export interface BriefOption { value: string; label: string }
export interface BriefQuestion {
  id: string;
  key: string;
  label: string;
  type: string;
  enabled: boolean;
  visibility: unknown;
  config: unknown;
  options: BriefOption[];
}
export interface BriefSection {
  id: string;
  key: string;
  title: string;
  description: string | null;
  icon: string | null;
  order: number;
  enabled: boolean;
  visibility: unknown;
  questions: BriefQuestion[];
}
export interface BriefForm {
  sections: BriefSection[];
}

interface IntakeBriefProps {
  form: BriefForm | null;
  intake: unknown;
  intakeUpdatedAt: Date | null;
  isYmyl: boolean;
}

// ─── helpers ──────────────────────────────────────────────────────────────────
function getAtPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>(
    (acc, k) => (acc && typeof acc === "object" ? (acc as AnyObj)[k] : undefined),
    obj,
  );
}

function isFilled(v: unknown): boolean {
  if (v == null) return false;
  if (typeof v === "boolean") return true;
  if (Array.isArray(v)) return v.some((x) => (typeof x === "object" ? Object.values(x as AnyObj).some(Boolean) : Boolean(x)));
  if (typeof v === "string") return v.trim().length > 0;
  if (typeof v === "object") return Object.values(v as AnyObj).some((x) => typeof x === "string" && x.trim().length > 0);
  return true;
}

const CHOICE = new Set(["SELECT", "RADIO", "MULTI_PILL", "CHECKBOX"]);

function sectionVisible(s: BriefSection, isYmyl: boolean): boolean {
  if (!s.enabled) return false;
  const vis = (s.visibility && typeof s.visibility === "object" ? s.visibility : {}) as AnyObj;
  if (vis.ymylOnly === true && !isYmyl) return false;
  return true;
}

export function IntakeBrief({ form, intake, intakeUpdatedAt, isYmyl }: IntakeBriefProps) {
  const sections = (form?.sections ?? []).filter((s) => sectionVisible(s, isYmyl));
  const questions = sections.flatMap((s) => s.questions.filter((q) => q.enabled));

  const total = questions.length;
  const done = questions.filter((q) => isFilled(getAtPath(intake, q.key))).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const barTone = pct >= 80 ? "bg-green-500" : pct >= 40 ? "bg-amber-500" : "bg-red-400";
  const pctTone = pct >= 80 ? "text-green-600 dark:text-green-400" : pct >= 40 ? "text-amber-600 dark:text-amber-500" : "text-red-500";

  const updated = intakeUpdatedAt
    ? new Intl.DateTimeFormat("ar-SA", { year: "numeric", month: "long", day: "numeric" }).format(new Date(intakeUpdatedAt))
    : null;

  if (!form || sections.length === 0) {
    return (
      <div dir="rtl" className="rounded-xl border border-dashed bg-card p-10 text-center">
        <BookOpen className="mx-auto mb-3 h-9 w-9 text-muted-foreground/50" />
        <p className="text-sm font-semibold">لا توجد أسئلة بعد</p>
        <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
          الأسئلة تُدار من Content → Intake Questions، ويجيب عنها العميل من الكونسول.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* Banner + completeness */}
      <div className="flex items-center justify-between gap-4 flex-wrap rounded-xl border border-violet-500/30 bg-gradient-to-l from-violet-500/10 to-transparent px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="h-8 w-8 rounded-lg grid place-items-center bg-violet-500/15 text-violet-600 dark:text-violet-400 shrink-0 [&_svg]:h-4 [&_svg]:w-4">
            <BookOpen />
          </span>
          <div>
            <div className="text-sm font-extrabold">بيانات نشاط العميل</div>
            <div className="text-[11.5px] text-muted-foreground">كل ما عبّاه العميل من الكونسول · هذا ما تكتب منه</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-28 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full ${barTone}`} style={{ width: `${pct}%` }} />
          </div>
          <span className={`text-xs font-bold tabular-nums ${pctTone}`}>مكتمل {pct}%</span>
          <span className="text-[11px] text-muted-foreground">
            آخر تحديث: {updated ?? <span className="italic">لم يُحدّث</span>}
          </span>
        </div>
      </div>

      {/* One card per section, in admin-defined order */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sections.map((section) => {
          const Icon = (section.icon && ICONS[section.icon]) || ListChecks;
          return (
            <section key={section.id} className="rounded-xl border bg-card overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b">
                <span className="h-8 w-8 rounded-lg grid place-items-center shrink-0 bg-violet-500/12 text-violet-600 dark:text-violet-400 [&_svg]:h-4 [&_svg]:w-4">
                  <Icon />
                </span>
                <div className="text-[13.5px] font-bold">{section.title}</div>
                <span className="ms-auto text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-violet-500/12 text-violet-600 dark:text-violet-400">
                  أدخلها العميل
                </span>
              </div>
              <div className="p-4 pt-1">
                {section.questions.filter((q) => q.enabled).map((q) => (
                  <Row key={q.id} question={q} value={getAtPath(intake, q.key)} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

// ─── one question row: label + formatted answer ───────────────────────────────
function Row({ question, value }: { question: BriefQuestion; value: unknown }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-dashed last:border-0">
      <span className="text-[11.5px] text-muted-foreground min-w-[120px] pt-0.5">{question.label}</span>
      <div className="flex-1 text-[13px] font-medium break-words">
        <Answer question={question} value={value} />
      </div>
    </div>
  );
}

function Answer({ question, value }: { question: BriefQuestion; value: unknown }) {
  if (!isFilled(value)) {
    return <span className="text-muted-foreground/70 italic font-normal">لم يُدخله العميل</span>;
  }

  const labelOf = (val: string) => question.options.find((o) => o.value === val)?.label ?? val;
  const danger = question.key.includes("forbidden");

  switch (question.type) {
    case "BOOLEAN":
      return <span>{value === true ? "نعم" : "لا"}</span>;

    case "SELECT":
    case "RADIO":
      return <span className="whitespace-pre-wrap leading-relaxed">{labelOf(String(value))}</span>;

    case "MULTI_PILL": {
      const arr = Array.isArray(value)
        ? (value as string[])
        : String(value).split(/[,،\n]/).map((s) => s.trim()).filter(Boolean);
      return <Tags items={arr.map(labelOf)} danger={danger} />;
    }

    case "CHECKBOX": {
      const arr = (Array.isArray(value) ? value : []).filter((x) => typeof x === "string") as string[];
      return <Tags items={arr.map(labelOf)} danger={danger} />;
    }

    case "REPEATED_GROUP": {
      const rows = (Array.isArray(value) ? value : []) as AnyObj[];
      const items = rows.filter((r) => r && Object.values(r).some((x) => typeof x === "string" && x.trim().length > 0));
      return (
        <div className="space-y-1.5">
          {items.map((r, i) => {
            const name = typeof r.name === "string" ? r.name : "";
            const edge = typeof r.edge === "string" ? r.edge : "";
            return (
              <div key={i} className="text-[13px] font-medium">
                {name || `#${i + 1}`}
                {edge ? <span className="text-muted-foreground font-normal"> — {edge}</span> : null}
              </div>
            );
          })}
        </div>
      );
    }

    default: // TEXT, TEXTAREA, GROUP, fallback
      return <span className="whitespace-pre-wrap leading-relaxed">{String(value)}</span>;
  }
}

function Tags({ items, danger }: { items: string[]; danger?: boolean }) {
  if (items.length === 0) {
    return <span className="text-muted-foreground/70 italic font-normal">لم يُدخله العميل</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t, i) => (
        <span
          key={i}
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
            danger ? "bg-destructive/10 text-destructive border-destructive/30" : "bg-muted border-border"
          }`}
        >
          {t}
        </span>
      ))}
    </div>
  );
}
