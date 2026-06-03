import type { Metadata } from "next";
import NextImage from "next/image";

import Link from "@/components/link";
import { CtaTrackedLink } from "@/components/cta-tracked-link";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { CardTitleWithIcon } from "@/components/ui/card-title-with-icon";

import { BRAND_AR, SITE_URL, CONTACT_EMAIL, LEGAL } from "@/lib/brand";
import { ORGANIZATION_JSONLD } from "@/lib/organization-jsonld";
import { cn } from "@/lib/utils";
import { getBrandMedia } from "@/lib/settings/get-brand-media";
import { getWhatsappContactUrl } from "@/lib/settings/get-whatsapp-contact";
import {
  IconVerified,
  IconFileCheck,
  IconExternal,
  IconShield,
  IconAnalytics,
  IconBriefcase,
  IconMapPin,
  IconEmail,
  IconClock,
  IconMessage,
  IconCheckCircle,
  IconSuccess,
} from "@/lib/icons";

const PAGE_URL = `${SITE_URL}/trust`;
const PAGE_DESC =
  "شركة سعودية موثّقة. سجل تجاري رسمي قابل للتحقّق، عنوان حقيقي، وشفافية كاملة — لأن فلسفتنا حضور لا وعود.";

const MAP_LAT = "21.502370834350586";
const MAP_LNG = "39.1859245300293";
const MAP_EMBED = `https://www.google.com/maps?q=${MAP_LAT},${MAP_LNG}&hl=ar&z=15&output=embed`;
const MAP_LINK = `https://www.google.com/maps?q=${MAP_LAT},${MAP_LNG}`;

export const metadata: Metadata = {
  title: "الموثوقية — مدونتي",
  description: PAGE_DESC,
  alternates: {
    canonical: PAGE_URL,
    languages: { "ar-SA": PAGE_URL, "ar-EG": PAGE_URL },
  },
  openGraph: {
    title: "الموثوقية — مدونتي",
    description: PAGE_DESC,
    url: PAGE_URL,
    type: "website",
    locale: "ar_SA",
    siteName: BRAND_AR,
  },
  robots: { index: true, follow: true },
};

const FACTS: { k: string; v: string; ltr?: boolean; active?: boolean }[] = [
  { k: "الاسم القانوني", v: LEGAL.legalName },
  { k: "الحالة", v: LEGAL.status, active: true },
  { k: "رقم السجل التجاري", v: LEGAL.cr, ltr: true },
  { k: "الرقم الوطني الموحّد", v: LEGAL.unifiedNumber, ltr: true },
  { k: "نوع الكيان", v: LEGAL.entityType },
  { k: "تاريخ القيد", v: LEGAL.registrationDateAr },
  { k: "رأس المال", v: `${LEGAL.capital} ﷼` },
];

const PILLARS: { Icon: typeof IconShield; title: string; desc: string }[] = [
  {
    Icon: IconAnalytics,
    title: "الأرقام = الواقع 100%",
    desc: "لوحة تحليلات حيّة تشوف فيها ظهورك وزياراتك وعملاءك بأرقام حقيقية — لا تقارير مجمّلة.",
  },
  {
    Icon: IconShield,
    title: "حضور لا وعود",
    desc: "ما نقول «مضمون» ولا «تصدّر خلال أيام». نبني لك حضوراً تراكمياً حقيقياً على جوجل بهدوء.",
  },
  {
    Icon: IconBriefcase,
    title: "أسعار شاملة وواضحة",
    desc: "السعر اللي تشوفه شامل كل الرسوم والضرائب — بدون مفاجآت ولا بنود مخفية.",
  },
];

const CHECKS: { title: string; desc: string }[] = [
  {
    title: "فاتورة وسند رسمي",
    desc: "اشتراكك موثّق بفاتورة وسند رسمي — علاقتنا واضحة من أول لحظة، بدون عقود غامضة.",
  },
  { title: "باقة محدّدة بمميزاتها", desc: "تعرف بالضبط وش تشمل باقتك قبل ما تشترك — بدون مفاجآت." },
  { title: "دفع آمن", desc: "قنوات دفع موثوقة، وبياناتك محميّة." },
  { title: "سياسات معلنة", desc: "الخصوصية والاستخدام والاسترجاع — صفحات منشورة." },
];

const CONTACT: { Icon: typeof IconMapPin; k: string; v: string; ltr?: boolean }[] = [
  {
    Icon: IconMapPin,
    k: "العنوان (حسب السجل الرسمي)",
    v: `${LEGAL.city} — ${LEGAL.district} — ${LEGAL.street}`,
  },
  { Icon: IconEmail, k: "البريد الرسمي", v: CONTACT_EMAIL, ltr: true },
  { Icon: IconClock, k: "ساعات العمل", v: "على مدار الساعة — 24/7" },
  { Icon: IconMessage, k: "تواصل مباشر", v: "واتساب + نموذج تواصل + دعم داخل اللوحة" },
];

function sanitizeJsonLd(json: object): string {
  return JSON.stringify(json).replace(/</g, "\\u003c");
}

export default async function TrustPage() {
  let ogImageUrl: string | null = null;
  let whatsappHref: string | null = null;
  try {
    const [media, wa] = await Promise.all([getBrandMedia(), getWhatsappContactUrl()]);
    ogImageUrl = media.ogImageUrl;
    whatsappHref = wa;
  } catch (error) {
    console.error("Trust page settings fetch failed:", error);
  }

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "الموثوقية — مدونتي",
    description: PAGE_DESC,
    url: PAGE_URL,
    inLanguage: "ar",
    isPartOf: { "@type": "WebSite", name: BRAND_AR, url: SITE_URL },
    about: ORGANIZATION_JSONLD,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(ORGANIZATION_JSONLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(webPage) }}
      />

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Breadcrumb
          items={[
            { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
            { label: "الموثوقية" },
          ]}
        />

        <div className="space-y-4">
          {/* ── Identity header (company-profile style) ── */}
          <Card className="overflow-hidden">
            <div className="relative h-44 w-full overflow-hidden bg-[#0e065a] sm:h-56">
              {ogImageUrl ? (
                <NextImage
                  src={ogImageUrl}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 896px) 100vw, 896px"
                  className="object-cover object-center"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-l from-[#0e065a] to-[#3030ff]" />
              )}
              {/* Square brand mark — overlaid ON the banner (same favicon as the Google preview) */}
              <div className="absolute bottom-4 start-6 inline-flex rounded-2xl border-4 border-white bg-white shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/modonty-mark.svg"
                  alt={BRAND_AR}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-xl"
                />
              </div>
            </div>
            <div className="px-6 pb-6 pt-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h1 className="text-2xl font-semibold">{BRAND_AR}</h1>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">
                  <IconVerified className="h-4 w-4" />
                  موثّقة لدى وزارة التجارة
                </span>
              </div>
              <p className="mt-1.5 text-base text-foreground">
                منصة المحتوى العربي للأعمال — تعمل ضمن مظلّة {LEGAL.legalName}.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 font-medium text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-600" /> السجل نشط
                </span>
                <span>المقر: <span className="font-medium text-foreground">{LEGAL.city}، {LEGAL.country}</span></span>
                <span>السجل التجاري: <span className="font-medium text-foreground [direction:ltr]">{LEGAL.cr}</span></span>
              </div>
            </div>
          </Card>

          {/* ── Official commercial record ── */}
          <Card>
            <CardHeader>
              <CardTitleWithIcon title="السجل التجاري الرسمي" icon={IconFileCheck} />
              <CardDescription>
                الكيان القانوني المُشغِّل للمنصّة — صادر عن وزارة التجارة، المملكة العربية السعودية.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <figure className="m-0">
                  <a
                    href={LEGAL.certificateImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <NextImage
                      src={LEGAL.certificateImage}
                      alt="شهادة السجل التجاري — شركة جبر الجنوبية للمقاولات، الرقم الموحّد 7036024383، وزارة التجارة"
                      width={2573}
                      height={1818}
                      sizes="(max-width: 768px) 100vw, 520px"
                      priority
                      className="h-auto w-full rounded-lg border border-border"
                    />
                  </a>
                  <figcaption className="mt-2 text-center text-xs text-muted-foreground">
                    الشهادة الرسمية من وزارة التجارة · اضغط للتكبير · امسح الـ QR للتحقّق المباشر
                  </figcaption>
                </figure>

                <div>
                  <ul className="divide-y divide-border rounded-lg border border-border">
                    {FACTS.map((f) => (
                      <li
                        key={f.k}
                        className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                      >
                        <span className="text-muted-foreground">{f.k}</span>
                        <span
                          className={cn(
                            "text-end font-semibold",
                            f.ltr && "[direction:ltr]",
                            f.active && "text-green-600"
                          )}
                        >
                          {f.active && "● "}
                          {f.v}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <span className="font-semibold">تحقّق بنفسك:</span>
                    <a
                      href={LEGAL.verifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-primary underline underline-offset-4 hover:opacity-80"
                    >
                      المركز السعودي للأعمال
                      <IconExternal className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  <p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
                    تعمل منصّة <span className="font-semibold text-foreground">{BRAND_AR}</span> ضمن
                    مظلّة <span className="font-semibold text-foreground">{LEGAL.legalName}</span> —
                    كيان سعودي مسجّل رسمياً.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Why trust us ── */}
          <Card>
            <CardHeader>
              <CardTitleWithIcon title="ليش تثق فينا" icon={IconShield} />
              <CardDescription>
                نفس المبدأ اللي نكشف فيه أوراقنا، نطبّقه على شغلنا معك.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {PILLARS.map(({ Icon, title, desc }) => (
                  <div key={title} className="rounded-lg border border-border p-5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-1.5 text-base font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ── Location & contact ── */}
          <Card>
            <CardHeader>
              <CardTitleWithIcon title="فين تلقانا" icon={IconMapPin} />
              <CardDescription>عنوان حقيقي ووسائل تواصل مباشرة.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <ul className="space-y-4">
                  {CONTACT.map(({ Icon, k, v, ltr }) => (
                    <li key={k} className="flex gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <div className="text-xs text-muted-foreground">{k}</div>
                        <div className={cn("font-semibold", ltr && "[direction:ltr]")}>{v}</div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="overflow-hidden rounded-lg border border-border">
                  <iframe
                    title="خريطة موقع شركة جبر الجنوبية — جدة"
                    src={MAP_EMBED}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-64 w-full border-0 md:h-full"
                  />
                </div>
              </div>
              <a
                href={MAP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary underline underline-offset-4 hover:opacity-80"
              >
                افتح في خرائط جوجل
                <IconExternal className="h-3.5 w-3.5" />
              </a>
            </CardContent>
          </Card>

          {/* ── Transparency / commitments ── */}
          <Card>
            <CardHeader>
              <CardTitleWithIcon title="شفافيتنا معك" icon={IconCheckCircle} />
              <CardDescription>
                وضوح من أول يوم — تعاملنا معك موثّق بالفاتورة والباقة، بلا التزامات غامضة. ونلتزم
                بمتطلبات نظام التجارة الإلكترونية السعودي.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-4 sm:grid-cols-2">
                {CHECKS.map((c) => (
                  <li key={c.title} className="flex gap-3">
                    <IconSuccess className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                    <div>
                      <span className="block font-semibold">{c.title}</span>
                      <span className="text-sm text-muted-foreground">{c.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* ── CTA ── */}
          <Card>
            <CardContent className="py-8 text-center">
              <h2 className="text-xl font-semibold">عندك سؤال قبل تبدأ؟</h2>
              <p className="mt-1.5 text-muted-foreground">
                تواصل معنا مباشرة، أو شوف الباقات والأسعار بكل وضوح.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {whatsappHref ? (
                  <CtaTrackedLink
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    label="Trust Page CTA — تواصل واتساب"
                    type="BUTTON"
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <IconMessage className="h-4 w-4" />
                    تواصل عبر واتساب
                  </CtaTrackedLink>
                ) : (
                  <Link
                    href="/contact"
                    className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    تواصل معنا
                  </Link>
                )}
                <CtaTrackedLink
                  href="https://www.jbrseo.com/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  label="Trust Page CTA — شوف الباقات (جبر SEO)"
                  type="BUTTON"
                  className="inline-flex items-center gap-1 rounded-md border border-primary px-6 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                >
                  شوف الباقات <span aria-hidden="true">↗</span>
                </CtaTrackedLink>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
