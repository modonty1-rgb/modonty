import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { Clapperboard, ExternalLink, Image as ImageIcon, Video } from "lucide-react";

import { ReelLifecycleButton } from "./reel-lifecycle-button";
import type { PendingReelRow, ReelView } from "../helpers/load-reels";

/**
 * السجلّ — المنشور والمرفوض والمؤرشف.
 *
 * مكوّن سيرفر خالص: عرضٌ بلا قرار، فلا حالة ولا معالج حدث ولا بايت جافاسكربت للمتصفّح.
 * وقائمة الاعتماد تبقى كما هي عميلاً — هي التي تحمل الأزرار والحوارات.
 *
 * ولم يُضَف عَلَمٌ منطقيّ إلى `ReelsApprovalList` ليخدم الحالتين: مكوّن واحد بفرعين
 * يعني أن كل تعديل في أحدهما يُقرأ في سياق الآخر، ويكبر عدد الأعلام مع كل حالة جديدة.
 *
 * التواريخ عبر `Intl` لا نصّاً مركَّباً بيد — القاعدة: «Hardcoded date/number formats».
 */

const LOCALE = "ar-SA";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

function formatDuration(seconds: number | null): string | null {
  if (seconds == null) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** ما يُقال حين لا صفّ — لكل حالة سببها، لا «لا توجد بيانات» واحدة لأربع شاشات. */
const EMPTY: Record<ReelView, { line: string; hint: string }> = {
  pending: { line: "ما فيه ريل ينتظر قرارك", hint: "كل ما رفعه العملاء اتّخذ قراره." },
  published: { line: "ما فيه ريل منشور", hint: "الريل يوصل هنا بعد ما تعتمده من «بالانتظار»." },
  rejected: { line: "ما فيه ريل مرفوض", hint: "المرفوض يبقى هنا بسببه، والعميل يقدر يرفع بديلاً." },
  archived: { line: "ما فيه ريل مؤرشف", hint: "المؤرشف خرج من الواجهة وبقي صفّه وتفاعله." },
};

export function ReelRecordList({
  reels,
  view,
  siteUrl,
}: {
  reels: PendingReelRow[];
  view: ReelView;
  /** أصل مودونتي — يُمرَّر في «منشور» وحدها ليُبنى منه رابط المعاينة. */
  siteUrl?: string | null;
}) {
  if (reels.length === 0) {
    const empty = EMPTY[view];
    return (
      <div className="rounded-xl border border-dashed border-border px-6 py-14 text-center">
        <Clapperboard className="mx-auto h-8 w-8 text-muted-foreground/60" aria-hidden />
        <p className="mt-3 text-sm font-medium">{empty.line}</p>
        <p className="mt-1 text-xs text-muted-foreground">{empty.hint}</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-3">
      {reels.map((reel) => (
        <ReelRecordCard key={reel.id} reel={reel} view={view} siteUrl={siteUrl} />
      ))}
    </ul>
  );
}

function ReelRecordCard({
  reel,
  view,
  siteUrl,
}: {
  reel: PendingReelRow;
  view: ReelView;
  siteUrl?: string | null;
}) {
  const duration = formatDuration(reel.durationSec);
  // «شوفه على مودونتي» — على المنشور وحده: هو الوحيد الذي له صفحة حيّة. والمنشور بلا
  // `reelSlug` لا رابط له أصلاً، فيُحذف الرابط بدل أن يُبنى عنوانٌ يردّ ٤٠٤.
  const liveUrl =
    view === "published" && siteUrl && reel.slug
      ? `${siteUrl.replace(/\/+$/, "")}/reels/${encodeURIComponent(reel.slug)}`
      : null;
  // المنشور يُؤرَّخ بلحظة نشره؛ وما عداه بلحظة دخوله. عرض «أُنشئ» على صفٍّ منشور
  // يجيب سؤالاً غير المسؤول عنه.
  const stamp = view === "published" && reel.publishedAt ? reel.publishedAt : reel.createdAt;
  const stampLabel = view === "published" && reel.publishedAt ? "نُشر" : "رُفع";

  return (
    <li className="flex gap-4 rounded-xl border border-border bg-card p-3">
      <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
        {reel.previewUrl ? (
          <OptimizedImage
            media={asMedia(reel.previewUrl, reel.altText ?? reel.title ?? "")}
            alt={reel.altText ?? reel.title ?? ""}
            width={80}
            height={112}
            sizes="80px"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-5 w-5 text-muted-foreground/50" aria-hidden />
            <span className="sr-only">لا توجد معاينة</span>
          </span>
        )}
        <span className="absolute start-1 top-1 rounded bg-black/65 px-1 py-px text-[10px] font-medium text-white">
          {reel.isVideo ? (
            <>
              <Video className="me-0.5 inline h-2.5 w-2.5" aria-hidden />
              {duration ?? "فيديو"}
            </>
          ) : (
            "صورة"
          )}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {reel.clientLogoUrl ? (
            <OptimizedImage
              media={asMedia(reel.clientLogoUrl, reel.clientName)}
              alt=""
              width={18}
              height={18}
              sizes="18px"
              className="h-[18px] w-[18px] rounded-full object-cover"
            />
          ) : null}
          <span className="text-[13px] font-medium">{reel.clientName}</span>
          <time
            dateTime={stamp}
            className="text-[11px] text-muted-foreground"
          >
            {stampLabel} {formatDate(stamp)}
          </time>
        </div>

        <p className="mt-1.5 truncate text-sm font-semibold">
          {reel.title?.trim() || <span className="font-normal text-muted-foreground">بلا عنوان</span>}
        </p>
        {reel.description?.trim() ? (
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {reel.description}
          </p>
        ) : null}

        {/* صفّ الأفعال — لكل حالةٍ فعلها الواحد: المنشور يُسحب، والمؤرشف يرجع.
            والمرفوض بلا فعل هنا عن قصد: كرته عند العميل، يعدّل ويعيد الرفع فيرجع للطابور. */}
        {view === "published" || view === "archived" ? (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <ReelLifecycleButton
              id={reel.id}
              title={reel.title}
              action={view === "published" ? "archive" : "republish"}
            />
            {liveUrl ? <LiveLink href={liveUrl} /> : null}
          </div>
        ) : null}

        {view === "rejected" && reel.rejectionReason?.trim() ? (
          <p className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs leading-relaxed text-red-700 dark:text-red-400">
            <b className="font-semibold">السبب الذي قرأه العميل:</b> {reel.rejectionReason}
          </p>
        ) : null}
      </div>
    </li>
  );
}

function LiveLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
      شوفه على مودونتي
      {/* القاعدة: الرابط الذي يفتح تبويباً جديداً يقوله — لا مفاجأة صامتة. */}
      <span className="sr-only">(يفتح في تبويب جديد)</span>
    </a>
  );
}
