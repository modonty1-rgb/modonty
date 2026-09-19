"use client";

import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { Link2, Pencil, RefreshCw, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * **بطاقةُ المعاينة — الغلافُ بمقاسه الفعليّ، والبياناتُ فوقه.**
 *
 * خالد (١٩ سبتمبر ٢٠٢٦): «المعاينة ارتفاعُها عالي… اشتغل على المقاسات الفعليّة. الاسمُ
 * وعددُ المقالات ممكن تحطّه فوق الصورة».
 *
 * -- المقاسُ من مدونتي لا من تقديرنا --
 * `client-hero-v2.tsx:94` يجعل ارتفاعَ الغلاف يتبع **نسبةَ الصورة نفسِها**
 * (`width / height`)، واحتياطيُّه `2.4`، وسقفُه `220px` على الشاشات فوق الجوّال. فنسخُ
 * القاعدةِ هنا يجعل المعاينةَ تقيس ما يُرى: صورةٌ عريضةٌ 6:1 تبقى شريطاً، وصورةٌ طويلةٌ
 * تُقصّ بالسقف كما تُقصّ هناك. وكان الارتفاعُ ثابتاً (`aspect-[1200/240] max-h-56`)
 * فيكذب على كلّ صورةٍ لا تطابق تلك النسبة.
 *
 * -- والاسمُ فوق الصورة --
 * كان تحتها في شريطٍ يزيد الارتفاعَ بثمانين بكسل ولا يضيف معلومةً جديدة: الاسمُ مكتوبٌ
 * في الحقل الأوّل من النموذج تحته مباشرةً. فصعد على الصورة في تدرّجٍ أسفلَها — كما
 * تفعل صفحةُ العميل نفسُها — ومعه عددُ المقالات وشارةُ التوثيق.
 */
export function ClientPreviewCard({
  name,
  logoUrl,
  heroUrl,
  heroWidth,
  heroHeight,
  industryName,
  countryName,
  articleCount,
  isVerified,
  slug,
  onChangeSlug,
  onOpenLogo,
  onOpenHero,
}: {
  name: string;
  logoUrl: string | null;
  heroUrl: string | null;
  /** أبعادُ الغلاف المخزَّنة — تقرّر ارتفاعَ الصندوق كما على مدونتي. */
  heroWidth?: number | null;
  heroHeight?: number | null;
  industryName?: string | null;
  countryName?: string | null;
  articleCount: number;
  isVerified: boolean;
  /** السلَج — يُعرض رابطاً كاملاً تحت المعاينة، وهو عنوانُ العميل العامّ. */
  slug: string | null;
  /** فتحُ نافذة التغيير برمز التحقّق؛ غائبٌ في شاشة الإنشاء. */
  onChangeSlug?: () => void;
  onOpenLogo: () => void;
  onOpenHero: () => void;
}) {
  const metaLine = [industryName, countryName].filter(Boolean).join(" · ");
  // نفسُ احتياطيّ مدونتي: 2.4 حين لا تُعرف الأبعاد.
  const heroAr = heroWidth && heroHeight ? heroWidth / heroHeight : 2.4;
  /**
   * `NEXT_PUBLIC_SITE_URL` لا `loadSiteUrl()`: هذا مكوّنُ عميل، والقراءةُ من الإعدادات
   * تحتاج خادماً. والمتغيّرُ مضبوطٌ في البيئة نفسِها التي تبني الروابطَ العامّة.
   */
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.modonty.com").replace(/\/+$/, "");
  const publicUrl = `${siteUrl}/clients/${slug || ""}`;

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <button
        type="button"
        onClick={onOpenHero}
        style={{ "--hero-ar": heroAr } as React.CSSProperties}
        className="group relative block max-h-[220px] w-full overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-background aspect-[var(--hero-ar)]"
        aria-label={heroUrl ? "تغيير صورة الغلاف" : "إضافة صورة الغلاف"}
      >
        {heroUrl ? (
          <OptimizedImage
            media={asMedia(heroUrl, "cover")}
            alt="cover"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 1100px, 100vw"
          />
        ) : null}

        {/* تدرّجٌ أسفلَ الصورة يحمل النصّ — بلا صندوقٍ يضيف ارتفاعاً. */}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />

        <span className="pointer-events-none absolute start-2 top-2 rounded bg-background/70 px-1.5 py-0.5 text-[10px] text-muted-foreground">
          معاينة · صفحة العميل
        </span>
        <span className="pointer-events-none absolute end-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm">
          <Pencil className="h-3 w-3" />
        </span>
        <span className="pointer-events-none absolute inset-0 grid place-items-center bg-black/45 text-[11px] text-white opacity-0 transition group-hover:opacity-100">
          {heroUrl ? "تغيير الغلاف" : "إضافة غلاف"}
        </span>

        {/* الاسمُ والعددُ فوق الصورة — والشعارُ بجانبهما كما على صفحة العميل. */}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end gap-3 p-3 text-start">
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onOpenLogo(); }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onOpenLogo(); } }}
            aria-label={logoUrl ? "تغيير الشعار" : "إضافة الشعار"}
            className="pointer-events-auto group/logo relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-background bg-muted shadow-sm"
          >
            {logoUrl ? (
              <OptimizedImage media={asMedia(logoUrl, name)} alt={name} width={48} height={48} sizes="48px" className="object-contain p-1" />
            ) : (
              <span className="text-[9px] text-muted-foreground">شعار</span>
            )}
            <span className="absolute inset-0 grid place-items-center bg-black/55 text-[9px] text-white opacity-0 transition group-hover/logo:opacity-100">
              تغيير
            </span>
          </span>

          <span className="min-w-0 flex-1 pb-0.5">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-[15px] font-bold text-white drop-shadow">{name || "—"}</span>
              {isVerified && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                  <ShieldCheck className="h-3 w-3" /> موثّق
                </span>
              )}
            </span>
            <span className="mt-0.5 block truncate text-[11px] text-white/80">
              <span className="tabular-nums">{articleCount}</span> مقال منشور
              {metaLine ? ` · ${metaLine}` : ""}
            </span>
          </span>
        </span>
      </button>

      {/**
        * **الرابطُ العامُّ كاملاً — تحت المعاينة** (خالد ١٩ سبتمبر ٢٠٢٦: «السلَج محتاج
        * مكاناً أحسن… هو أساس اسم العميل، ومحتاج يكون كامل الـURL»).
        *
        * كان عموداً ثالثاً في شريط الهويّة بين حقلين يُملآن: عرضُه ضيّقٌ فيُقصّ السلَجُ
        * بـ`truncate` (رُئي «…ـبـركة»)، وموضعُه يجعله يُقرأ حقلاً يُكتب وهو مقفل.
        *
        * وهنا عنوانُه الحقيقيّ: بطاقةُ المعاينة تمثّل **ما يراه الزائر**، والرابطُ هو
        * البابُ الذي يدخل منه. وبعرض الصفحة يظهر كاملاً بلا قصّ.
        */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t px-3 py-2">
        <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] text-muted-foreground">
          <Link2 className="size-3.5" aria-hidden />
          الرابط العامّ
        </span>
        <a
          href={publicUrl}
          target="_blank"
          rel="noreferrer"
          dir="ltr"
          title="يفتح صفحة العميل على مدونتي"
          className="min-w-0 flex-1 truncate font-mono text-[11.5px] text-foreground hover:text-primary hover:underline"
        >
          {publicUrl}
        </a>
        {onChangeSlug && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            title="مقفل — يُغيَّر برمز تحقّق"
            onClick={onChangeSlug}
            className="h-6 shrink-0 px-2 text-[11px] text-yellow-600 hover:bg-yellow-500/10 hover:text-yellow-600"
          >
            <RefreshCw className="me-1 size-3" aria-hidden /> Change
          </Button>
        )}
      </div>
    </div>
  );
}
