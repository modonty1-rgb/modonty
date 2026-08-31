"use client";

import { useState, useTransition } from "react";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { ModontyTrustMark } from "@modonty/shared/components/icons/modonty-trust-mark";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Save, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAGE_LABELS, type BlocksPage } from "@/lib/my-site/page-keys";
import type { BlockView } from "@/lib/my-site/build-page-view";
import { SITE_PAGE_TOOLS } from "@/app/(dashboard)/components/site-page-tools";
import { SiteToolButton } from "@/app/(dashboard)/components/site-tool-button";
import { VideoUpload } from "@/components/media/video-upload";
import {
  createIntroVideoTicket,
  finalizeIntroVideo,
  getIntroVideoEncodingState,
  removeIntroVideo,
  updateIntroVideoDetails,
} from "../actions/intro-video-actions";
import type {
  ServiceInput,
  TeamMemberInput,
  AchievementInput,
  CredentialInput,
} from "../helpers/page-content-types";
import { AchievementsEditor } from "./achievements-editor";
import { CredentialsEditor } from "./credentials-editor";
import { ServicesEditor } from "./services-editor";
import { TeamEditor } from "./team-editor";

interface Props {
  initial: {
    services: ServiceInput[];
    teamMembers: TeamMemberInput[];
    achievements: AchievementInput[];
    credentials: CredentialInput[];
    /** Legacy external link — read-only now, shown only so the client knows to replace it. */
    introVideoUrl: string | null;
    /** The video we host. Null until the client uploads one. */
    introVideo: {
      mp4Url: string | null;
      thumbnailUrl: string | null;
      durationSec: number | null;
      title: string | null;
      description: string | null;
    } | null;
  };
  /** أقسام كل صفحة بترتيب الزائر مع بياناتها — محسوبة على الخادم (`isEmpty` تعيش في سجلّ
   *  المكوّنات، وتمريرها للمتصفّح يجرّ كل مكوّنات الموقع إلى حزمة الكونسول). */
  views: Record<BlocksPage, BlockView[]>;
  /** ما يحتاجه رسم الشريط العلوي والغلاف — قيم الشريك نفسها، بلا تصميم. */
  chrome: {
    name: string;
    logoUrl: string | null;
    phone: string | null;
    hero: { slogan: string | null; description: string | null; coverUrl: string | null };
  };
}

export function PageContentEditor({ initial, views, chrome }: Props) {
  const [services, setServices] = useState<ServiceInput[]>(initial.services);
  const [team, setTeam] = useState<TeamMemberInput[]>(initial.teamMembers);
  const [achievements, setAchievements] = useState<AchievementInput[]>(initial.achievements);
  const [credentials, setCredentials] = useState<CredentialInput[]>(initial.credentials);
  const [page, setPage] = useState<BlocksPage>("home");

  return (
    <div className="space-y-10">
      {/* ── نفس شريط «موقعي»، لا أكثر (خالد ٣١ أغسطس) ────────────────
          مشترك لا منسوخ: `SiteToolButton` و`SITE_PAGE_TOOLS` ملفّان واحدان تقرأهما
          الشاشتان، فلا ينحرفان بعد أوّل تعديل. */}
      <div className="sticky top-0 z-[60] -mx-4 mb-5 border-y border-primary/20 bg-primary/[0.07] px-4 py-2.5 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="shrink-0 pe-1 text-[11px] font-bold tracking-wide text-primary">الصفحات</span>
          {SITE_PAGE_TOOLS.map(({ key, label, Icon }) => (
            <SiteToolButton
              key={key}
              label={label}
              Icon={Icon}
              active={page === key}
              onClick={() => setPage(key)}
            />
          ))}
          {/* ما عاد فيه زرّ حفظٍ عامّ (خالد ٣١ أغسطس): كل قسم يحفظ نفسه من حواره، فزرٌّ
              اسمه «حفظ محتوى الصفحة» ما عاد يحفظ شيئاً — ووجوده يوهم أن الشغل غير محفوظ. */}
        </div>
      </div>

      {/* لا لوحات تعريفية (خالد ٣١ أغسطس): الشاشة تعرض البيانات، ووسم المصدر على البطاقة
          يقول من أين تجيء — والكلام الزائد فوقه حشو. */}

      {/* كل تاب يعرض بياناته الحقيقية بترتيب الزائر، والناقص يبان كهرمانياً (خالد ٣١ أغسطس)
          — لا لوحة تعريفية وحدها. والمحرّر يعيش مع بطاقته في أيّ صفحة تظهر فيها: نفس
          الحالة ونفس الحفظ، فما فيه نسختان تتناقضان. */}
      <PageView
        blocks={page === "home" ? views[page] : views[page].filter((b) => !REPEATED_TAIL.has(b.key))}
        tail={page !== "home"}
        page={PAGE_LABELS[page]}
        chrome={chrome}
        editors={{
          trust: <CredentialsEditor credentials={credentials} onChange={setCredentials} />,
          stats: <AchievementsEditor achievements={achievements} onChange={setAchievements} />,
          team: <TeamEditor team={team} onChange={setTeam} />,
          video: <IntroVideoSection video={initial.introVideo} legacyUrl={initial.introVideoUrl} />,
          services: <ServicesEditor services={services} onChange={setServices} />,
        }}
      />
    </div>
  );
}

/**
 * The intro video, in whichever of its three states the client is in:
 * hosted by us · still on an external link · neither.
 *
 * The external link is shown but not editable. It was never the client's to manage — it
 * lives on a channel they do not own — and the only useful action is to replace it, so
 * that is the only action offered.
 */
function IntroVideoSection({
  video,
  legacyUrl,
}: {
  video: {
    mp4Url: string | null;
    thumbnailUrl: string | null;
    durationSec: number | null;
    title: string | null;
    description: string | null;
  } | null;
  legacyUrl: string | null;
}) {
  const [removing, setRemoving] = useState(false);

  async function remove() {
    setRemoving(true);
    const res = await removeIntroVideo();
    if (res.success) {
      toast.success("شِلنا الفيديو");
      window.location.reload();
    } else {
      toast.error(res.error);
      setRemoving(false);
    }
  }

  if (video?.mp4Url) {
    return (
      <div className="space-y-3">
        <div className="relative max-w-md overflow-hidden rounded-lg bg-black">
          <video
            src={video.mp4Url}
            poster={video.thumbnailUrl ?? undefined}
            controls
            playsInline
            preload="metadata"
            className="aspect-video w-full"
          />
        </div>

        <IntroVideoDetails title={video.title} description={video.description} />

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {video.durationSec ? `${video.durationSec} ثانية` : ""} · مستضاف عند مُدَوَّنَتِي
          </span>
          <Button variant="outline" size="sm" onClick={remove} disabled={removing} className="gap-1.5">
            <Trash2 className="h-3.5 w-3.5" />
            {removing ? "نشيله…" : "شيل الفيديو"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {legacyUrl && (
        // The client did not put this link here and cannot manage it. Say what it means
        // in plain terms — no jargon about hosting or structured data.
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
          <p className="text-xs font-semibold text-amber-900">فيديوك محفوظ عند موقع ثاني</p>
          <p className="mt-1 text-[11px] leading-relaxed text-amber-800">
            الفيديو اللي في صفحتك الحين مرفوع على قناة مو قناتك، وما تقدر تعدّله ولا تشيله،
            وقوقل يحسبه لصاحب القناة مو لك. ارفعه هنا وبيصير ملكك بالكامل — والقديم يشتغل
            لين ترفع البديل.
          </p>
          <p dir="ltr" className="mt-2 break-all text-start text-[10px] text-amber-700">
            {legacyUrl}
          </p>
        </div>
      )}

      <VideoUpload
        createTicket={createIntroVideoTicket}
        finalize={finalizeIntroVideo}
        getEncodingState={getIntroVideoEncodingState}
        maxDurationSec={300}
        labels={{
          idle: legacyUrl ? "ارفع الفيديو عندنا" : "ارفع فيديو التعريف",
          hint: "MP4 أو MOV أو WebM · لين ٥ دقائق",
          done: "جاهز — الفيديو صار في صفحتك",
        }}
        onDone={() => window.location.reload()}
      />
    </div>
  );
}

/**
 * The two fields Google needs on the video. Not optional in effect: without a title the
 * VideoObject is skipped entirely, so an untitled video is a video that counts for
 * nothing in search — which is the whole reason we moved it off YouTube.
 */
function IntroVideoDetails({
  title,
  description,
}: {
  title: string | null;
  description: string | null;
}) {
  const [draft, setDraft] = useState({ title: title ?? "", description: description ?? "" });
  const [saved, setSaved] = useState(draft);
  const [pending, startTransition] = useTransition();

  const dirty = draft.title !== saved.title || draft.description !== saved.description;
  const missing = [!draft.title.trim() && "العنوان", !draft.description.trim() && "الوصف"].filter(
    Boolean
  ) as string[];

  function save() {
    startTransition(async () => {
      const res = await updateIntroVideoDetails(draft.title, draft.description);
      if (res.success) {
        setSaved(draft);
        toast.success("تم الحفظ");
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="max-w-md space-y-2">
      <Input
        value={draft.title}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        placeholder="عنوان الفيديو — يظهر في نتائج البحث"
        maxLength={100}
      />
      <Textarea
        value={draft.description}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        placeholder="وصف قصير — إيش يشوف الزائر في المقطع؟"
        className="min-h-[60px] resize-none"
        maxLength={500}
      />
      {missing.length > 0 && (
        <p className="rounded bg-amber-50 px-2 py-1 text-[11px] leading-tight text-amber-800">
          ناقص: {missing.join(" · ")} — بدونهما الفيديو ما يظهر في نتائج بحث قوقل.
        </p>
      )}
      {dirty && (
        <Button size="sm" onClick={save} disabled={pending} className="gap-1.5">
          <Save className="h-3.5 w-3.5" />
          {pending ? "نحفظ…" : "احفظ بيانات الفيديو"}
        </Button>
      )}
    </div>
  );
}

/**
 * وسم مصدر القسم. ثلاث حالات لا واحدة: بيانات الشريك (اسم شاشتها) · بيانات الأدمن
 * (لا يملكها ولا يُطالَب بها) · نصّ مدونتي الثابت (ما له حقول أصلاً).
 */
function SourceTag({ block }: { block: BlockView }) {
  // القسم الذي يُدخَل من هذه الشاشة نفسها لا يحمل وسم مصدر: «من: محتوى الموقع»
  // وأنت واقف في محتوى الموقع كلامٌ فاضٍ (خالد ٣١ أغسطس).
  if (block.href === "/dashboard/page-content") return null;
  if (block.owner === "admin") {
    return (
      <span
        title="يضبطها فريق مدونتي — زرّ الطلب وشكله"
        className="rounded-full border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-700 dark:text-sky-300"
      >
        أدمن
      </span>
    );
  }
  if (block.owner === "modonty") {
    return (
      <span className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
        نصّ مدونتي
      </span>
    );
  }
  // كهرماني لا رمادي (خالد ٣١ أغسطس): معناه «هذي البيانات ما تتعدّل من هنا» — والشريك
  // لازم يلقاها بعينه لا يدوّر عليها. نفس لون النقص في هذي الشاشة، ومعناه واحد: فعلٌ مكانه غير هنا.
  return (
    <span className="rounded-full border border-amber-500/50 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
      من: {block.where}
    </span>
  );
}

/**
 * الشريط العلوي، رسمةً عادية: شعار · اسم · روابط الصفحات · الهاتف — بترتيبها الحقيقي
 * وبقيم الشريك نفسها. حدٌّ متقطّع ورماديّ متعمَّد: هذا مخطّطٌ لا الموقع، والشكل النهائي
 * يُختار من «تصميم الموقع» (خمسة قوالب).
 */
function HeaderSketch({ chrome }: { chrome: Props["chrome"] }) {
  return (
    <div className="rounded-lg border border-dashed bg-muted/30 p-3">
      <p className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-bold text-muted-foreground">
        الشريط العلوي
        <span className="rounded-full border border-amber-500/50 bg-amber-500/10 px-2 py-0.5 font-medium text-amber-700 dark:text-amber-300">
          من: بيانات نشاطك · الصور والملفات
        </span>
        <span className="rounded-full border px-2 py-0.5 font-medium">شكله: تصميم الموقع</span>
      </p>
      <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded bg-muted text-[10px] text-muted-foreground">
          {chrome.logoUrl ? (
            <OptimizedImage media={asMedia(chrome.logoUrl)} alt="" width={32} height={32} sizes="32px" className="h-8 w-8 object-contain" />
          ) : (
            "شعار"
          )}
        </span>
        <span className="truncate text-sm font-semibold text-foreground">{chrome.name}</span>
        <span className="mx-1 hidden h-5 w-px bg-border md:block" aria-hidden />
        <span className="hidden flex-wrap items-center gap-1.5 md:flex">
          {SITE_PAGE_TOOLS.map(({ key, label }) => (
            <span key={key} className="rounded border bg-muted/50 px-2 py-1 text-[11px] text-muted-foreground">
              {label}
            </span>
          ))}
        </span>
        <span className="ms-auto shrink-0 rounded border bg-muted/50 px-2 py-1 text-[11px] text-muted-foreground" dir="ltr">
          {chrome.phone ?? "لا يوجد هاتف"}
        </span>
      </div>
    </div>
  );
}

/**
 * الغلاف، رسمةً عادية بنفس التدفّق: صورة الغلاف ثم الشعار النصّي ثم الوصف.
 * الصورة بنسبتها الحقيقية لا بمربّع — الزائر يراها كما هي.
 */
function HeroSketch({ chrome, block }: { chrome: Props["chrome"]; block: BlockView }) {
  const { slogan, description, coverUrl } = chrome.hero;
  return (
    <div className="rounded-lg border border-dashed bg-muted/30 p-3">
      <p className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-bold text-muted-foreground">
        <span dir="ltr">1</span> · {block.name}
        <SourceTag block={block} />
      </p>
      <div className="overflow-hidden rounded-md border bg-background">
        {coverUrl ? (
          <OptimizedImage media={asMedia(coverUrl)} alt="" width={1200} height={480} sizes="(max-width: 768px) 100vw, 900px" className="h-40 w-full object-cover" />
        ) : (
          <div className="grid h-40 w-full place-items-center bg-muted text-xs text-muted-foreground">
            صورة الغلاف
          </div>
        )}
        <div className="space-y-1.5 p-4">
          {/* الشارة مع الغلاف (خالد ٣١ أغسطس) — ثابتة لكل شريك، بعلامة مدونتي الرسمية. */}
          <p className="flex items-center gap-2 text-xs font-medium text-foreground">
            <ModontyTrustMark className="h-4 w-4 shrink-0" />
            شريك موثَّق في مدونتي
          </p>
          <p className="text-base font-bold text-foreground">{slogan ?? chrome.name}</p>
          {description && <p className="line-clamp-2 text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
    </div>
  );
}

/**
 * صفحة الموقع كما ستصل الزائر — أقسامها بترتيبها، بلا تصميم.
 * القسم الذي فيه بيانات يعرضها نصّاً؛ والفارغ يُوسَم كهرمانياً ويقود إلى شاشة إدخاله.
 * الكهرماني لا الأحمر: نقصٌ يُكمَّل، لا عطل.
 */
/**
 * ذيلٌ يتكرّر أسفل كل صفحة: «النداء الأخير» و«النشرة». عرضه في كل تاب تكرارٌ يزحم
 * القائمة بلا معلومة جديدة (خالد ٣١ أغسطس)، فيُعرض في الرئيسية ويُذكر في سطر واحد
 * في البقيّة — لا يُحذف من الوعي، ولا يُعاد رسمه ثمان مرّات.
 */
const REPEATED_TAIL = new Set(["cta", "newsletter"]);

/**
 * «قسم واحد» لا «1 قسماً»: العربية تعدّ بثلاث صيغ، والرقم الملاصق لكلمة مفردة يُقرأ
 * على أنه عدد محتوى القسم لا عدد الأقسام — خالد نفسه قرأ «1 قسماً» فظنّ العميل عنده
 * مقال واحد وعنده مقالان.
 */
/** وحدة العدّ لكل قسم: [مفرد · مثنّى · جمع]. */
const DEFAULT_UNIT: [string, string, string] = ["عنصر", "عنصران", "عناصر"];
const BLOCK_UNIT: Record<string, [string, string, string]> = {
  trust: ["اعتماد", "اعتمادان", "اعتمادات"],
  services: ["خدمة", "خدمتان", "خدمات"],
  stats: ["رقم", "رقمان", "أرقام"],
  testimonials: ["رأي", "رأيان", "آراء"],
  gallery: ["صورة", "صورتان", "صور"],
  team: ["عضو", "عضوان", "أعضاء"],
  faq: ["سؤال", "سؤالان", "أسئلة"],
  blog: ["مقال", "مقالان", "مقالات"],
};

function arCount(n: number, one: string, two: string, many: string): string {
  if (n === 1) return `${one} واحد`;
  if (n === 2) return two;
  if (n >= 3 && n <= 10) return `${n} ${many}`;
  // ما فوق العشرة يأخذ تمييزاً مفرداً منصوباً: «15 قسماً» لا «15 قسم».
  return `${n} ${one}اً`;
}

function PageView({
  blocks,
  page,
  chrome,
  editors,
  tail = false,
}: {
  blocks: BlockView[];
  page: string;
  /** أضف سطر «ويتكرّر أسفلها…» — يُمرَّر في كل تاب غير الرئيسية. */
  tail?: boolean;
  chrome: Props["chrome"];
  /** محرّر القسم — يحلّ محلّ سطوره داخل بطاقته حين يكون له محرّر هنا. */
  editors?: Partial<Record<string, React.ReactNode>>;
}) {
  const missing = blocks.filter((b) => b.empty).length;
  /**
   * الرسمتان (الشريط العلوي والغلاف) للرئيسية وحدها: الشريط نفسه في كل صفحة فرسمه
   * ثماني مرّات تكرار، و«الغلاف» في الصفحات الأخرى قسمٌ آخر باسم آخر («البيان» في من
   * نحن) — رسمه كغلافٍ بصورة الرئيسية يُريه شيئاً لا يوجد.
   */
  const hero = tail ? undefined : blocks.find((b) => b.key === "hero");
  const rest = hero ? blocks.filter((b) => b.key !== "hero") : blocks;
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-baseline gap-x-3 border-b pb-2">
        <h2 className="text-lg font-bold text-foreground">صفحة {page}</h2>
        <p className="text-xs text-muted-foreground">
          {arCount(blocks.length, "قسم", "قسمان", "أقسام")} بترتيب ما يشوفه الزائر
          {missing > 0 ? ` · ${missing} منها ناقص` : " · كلها فيها بيانات"}
          {tail && " · ويتكرّر أسفلها النداء الأخير والنشرة"}
        </p>
      </div>

      {/* الشريط العلوي مع الغلاف وحدهما — أي في الرئيسية (خالد ٣١ أغسطس): هو نفسه في كل
          صفحة، فرسمه فوق كل تاب تكرارٌ يزحم الشاشة بلا معلومة جديدة. */}
      {hero && (
        <>
          <HeaderSketch chrome={chrome} />
          <HeroSketch chrome={chrome} block={hero} />
        </>
      )}

      <ol className="space-y-2">
        {rest.map((b, i) => (
          <li
            key={`${b.key}-${i}`}
            className={cn(
              "rounded-lg border bg-card px-4 py-3",
              b.empty && "border-amber-500/60 bg-amber-500/5",
            )}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {/* رقمه في الصفحة كاملةً لا في القائمة — الغلاف مرسومٌ فوق وهو الأوّل. */}
              <span className="text-[11px] font-bold text-muted-foreground" dir="ltr">
                {blocks.indexOf(b) + 1}
              </span>
              <h3 className="text-sm font-semibold text-foreground">{b.name}</h3>
              {/* العدد بوحدته: رقمٌ عارٍ بجانب اسم القسم يُخلَط بترقيم الأقسام نفسه. */}
              {b.count !== undefined && (
                <span className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
                  {arCount(b.count, ...(BLOCK_UNIT[b.key] ?? DEFAULT_UNIT))}
                </span>
              )}
              {/* وسم المصدر على كل قسم: الشريك يستحقّ أن يعرف من أين تجيء كل بياناته،
                  وأيّها ليس بيده أصلاً (خالد ٣١ أغسطس). */}
              <SourceTag block={b} />

              {/* الملاحظة في صفّ الوسوم لا تحت العنوان (خالد ٣١ أغسطس): تحت العنوان تُقرأ
                  كأنها جزء من محتوى القسم، وهي كلامٌ عن القسم لا منه. */}
              {/* نصٌّ كهرماني بلا إطار (خالد ٣١ أغسطس): لونه يربطه بوسم المصدر، وغياب
                  الإطار يفرّقه عنه — هو تنبيه لا وسم. */}
              {b.note && (
                <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300">
                  {b.note}
                </span>
              )}

              {/* الناقص الذي يملكه الشريك وحده يستحقّ مخرجاً: هدف ٤٤ بكسلاً وتسمية مكتوبة.
                  والقسم الذي محرّره داخل بطاقته لا يُعطى رابطاً يشير إلى الشاشة نفسها. */}
              {b.empty && b.owner === "client" && b.href !== "/dashboard/page-content" && (
                <>
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    محتاجين البيانات هذه
                  </span>
                  <a
                    href={b.href}
                    className="ms-auto flex min-h-11 items-center gap-1.5 rounded-lg border border-amber-500/50 bg-background px-3 text-xs font-medium hover:bg-amber-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    أدخلها من «{b.where}»
                    <ChevronLeft className="h-4 w-4" aria-hidden />
                  </a>
                </>
              )}
            </div>

            {editors?.[b.key] ? (
              <div className="mt-3 space-y-2">{editors[b.key]}</div>
            ) : b.thumbs ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {b.thumbs.map((url, j) => (
                  <OptimizedImage
                    key={j}
                    media={asMedia(url)}
                    alt=""
                    width={56}
                    height={56}
                    sizes="56px"
                    className="h-14 w-14 rounded-md border object-cover"
                  />
                ))}
                {b.count !== undefined && b.count > b.thumbs.length && (
                  <span className="grid h-14 w-14 place-items-center rounded-md border bg-muted/30 text-[11px] text-muted-foreground">
                    +{b.count - b.thumbs.length}
                  </span>
                )}
              </div>
            ) : b.items ? (
              /* عنصرٌ له عنوان ووصف يستحقّ بطاقته: الوصف هو ما يقرّر الزائر عليه. */
              <ul className="mt-2 space-y-2">
                {b.items.map((it, j) => (
                  <li key={j} className="rounded-lg border bg-muted/20 px-3 py-2">
                    <p className="text-xs font-semibold text-foreground">{it.title}</p>
                    {it.sub && (
                      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                        {it.sub}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              b.lines.length > 0 && (
                <ul className="mt-2 space-y-1 ps-6">
                  {/* على الجوّال يُلفّ السطر بدل أن يُقصّ: العرض ٢٨١px والنصّ ٤٠٧،
                      فالبتر يخفي نصف بيانات القسم عن صاحبها (مقيس ٣١ أغسطس). */}
                  {b.lines.map((line, j) => (
                    <li key={j} className="text-xs text-muted-foreground max-sm:line-clamp-2 sm:truncate">
                      {line}
                    </li>
                  ))}
                </ul>
              )
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

/** A page heading over the editors whose content lands on that page («يظهر في: الرئيسية»). */