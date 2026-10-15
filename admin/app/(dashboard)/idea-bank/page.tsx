import Link from "next/link";
import type { IdeaBankStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import { getIdeaBank, IDEA_STATUSES } from "./helpers/get-idea-bank";
import { getTopOfWeek } from "./helpers/get-top-of-week";
import { getIdeaFields } from "./helpers/get-idea-fields";
import { getFieldRequest } from "./helpers/get-field-request";
import { getStatusCounts } from "./helpers/get-status-counts";
import { getLastUpdate, RADAR_SCHEDULE_LABEL } from "./helpers/get-last-update";
import { getIdeaInsights } from "./helpers/get-idea-insights";
import { getSourceCounts, IDEA_SOURCES, isIdeaSource } from "./helpers/get-source-counts";
import { IdeaTable, type IdeaRowData } from "./components/idea-table";
import type { IdeaBankRow } from "./helpers/get-idea-bank";
import { SearchNowButton } from "./components/search-now-button";
import { getGscOpportunities } from "./helpers/get-gsc-opportunities";
import { GscTable } from "./components/gsc-table";
import { getCompetitors } from "./helpers/get-competitors";
import { CompetitorManager } from "./components/competitor-manager";
import { getReaderQuestions, type QuestionAudience, type ReaderQuestionSource } from "./helpers/get-reader-questions";
import { ReaderQuestionsTable } from "./components/reader-questions-table";
import { getSeasons } from "./helpers/get-seasons";
import { SeasonsTable } from "./components/seasons-table";
import { IDEA_BANK_VERSION } from "./helpers/idea-bank-version";
import { getIdeaResults } from "./helpers/get-idea-results";
import { ResultsTable } from "./components/results-table";

/**
 * **بنك الأفكار** (خالد ١٥ أكتوبر ٢٠٢٦: «صفحة جدّاً مهمّة»).
 *
 * فرص محتوى يرصدها رادار المحتوى مرّتين في الأسبوع لكل مجال في مدونتي (قطاعات · أقسام · صناعات) من اقتراحات
 * بحث قوقل السعودية وأخبار الأسبوع، ويقيّمها Claude. ثلاثة تبويبات فوق بيانات واحدة — الجمع مرّة،
 * والتبويب فلتر. الفريق يقرّر هنا؛ لا شيء يُنشر تلقائياً.
 */

/** التبويبات الرئيسية: أهم الأسبوع · كل طبقة مجال تبويبٌ مستقل (عددها قليل — خالد ١٥ أكتوبر ٢٠٢٦) · كل الأفكار. */
type FieldType = "sector" | "category" | "industry" | "competitor" | "general";
type View = "top" | "gsc" | "modo" | "readers" | "seasons" | "results" | FieldType | "all";
const FIELD_VIEWS: FieldType[] = ["sector", "category", "industry", "competitor", "general"];
const isFieldView = (v: View): v is FieldType => (FIELD_VIEWS as string[]).includes(v);

const STATUS_LABEL: Record<IdeaBankStatus, string> = {
  NEW: "جديدة",
  WATCH: "للمتابعة",
  APPROVED: "معتمدة",
  REJECTED: "مرفوضة",
  USED: "كُتبت",
};
/** لون واحد لكل معنى في الصفحة كلها (وصفة Advanced Table). */
const STATUS_TONE: Record<IdeaBankStatus, string> = {
  NEW: "text-sky-600 dark:text-sky-400",
  WATCH: "text-amber-600 dark:text-amber-400",
  APPROVED: "text-emerald-600 dark:text-emerald-400",
  REJECTED: "text-rose-600 dark:text-rose-400",
  USED: "text-violet-600 dark:text-violet-400",
};
const updFmt = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "long", hour: "numeric", minute: "2-digit", timeZone: "Asia/Riyadh" });
const TYPE_LABEL: Record<string, string> = { sector: "القطاعات", category: "الأقسام", industry: "الصناعات", competitor: "المنافسون", general: "عام" };

function chip(active: boolean) {
  return cn(
    "rounded-full border px-3 py-1.5 text-sm transition-colors",
    active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
  );
}

export default async function IdeaBankPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; status?: string; field?: string; source?: string }>;
}) {
  const sp = await searchParams;
  const view: View = sp.view === "all" || sp.view === "gsc" || sp.view === "readers" || sp.view === "modo" || sp.view === "seasons" || sp.view === "results" || (FIELD_VIEWS as string[]).includes(sp.view ?? "") ? (sp.view as View) : "top";
  const status: IdeaBankStatus = (IDEA_STATUSES as readonly string[]).includes(sp.status ?? "")
    ? (sp.status as IdeaBankStatus)
    : "NEW";
  const source = isIdeaSource(sp.source) ? sp.source : undefined;

  const [fields, counts, sourceCounts, lastUpdate] = await Promise.all([
    getIdeaFields(),
    getStatusCounts(),
    getSourceCounts(),
    getLastUpdate(),
  ]);

  /** رابط الصفحة نفسها مع تغيير مفتاح واحد — المصدر يبقى مختاراً حين تتنقّل بين التبويبات. */
  const href = (patch: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    const merged = {
      view: view === "top" ? undefined : view,
      status: view === "all" ? status : undefined,
      field: sp.field,
      source,
      ...patch,
    };
    for (const [k, v] of Object.entries(merged)) if (v) q.set(k, v);
    const s = q.toString();
    return s ? `/idea-bank?${s}` : "/idea-bank";
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            بنك الأفكار
            <span
              className="rounded-full border px-2 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground"
              title={`${IDEA_BANK_VERSION.date} · ${IDEA_BANK_VERSION.notes}`}
            >
              v{IDEA_BANK_VERSION.version}
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">ما يبحث عنه السعودي في كل مجال من مجالات مدونتي.</p>
          <p className="text-xs text-muted-foreground">
            {RADAR_SCHEDULE_LABEL} · آخر تحديث:{" "}
            <span className="font-semibold text-foreground">{lastUpdate ? updFmt.format(lastUpdate) : "لم يبدأ البحث بعد"}</span>
          </p>
        </div>
        <div className="space-y-2">
        {/* عدّادات القرار فوق التبويبات — تُرى أينما كنت، والضغط يفتح قائمتها. */}
        <div className="flex flex-wrap gap-2" aria-label="القرارات">
          {IDEA_STATUSES.map((s) => (
            <Link
              key={s}
              href={href({ view: "all", status: s, field: undefined })}
              className={cn(
                "flex min-w-[88px] flex-col items-center rounded-lg border px-3 py-2 transition-colors hover:bg-muted",
                view === "all" && s === status && "border-primary ring-1 ring-primary",
                counts[s] === 0 && "opacity-50",
              )}
            >
              <span className={cn("text-xl font-bold tabular-nums", STATUS_TONE[s])}>{counts[s]}</span>
              <span className="text-xs text-muted-foreground">{STATUS_LABEL[s]}</span>
            </Link>
          ))}
        </div>
        {/* المصادر تحت عدّادات القرار (خالد ١٥ أكتوبر ٢٠٢٦) — فلترٌ يعمل في كل تبويب، والضغط ثانيةً يلغيه. */}
        <div className="flex flex-wrap items-center gap-2" aria-label="المصادر">
          <span className="text-xs font-semibold text-muted-foreground">المصدر</span>
          {IDEA_SOURCES.map((s) => (
            <Link
              key={s.key}
              href={href({ source: source === s.key ? undefined : s.key })}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs transition-colors hover:bg-muted",
                source === s.key && "border-primary bg-primary text-primary-foreground hover:bg-primary",
                sourceCounts[s.key] === 0 && source !== s.key && "opacity-50",
              )}
            >
              {s.label} <span className="tabular-nums opacity-80">{sourceCounts[s.key]}</span>
            </Link>
          ))}
        </div>
        </div>
      </header>

      {/* مجموعتان (خالد ١٥ أكتوبر ٢٠٢٦ — عشرة تبويبات في صفٍّ واحد زحمة): الرادار يجمع من الخارج
          مرّتين في الأسبوع، و«بياناتنا» من قاعدة مدونتي وSearch Console — ما لا يملكه كاتبٌ يفتح قوقل. */}
      <nav className="space-y-2 border-b pb-3" aria-label="العرض">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 shrink-0 text-xs font-semibold text-muted-foreground">الرادار</span>
          <Link href={href({ view: undefined, status: undefined, field: undefined })} className={chip(view === "top")}>أهم الأسبوع</Link>
          {/* المنافسون يظهر ولو فارغاً — منه تُضاف القائمة. */}
          {FIELD_VIEWS.filter((t) => t === "competitor" || fields.some((f) => f.type === t)).map((t) => (
            <Link key={t} href={href({ view: t, status: undefined, field: undefined })} className={chip(view === t)}>
              {TYPE_LABEL[t]}{" "}
              <span className="tabular-nums opacity-80">{fields.filter((f) => f.type === t).reduce((n, f) => n + f.open, 0)}</span>
            </Link>
          ))}
          <Link href={href({ view: "all", field: undefined })} className={chip(view === "all")}>كل الأفكار</Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 shrink-0 text-xs font-semibold text-muted-foreground">بياناتنا</span>
          <Link href={href({ view: "gsc", status: undefined, field: undefined })} className={chip(view === "gsc")}>فرص قوقل</Link>
          <Link href={href({ view: "modo", status: undefined, field: undefined })} className={chip(view === "modo")}>مودو</Link>
          <Link href={href({ view: "readers", status: undefined, field: undefined })} className={chip(view === "readers")}>أسئلة القرّاء</Link>
          <Link href={href({ view: "seasons", status: undefined, field: undefined })} className={chip(view === "seasons")}>المواسم</Link>
          <Link href={href({ view: "results", status: undefined, field: undefined })} className={chip(view === "results")}>النتائج</Link>
        </div>
      </nav>

      {view === "top" && <TopOfWeek source={source} />}
      {view === "gsc" && <GscOpportunities />}
      {view === "modo" && <ReaderQuestions audience="modo" />}
      {view === "readers" && <ReaderQuestions audience="readers" />}
      {view === "seasons" && <Seasons />}
      {view === "results" && <Results />}
      {isFieldView(view) && <ByField fields={fields} type={view} field={sp.field} source={source} />}
      {view === "all" && <AllIdeas status={status} source={source} />}
    </div>
  );
}

async function TopOfWeek({ source }: { source?: string }) {
  const items = await getTopOfWeek(source);
  return (
    <section className="space-y-3">
      {items.length === 0 ? <Empty text="لا أفكار هذا الأسبوع بعد." /> : <IdeaTable items={await toRows(items)} />}
    </section>
  );
}

async function GscOpportunities() {
  const items = await getGscOpportunities();
  return (
    <section className="space-y-3">
      <p className="text-xs text-muted-foreground">
        من Search Console مدونتي — آخر ٢٨ يوماً، والكلمات مجموعةٌ حسب الصفحة التي يعرضها قوقل. يتحدّث كل ٦ ساعات.
      </p>
      {items === null ? (
        <Empty text="Search Console غير متاح الآن — جرّب بعد قليل." />
      ) : items.length === 0 ? (
        <Empty text="لا فرص في Search Console الآن." />
      ) : (
        <GscTable items={items} />
      )}
    </section>
  );
}

/** «مودو» و«أسئلة القرّاء» تبويبان (خالد ١٥ أكتوبر ٢٠٢٦): المساعد شيء، والقارئ الذي يسأل صاحب المقال شيءٌ آخر. */
const AUDIENCE = {
  modo: {
    sources: ["chat_unanswered", "chat_redirect", "chat_faq"],
    intro: "ما سأله القرّاء لمساعد «مودو» آخر ٦٠ يوماً ولم يجب عنه أو أحاله — مقالاتٌ مفقودة بلسان القارئ. يتحدّث لحظياً.",
    empty: "لا أسئلة لمودو بلا جواب في آخر ٦٠ يوماً.",
  },
  readers: {
    sources: ["article"],
    intro: "ما كتبه القرّاء تحت المقالات لأصحابها آخر ٦٠ يوماً، وهل أجاب صاحب المقال. السؤال المتكرّر يستحق مقالاً مستقلاً. يتحدّث لحظياً.",
    empty: "لا أسئلة من القرّاء تحت المقالات في آخر ٦٠ يوماً.",
  },
} as const satisfies Record<QuestionAudience, { sources: ReaderQuestionSource[]; intro: string; empty: string }>;

async function ReaderQuestions({ audience }: { audience: QuestionAudience }) {
  const items = await getReaderQuestions(audience);
  const a = AUDIENCE[audience];
  return (
    <section className="space-y-3">
      <p className="text-xs text-muted-foreground">{a.intro}</p>
      {items.length === 0 ? <Empty text={a.empty} /> : <ReaderQuestionsTable items={items} sources={[...a.sources]} />}
    </section>
  );
}

async function Seasons() {
  const items = await getSeasons();
  return (
    <section className="space-y-3">
      <p className="text-xs text-muted-foreground">
        المواسم السعودية القادمة — نجهّز مقالاتها قبلها بثلاثة أسابيع ليفهرسها قوقل ويرتّبها، ورقم الموسم الماضي من Search Console.
      </p>
      <SeasonsTable items={items} />
    </section>
  );
}

async function Results() {
  const items = await getIdeaResults();
  return (
    <section className="space-y-3">
      <p className="text-xs text-muted-foreground">
        كل فكرة «كُتبت» مربوطة بمقالها، ورقمه في قوقل آخر ٢٨ يوماً (Search Console). الحكم بعد ٣٠ يوماً من النشر.
      </p>
      {items.length === 0 ? (
        <Empty text="لا أفكار مربوطة بمقال بعد — اعتمد فكرة، ثم افتح «+» واربطها بمقالها حين يُنشر." />
      ) : (
        <ResultsTable items={items} />
      )}
    </section>
  );
}

const REQ_LABEL: Record<string, string> = {
  PENDING: "في الطابور — يلتقطه الرادار خلال ٥ دقائق",
  RUNNING: "جارٍ البحث الآن",
  DONE: "انتهى",
  FAILED: "فشل",
};
const reqFmt = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

/**
 * «حسب المجال» (خالد ١٥ أكتوبر ٢٠٢٦: «تابات فوق القطاع، الأقسام، الصناعات… بنفس الـ Advanced Table»):
 * تبويبٌ لكل طبقة، تحته مجالاتها فلاتر بعدّاد، ثم الجدول. «الكل» يعرض أفكار الطبقة كلها بعمود المجال.
 */
async function ByField({
  fields,
  type,
  field,
  source,
}: {
  fields: Awaited<ReturnType<typeof getIdeaFields>>;
  type: string;
  field?: string;
  source?: string;
}) {
  const manager = type === "competitor" ? <CompetitorManager competitors={await getCompetitors()} /> : null;
  if (!fields.some((f) => f.type === type)) {
    return (
      <section className="space-y-4">
        {manager}
        <Empty text={type === "competitor" ? "لا منافسين مفعَّلين — أضف أوّلهم من القائمة فوق." : "لا مجالات في هذه الطبقة بعد."} />
      </section>
    );
  }
  const activeType = type;
  const inType = fields.filter((f) => f.type === activeType);
  const current = inType.find((f) => f.value === field);
  const [{ items }, req] = await Promise.all([
    getIdeaBank("NEW", { field: current?.value, fieldType: activeType, source }),
    current ? getFieldRequest(current.value) : null,
  ]);
  const link = (t: string, f?: string) =>
    `/idea-bank?view=${t}${f ? `&field=${encodeURIComponent(f)}` : ""}${source ? `&source=${source}` : ""}`;
  const typeTotal = (t: string) => fields.filter((f) => f.type === t).reduce((n, f) => n + f.open, 0);

  return (
    <section className="space-y-4">
      {manager}
      <div className="flex flex-wrap items-center gap-2" aria-label="المجالات">
        <span className="w-14 shrink-0 text-xs font-semibold text-muted-foreground">المجال</span>
        <Link href={link(activeType)} className={chip(!current)}>
          الكل <span className="tabular-nums opacity-80">{typeTotal(activeType)}</span>
        </Link>
        {inType.map((f) => (
          <Link
            key={f.value}
            href={link(activeType, f.value)}
            title={f.scan ? `آخر بحث ${reqFmt.format(f.scan.at)}${f.scan.error ? ` · فشل: ${f.scan.error}` : ""}` : "لم نبحث في هذا المجال بعد"}
            className={cn(chip(f.value === current?.value), f.open === 0 && f.value !== current?.value && "opacity-50")}
          >
            {f.name}{" "}
            {/* صفرٌ بلا بحث ليس صفراً: «لم نبحث بعد» — وفشل آخر رصد يُعلَّم بنقطة حمراء. */}
            {f.scan ? <span className="tabular-nums opacity-80">{f.open}</span> : <span className="text-xs opacity-70">لم نبحث بعد</span>}
            {f.scan?.error && <span className="ms-1 inline-block h-1.5 w-1.5 rounded-full bg-rose-500 align-middle" aria-label="فشل آخر بحث" />}
          </Link>
        ))}
      </div>

      {current && (
        <p className="text-xs text-muted-foreground">
          {current.scan
            ? `آخر بحث في «${current.name}»: ${reqFmt.format(current.scan.at)} · خرج منه ${current.scan.ideas} أفكار`
            : `لم نبحث في «${current.name}» بعد — يُبحث فيه تلقائياً الأحد والأربعاء ٦ الصبح، أو اضغط «ابحث الآن».`}
          {current.scan?.error && <span className="text-rose-600 dark:text-rose-400"> · فشل: {current.scan.error}</span>}
        </p>
      )}

      {current && current.type !== "general" && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 p-3">
          <SearchNowButton
            field={current.value}
            fieldName={current.name}
            busy={req?.status === "PENDING" || req?.status === "RUNNING"}
          />
          {req && (
            <span className="text-sm text-muted-foreground">
              آخر طلب: {REQ_LABEL[req.status]}
              {req.status === "DONE" && req.created != null ? ` · أُضيفت ${req.created} فكرة` : ""}
              {req.status === "FAILED" && req.error ? ` · ${req.error}` : ""}
              {" · "}
              {reqFmt.format(req.doneAt ?? req.createdAt)}
            </span>
          )}
        </div>
      )}
      {items.length === 0 ? (
        <Empty text={current && !current.scan ? "لم نبحث في هذا المجال بعد." : "بحثنا فيه ولم نجد أفكاراً جديدة."} />
      ) : (
        <IdeaTable items={await toRows(items)} showField={!current} />
      )}
    </section>
  );
}

async function AllIdeas({ status, source }: { status: IdeaBankStatus; source?: string }) {
  const { items } = await getIdeaBank(status, { source });
  return (
    <section className="space-y-3">
      <p className="text-sm font-semibold">{STATUS_LABEL[status]}</p>
      {items.length === 0 ? <Empty text={`لا أفكار ${STATUS_LABEL[status]} الآن.`} /> : <IdeaTable items={await toRows(items)} />}
    </section>
  );
}

/** التاريخ نصٌّ عابرٌ للحدّ بين الخادم والمتصفّح — الجدول مكوّن عميل. */
async function toRows(items: IdeaBankRow[]): Promise<IdeaRowData[]> {
  const insights = await getIdeaInsights(items);
  return items.map((i) => ({
    ...i,
    firstSeenAt: i.firstSeenAt.toISOString(),
    lastSeenAt: i.lastSeenAt.toISOString(),
    insight: insights[i.id] ?? { written: [], clients: [], gsc: null },
  }));
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">{text}</p>;
}
