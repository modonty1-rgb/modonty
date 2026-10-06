import { ArticleStatus, CommentStatus, type PrismaClient } from "@prisma/client";
import { mediaSrc } from "../media-src";
import { SITE_LOCALE_GREGORIAN } from "../constants/locale";
import type { HomeData } from "../../components/partner-site/free/home";


const DAY_AR: Record<string, string> = {
  Saturday: "السبت", Sunday: "الأحد", Monday: "الاثنين", Tuesday: "الثلاثاء",
  Wednesday: "الأربعاء", Thursday: "الخميس", Friday: "الجمعة",
};

const WEEK = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
const AR_DIGITS = new Intl.NumberFormat("ar-EG", { useGrouping: false });

/** «09:00» → «٩ ص» · «13:30» → «١:٣٠ م» · a 23:59/24:00/00:00 close → «منتصف الليل». */
function arTime(hhmm: string, isClose: boolean): string {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  if (isClose && ((h === 23 && m >= 59) || h === 24 || (h === 0 && m === 0))) return "منتصف الليل";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mm = m ? `:${AR_DIGITS.format(m).padStart(2, "٠")}` : "";
  return `${AR_DIGITS.format(h12)}${mm} ${h < 12 ? "ص" : "م"}`;
}

/**
 * `openingHoursSpecification` JSON → rows a visitor reads at a glance (4 Oct 2026). It printed
 * one Latin row per day — «09:00-23:59» seven times for a partner open every day — and split
 * shifts repeated the day (duplicate React keys). Now: a day's shifts join into one line, days
 * with the same hours merge into a range («السبت – الخميس»), and all seven equal → «يومياً».
 */
function parseHours(raw: unknown): { day: string; time: string }[] {
  if (!Array.isArray(raw)) return [];
  const byDay = new Map<string, string[]>();
  for (const rec of raw as Array<Record<string, unknown>>) {
    const days = Array.isArray(rec.dayOfWeek) ? rec.dayOfWeek : [rec.dayOfWeek];
    const opens = typeof rec.opens === "string" ? rec.opens : "";
    const closes = typeof rec.closes === "string" ? rec.closes : "";
    // A day marked `closed` read «١٢ ص – منتصف الليل» — open all day — because its 00:00–00:00
    // placeholder times were printed as hours (4 Oct 2026, test partner's Friday). It says «مغلق».
    const closed = rec.closed === true;
    if (!closed && (!opens || !closes)) continue;
    for (const d of days) {
      if (typeof d !== "string") continue;
      const key = d.split("/").pop() ?? d;
      const list = byDay.get(key) ?? [];
      list.push(closed ? "مغلق" : `${arTime(opens, false)} – ${arTime(closes, true)}`);
      byDay.set(key, list);
    }
  }
  const ordered = WEEK.filter((d) => byDay.has(d)).map((d) => ({ key: d, time: byDay.get(d)!.join(" · ") }));
  if (ordered.length === 7 && ordered.every((r) => r.time === ordered[0].time)) return [{ day: "يومياً", time: ordered[0].time }];
  const rows: { day: string; time: string }[] = [];
  for (let i = 0; i < ordered.length; ) {
    let j = i;
    while (j + 1 < ordered.length && ordered[j + 1].time === ordered[i].time && WEEK.indexOf(ordered[j + 1].key) === WEEK.indexOf(ordered[j].key) + 1) j++;
    const label = j > i ? `${DAY_AR[ordered[i].key]} – ${DAY_AR[ordered[j].key]}` : (DAY_AR[ordered[i].key] ?? ordered[i].key);
    rows.push({ day: label, time: ordered[i].time });
    i = j + 1;
  }
  // Days outside the known week names (unexpected data) keep their raw label rather than vanish.
  for (const [k, v] of byDay) if (!WEEK.includes(k as (typeof WEEK)[number])) rows.push({ day: k, time: v.join(" · ") });
  return rows;
}

export interface HomeDataResult {
  data: HomeData;
  hiddenSections: string[];
  slug: string;
}

/**
 * Everything the partner-site blocks render, read once from the client row (+ counts/
 * relations). Shared by the console (previews) and modonty (the live site) so both draw
 * from the SAME object — the app passes its own Prisma singleton, like the SEO bundle.
 */
export async function getHomeData(db: PrismaClient, where: { id: string } | { slug: string }): Promise<HomeDataResult | null> {
  const clientRow = await db.client.findUnique({ where, select: { id: true } });
  if (!clientRow) return null;
  const clientId = clientRow.id;
  const [client, reviews, gallery, faqs, articleFaqs, articles, reels] = await Promise.all([
    db.client.findUnique({
      where: { id: clientId },
      select: {
        name: true, slug: true, slogan: true, description: true, legalName: true, phone: true, email: true, ctaMode: true, ctaLabel: true, ctaUrl: true, isYmyl: true,
        addressStreet: true, addressCity: true, addressLatitude: true, addressLongitude: true,
        foundingDate: true, openingHoursSpecification: true, commercialRegistrationNumber: true, verificationImageUrl: true, isVerified: true,
        site: { select: { primaryColor: true, hiddenSections: true } },
        industry: { select: { name: true } },
        logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
        heroImageMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true, width: true, height: true } },
        introVideoMedia: { select: { mp4Url: true, thumbnailUrl: true, title: true, width: true, height: true } },
        services: { select: { title: true, description: true, icon: true } },
        achievements: { select: { value: true, label: true } },
        credentials: { select: { name: true, authority: true, year: true } },
        teamMembers: { select: { name: true, role: true, photoUrl: true } },
      },
    }),
    db.clientReview.findMany({
      where: { clientId, status: CommentStatus.APPROVED },
      orderBy: { createdAt: "desc" },
      take: 30, // the reviews page shows them all; home takes its 3 from the front
      select: { rating: true, comment: true, reviewer: { select: { name: true } } },
    }),
    db.media.findMany({
      where: { clientId, inGallery: true, type: "GALLERY" },
      orderBy: { createdAt: "desc" },
      take: 40, // the portfolio page shows them all (justified rows); home takes its 5 from the front
      select: { url: true, bunnyUrl: true, blurDataURL: true, altText: true, width: true, height: true },
    }),
    db.clientFAQ.findMany({
      where: { clientId, status: "PUBLISHED", answer: { not: null } },
      // Was 40; one partner has 47 published (production, 4 Oct 2026). The FAQ page shows them all.
      take: 100,
      select: { question: true, answer: true },
    }),
    /**
     * أسئلة مقالاته أيضاً (خالد ٣٠ أغسطس: «برضو هذه أسئلة تخص العميل — ضيفها»).
     * السؤال الذي وافق عليه الشريك تحت مقاله جوابٌ منه، فلا معنى لحجبه عن صفحة أسئلته.
     * `PUBLISHED` وحدها: المعلّقة لم يوافق عليها بعد.
     */
    db.articleFAQ.findMany({
      where: { status: "PUBLISHED", answer: { not: null }, article: { clientId, status: ArticleStatus.PUBLISHED } },
      orderBy: [{ articleId: "asc" }, { position: "asc" }],
      take: 100,
      select: { question: true, answer: true },
    }),
    db.article.findMany({
      where: { clientId, status: ArticleStatus.PUBLISHED },
      orderBy: { datePublished: "desc" },
      // Was 13 — the partner's articles page stopped there with no next page, while one partner has
      // 48 published (production, read 4 Oct 2026; next largest 19 and 16). 60 covers every partner
      // today; the home page still takes its 3 from the front. Pagination is the step after this.
      take: 60,
      select: { title: true, slug: true, datePublished: true, excerpt: true, category: { select: { name: true } }, featuredImage: { select: { url: true, bunnyUrl: true, blurDataURL: true } } },
    }),
    // Same definition of a reel as `/reels`: `inReels` + PUBLISHED. A reel with no `reelSlug`
    // is left out — its watch URL would 404.
    db.media.findMany({
      where: { clientId, inReels: true, reelStatus: "PUBLISHED", reelSlug: { not: null } },
      orderBy: [{ reelPublishedAt: "desc" }, { id: "desc" }],
      take: 60, // the reels page shows them all; home takes its first ones
      select: { title: true, reelSlug: true, url: true, bunnyUrl: true, blurDataURL: true, thumbnailUrl: true, bunnyVideoId: true },
    }),
  ]);
  if (!client) return null;


  // `ar-SA` alone prints Hijri (its default calendar is islamic-umalqura), and `dateStyle:
  // "medium"` printed «٠١/٠٥/٢٠١٢» — a date the reader cannot tell day from month in. Gregorian,
  // month in words (4 Oct 2026).
  const foundingYear = client.foundingDate ? new Intl.DateTimeFormat(SITE_LOCALE_GREGORIAN, { year: "numeric", timeZone: "UTC" }).format(client.foundingDate) : null;
  const dateFmt = new Intl.DateTimeFormat(SITE_LOCALE_GREGORIAN, { day: "numeric", month: "long", year: "numeric" });
  /**
   * الخريطة من الإحداثيات إن وُجدت، وإلّا من العنوان النصّي.
   *
   * كانت على الإحداثيات وحدها، ولا حقل لها في شاشة «بيانات نشاطك» أصلاً (مقيس ٣١ أغسطس:
   * صفر حقل lat/lng) — فقسم الخريطة كان فارغاً عند كل شريك مهما كتب عنوانه كاملاً، بلا
   * طريق يملؤه به. وقوقل يقبل النصّ في `?q=` كما يقبل الإحداثيات، بلا مفتاح.
   */
  const mapQuery =
    client.addressLatitude != null && client.addressLongitude != null
      ? `${client.addressLatitude},${client.addressLongitude}`
      : [client.addressStreet, client.addressCity].filter(Boolean).join(", ") || null;
  const mapHref = mapQuery ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}` : null;

  const data: HomeData = {
    clientId,
    isYmyl: client.isYmyl,
    name: client.name,
    primaryColor: client.site?.primaryColor ?? null,
    phone: client.phone,
    booking: { mode: client.ctaMode, label: client.ctaLabel ?? null, url: client.ctaUrl ?? null },
    hero: {
      slogan: client.slogan,
      description: client.description,
      coverUrl: mediaSrc(client.heroImageMedia),
      coverWidth: client.heroImageMedia?.width ?? null,
      coverHeight: client.heroImageMedia?.height ?? null,
      logoUrl: mediaSrc(client.logoMedia),
      industry: client.industry?.name ?? null,
      city: client.addressCity,
      foundingYear,
    },
    trust: {
      // خانةُ الأدمن وحدها (خالد ١٧ سبتمبر): السجلّ التجاريّ والاسم النظاميّ وصورة التوثيق
      // بياناتٌ يدخلها العميل، فامتلاؤها لا يعني أنّ أحداً راجعها.
      verified: client.isVerified,
      credentials: client.credentials.filter((c) => c.name?.trim()).map((c) => ({ name: c.name, authority: c.authority ?? null, year: c.year ?? null })),
    },
    about: { description: client.description, legalName: client.legalName },
    services: client.services.filter((s) => s.title?.trim()).map((s) => ({ title: s.title, description: s.description ?? null, icon: s.icon ?? null })),
    stats: client.achievements.filter((a) => a.value && a.label).map((a) => ({ value: a.value, label: a.label })),
    testimonials: reviews.map((r) => ({ rating: r.rating, comment: r.comment, author: r.reviewer?.name ?? "عميل" })),
    // No alt text was an empty alt — a screen reader skipped every photo, and image search had
    // nothing to index. The partner's name plus a number is the honest fallback (4 Oct 2026).
    gallery: gallery.map((m, i) => ({ url: mediaSrc(m) ?? m.url, alt: m.altText?.trim() || `صورة من ${client.name} ${i + 1}`, width: m.width ?? null, height: m.height ?? null })).filter((g) => g.url),
    team: client.teamMembers.filter((m) => m.name?.trim()).map((m) => ({ name: m.name, role: m.role ?? null, photoUrl: m.photoUrl ?? null })),
    video: client.introVideoMedia?.mp4Url
      ? { url: client.introVideoMedia.mp4Url, posterUrl: client.introVideoMedia.thumbnailUrl ?? null, title: client.introVideoMedia.title ?? null, width: client.introVideoMedia.width ?? null, height: client.introVideoMedia.height ?? null }
      : null,
    // أسئلة الصفحة أوّلاً (كتبها بنفسه)، ثم أسئلة مقالاته — بلا تكرار نصّ السؤال.
    faqs: [...faqs, ...articleFaqs]
      .filter((f): f is { question: string; answer: string } => Boolean(f.answer))
      .filter((f, i, all) => all.findIndex((x) => x.question.trim() === f.question.trim()) === i),
    blogHref: `/clients/${client.slug}/articles`,
    bookHref: `/clients/${client.slug}/book`,
    reelsHref: `/clients/${client.slug}/reels`,
    servicesHref: `/clients/${client.slug}/services`,
    reviewsHref: `/clients/${client.slug}/reviews`,
    photosHref: `/clients/${client.slug}/photos`,
    faqHref: `/clients/${client.slug}/faq`,
    reels: reels.map((r) => ({
      title: r.title ?? "",
      href: `/reels/${encodeURIComponent(r.reelSlug ?? "")}`,
      // A video reel's still is its Bunny thumbnail; an image reel is its own picture.
      imageUrl: r.bunnyVideoId ? (r.thumbnailUrl ?? mediaSrc(r)) : mediaSrc(r),
    })),
    posts: articles.map((a) => ({
      title: a.title,
      href: `/articles/${a.slug}`,
      imageUrl: mediaSrc(a.featuredImage),
      date: a.datePublished ? dateFmt.format(a.datePublished) : null,
      excerpt: a.excerpt ?? null,
      category: a.category?.name ?? null,
    })),
    contact: {
      address: [client.addressStreet, client.addressCity].filter(Boolean).join("، ") || null,
      email: client.email,
      mapHref,
      mapEmbedSrc: mapQuery
        ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`
        : null,
      hours: parseHours(client.openingHoursSpecification),
    },
  };

  return { data, hiddenSections: client.site?.hiddenSections ?? [], slug: client.slug };
}
