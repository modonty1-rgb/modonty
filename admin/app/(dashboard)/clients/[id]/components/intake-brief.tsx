import type { ReactNode } from "react";
import {
  Mic, Target, BookOpen, Users, Compass, Ban, Swords, ShieldCheck,
} from "lucide-react";

/**
 * Writer brief — renders everything the client filled in `Client.intake` (console).
 * Display-only, no hooks. The heart of the client page for a content writer.
 * Shape mirrors console intake-types.ts (ClientIntake) — kept loose to avoid a
 * cross-app type import; missing fields fall back to an explicit empty state.
 */

type Intake = {
  voice?: { tone?: string | null; traits?: string[] | null } | null;
  audience?: { description?: string | null } | null;
  goals?: { primary?: string | null; kpis?: string | null } | null;
  policy?: {
    forbiddenKeywords?: string[] | null;
    forbiddenClaims?: string[] | null;
    restrictedClaims?: string | null;
    competitiveMentionsAllowed?: boolean | null;
    linkBuildingPolicy?: string | null;
  } | null;
  business?: { brief?: string | null } | null;
  story?: { foundingStory?: string | null; expertise?: string | null; seasons?: string[] | null } | null;
  customers?: {
    bigProblem?: string | null;
    objections?: string[] | null;
    faqs?: string | null;
    funnelStage?: string[] | null;
  } | null;
  strategy?: {
    mainProductFocus?: string | null;
    topicIdeas?: string | null;
    evidence?: string | null;
    preferredCta?: string | null;
    citationSources?: string | null;
  } | null;
  competition?: {
    competitors?: Array<{ name: string; url?: string | null; edge?: string | null }> | null;
    gaps?: string | null;
  } | null;
  ymylReviewer?: { name?: string | null; qualification?: string | null; profileUrl?: string | null } | null;
  updatedAt?: string | null;
} | null;

interface IntakeBriefProps {
  intake: unknown;
  intakeUpdatedAt: Date | null;
  isYmyl: boolean;
  ymylCategoryLabel: string | null;
}

// Treats "", null, [], and whitespace as empty.
function filled(v: unknown): boolean {
  if (v == null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "boolean") return true;
  return true;
}

export function IntakeBrief({ intake, intakeUpdatedAt, isYmyl, ymylCategoryLabel }: IntakeBriefProps) {
  const d = (intake as Intake) ?? null;

  // Completeness — count the meaningful fields the client owns.
  const checks: boolean[] = [
    filled(d?.voice?.tone), filled(d?.voice?.traits), filled(d?.audience?.description),
    filled(d?.goals?.primary), filled(d?.goals?.kpis),
    filled(d?.story?.foundingStory), filled(d?.story?.expertise), filled(d?.story?.seasons),
    filled(d?.customers?.bigProblem), filled(d?.customers?.objections), filled(d?.customers?.faqs), filled(d?.customers?.funnelStage),
    filled(d?.strategy?.mainProductFocus), filled(d?.strategy?.topicIdeas), filled(d?.strategy?.preferredCta), filled(d?.strategy?.citationSources),
    filled(d?.policy?.forbiddenKeywords), filled(d?.policy?.forbiddenClaims),
    filled(d?.competition?.competitors),
    ...(isYmyl ? [filled(d?.ymylReviewer?.name), filled(d?.ymylReviewer?.qualification)] : []),
  ];
  const total = checks.length;
  const done = checks.filter(Boolean).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const barTone = pct >= 80 ? "bg-green-500" : pct >= 40 ? "bg-amber-500" : "bg-red-400";
  const pctTone = pct >= 80 ? "text-green-600 dark:text-green-400" : pct >= 40 ? "text-amber-600 dark:text-amber-500" : "text-red-500";

  const updated = intakeUpdatedAt
    ? new Intl.DateTimeFormat("ar-SA", { year: "numeric", month: "long", day: "numeric" }).format(new Date(intakeUpdatedAt))
    : null;

  return (
    <div className="space-y-4" dir="rtl">
      {/* Brief banner + completeness */}
      <div className="flex items-center justify-between gap-4 flex-wrap rounded-xl border border-violet-500/30 bg-gradient-to-l from-violet-500/10 to-transparent px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="h-8 w-8 rounded-lg grid place-items-center bg-violet-500/15 text-violet-600 dark:text-violet-400 shrink-0 [&_svg]:h-4 [&_svg]:w-4">
            <BookOpen />
          </span>
          <div>
            <div className="text-sm font-extrabold">بريف الكاتب — بيانات العميل</div>
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

      {/* Row 1: Voice & Audience · Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section icon={<Mic />} tone="violet" title="العلامة الصوتية والجمهور">
          <Info k="نبرة الكتابة" v={d?.voice?.tone} />
          <Info k="سمات الصوت" tags={d?.voice?.traits} />
          <Info k="الجمهور المستهدف" v={d?.audience?.description} />
        </Section>
        <Section icon={<Target />} tone="blue" title="الأهداف">
          <Info k="الهدف الأساسي" v={d?.goals?.primary} />
          <Info k="مؤشرات النجاح" v={d?.goals?.kpis} />
        </Section>
      </div>

      {/* Row 2: Story (E-E-A-T) full width */}
      <Section icon={<BookOpen />} tone="green" title="قصة العمل والخبرة (E-E-A-T)">
        <Info k="قصة التأسيس" v={d?.story?.foundingStory} />
        <Info k="مجال الخبرة" v={d?.story?.expertise} />
        <Info k="مواسم مهمة" tags={d?.story?.seasons} />
      </Section>

      {/* Row 3: Customers · Strategy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section icon={<Users />} tone="amber" title="ذكاء العملاء">
          <Info k="المشكلة الكبرى" v={d?.customers?.bigProblem} />
          <Info k="الاعتراضات" tags={d?.customers?.objections} />
          <Info k="أسئلة متكررة" v={d?.customers?.faqs} />
          <Info k="مرحلة القمع" tags={d?.customers?.funnelStage} />
        </Section>
        <Section icon={<Compass />} tone="blue" title="استراتيجية المحتوى">
          <Info k="التركيز الأساسي" v={d?.strategy?.mainProductFocus} />
          <Info k="أفكار مواضيع" v={d?.strategy?.topicIdeas} />
          <Info k="الـ CTA المفضّل" v={d?.strategy?.preferredCta} />
          <Info k="مصادر الاستشهاد" v={d?.strategy?.citationSources} />
        </Section>
      </div>

      {/* Row 4: Policy (red guardrails) · Competition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section icon={<Ban />} tone="red" title="السياسات والمحظورات">
          <Info k="كلمات ممنوعة" tags={d?.policy?.forbiddenKeywords} danger />
          <Info k="ادعاءات ممنوعة" tags={d?.policy?.forbiddenClaims} danger />
          <Info
            k="ذكر المنافسين"
            v={
              d?.policy?.competitiveMentionsAllowed == null
                ? null
                : d.policy.competitiveMentionsAllowed
                  ? "مسموح"
                  : "غير مسموح"
            }
          />
        </Section>
        <Section icon={<Swords />} tone="amber" title="المنافسة">
          {d?.competition?.competitors && d.competition.competitors.length > 0 ? (
            <div className="py-2.5 border-b border-dashed last:border-0">
              <p className="text-[11.5px] text-muted-foreground mb-1.5">المنافسون</p>
              <div className="space-y-1.5">
                {d.competition.competitors.map((c, i) => (
                  <div key={i} className="text-[13px] font-medium">
                    {c.name}
                    {c.edge ? <span className="text-muted-foreground font-normal"> — {c.edge}</span> : null}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Info k="المنافسون" v={null} />
          )}
          <Info k="الفجوات" v={d?.competition?.gaps} />
        </Section>
      </div>

      {/* Row 5: YMYL reviewer (only when isYmyl) */}
      {isYmyl && (
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/[0.06] overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-violet-500/25">
            <span className="h-8 w-8 rounded-lg grid place-items-center bg-background text-violet-600 dark:text-violet-400 shrink-0 [&_svg]:h-4 [&_svg]:w-4">
              <ShieldCheck />
            </span>
            <div className="text-[13.5px] font-bold flex items-center gap-2">
              المراجِع المؤهّل — YMYL{ymylCategoryLabel ? ` · ${ymylCategoryLabel}` : ""}
            </div>
            <span className="ms-auto text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400">
              أدخلها العميل
            </span>
          </div>
          <div className="p-4 pt-1">
            <Info
              k="اسم المراجِع"
              v={d?.ymylReviewer?.name}
              emptyHint="بانتظار إدخال العميل — لا يُنشر محتوى طبّي بدونه"
            />
            <Info k="المؤهّل" v={d?.ymylReviewer?.qualification} />
            <Info k="رابط الملف" v={d?.ymylReviewer?.profileUrl} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── presentational helpers ───────────────────────────────────────── */

const TONE: Record<string, string> = {
  blue: "bg-primary/10 text-primary",
  green: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  violet: "bg-violet-500/12 text-violet-600 dark:text-violet-400",
  amber: "bg-amber-500/12 text-amber-600 dark:text-amber-500",
  red: "bg-destructive/10 text-destructive",
};

function Section({
  icon, tone, title, children,
}: { icon: ReactNode; tone: keyof typeof TONE; title: string; children: ReactNode }) {
  const danger = tone === "red";
  return (
    <section className={`rounded-xl border bg-card overflow-hidden ${danger ? "border-destructive/25" : ""}`}>
      <div className="flex items-center gap-2.5 px-4 py-3 border-b">
        <span className={`h-8 w-8 rounded-lg grid place-items-center shrink-0 [&_svg]:h-4 [&_svg]:w-4 ${TONE[tone]}`}>{icon}</span>
        <div className="text-[13.5px] font-bold">{title}</div>
        <span className="ms-auto text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-violet-500/12 text-violet-600 dark:text-violet-400">
          أدخلها العميل
        </span>
      </div>
      <div className="p-4 pt-1">{children}</div>
    </section>
  );
}

function Info({
  k, v, tags, danger, emptyHint,
}: {
  k: string;
  v?: string | null;
  tags?: string[] | null;
  danger?: boolean;
  emptyHint?: string;
}) {
  const hasTags = Array.isArray(tags) && tags.length > 0;
  const hasVal = typeof v === "string" && v.trim().length > 0;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-dashed last:border-0">
      <span className="text-[11.5px] text-muted-foreground min-w-[120px] pt-0.5">{k}</span>
      <div className="flex-1 text-[13px] font-medium break-words">
        {hasTags ? (
          <div className="flex flex-wrap gap-1.5">
            {tags!.map((t, i) => (
              <span
                key={i}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                  danger
                    ? "bg-destructive/10 text-destructive border-destructive/30"
                    : "bg-muted border-border"
                }`}
              >
                {t}
              </span>
            ))}
          </div>
        ) : hasVal ? (
          <span className="whitespace-pre-wrap leading-relaxed">{v}</span>
        ) : (
          <span className="text-muted-foreground/70 italic font-normal">
            {emptyHint || "لم يُدخله العميل"}
          </span>
        )}
      </div>
    </div>
  );
}
