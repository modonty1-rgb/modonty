import { ArticleStatus, CommentStatus, type PrismaClient } from "@prisma/client";
import { mediaSrc } from "../media-src";
import type { HomeData } from "../../components/partner-site/free/home";


const DAY_AR: Record<string, string> = {
  Saturday: "السبت", Sunday: "الأحد", Monday: "الاثنين", Tuesday: "الثلاثاء",
  Wednesday: "الأربعاء", Thursday: "الخميس", Friday: "الجمعة",
};

/** `openingHoursSpecification` JSON → «اليوم · من–إلى» rows; unknown shapes → []. */
function parseHours(raw: unknown): { day: string; time: string }[] {
  if (!Array.isArray(raw)) return [];
  const rows: { day: string; time: string }[] = [];
  for (const rec of raw as Array<Record<string, unknown>>) {
    const days = Array.isArray(rec.dayOfWeek) ? rec.dayOfWeek : [rec.dayOfWeek];
    const opens = typeof rec.opens === "string" ? rec.opens : "";
    const closes = typeof rec.closes === "string" ? rec.closes : "";
    if (!opens || !closes) continue;
    for (const d of days) {
      if (typeof d !== "string") continue;
      const key = d.split("/").pop() ?? d;
      rows.push({ day: DAY_AR[key] ?? key, time: `${opens}–${closes}` });
    }
  }
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
  const [client, reviews, gallery, faqs, articles] = await Promise.all([
    db.client.findUnique({
      where: { id: clientId },
      select: {
        name: true, slug: true, slogan: true, description: true, legalName: true, phone: true, email: true, ctaMode: true, ctaLabel: true, ctaUrl: true,
        addressStreet: true, addressCity: true, addressLatitude: true, addressLongitude: true,
        foundingDate: true, openingHoursSpecification: true, commercialRegistrationNumber: true, verificationImageUrl: true,
        site: { select: { primaryColor: true, hiddenSections: true } },
        industry: { select: { name: true } },
        logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
        heroImageMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true, width: true, height: true } },
        introVideoMedia: { select: { mp4Url: true, thumbnailUrl: true, title: true } },
        services: { select: { title: true, description: true } },
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
      take: 40, // the FAQ page shows them all; home takes its 6 from the front
      select: { question: true, answer: true },
    }),
    db.article.findMany({
      where: { clientId, status: ArticleStatus.PUBLISHED },
      orderBy: { datePublished: "desc" },
      take: 13, // blog index: 1 featured + 12; home takes its 3 from the front
      select: { title: true, slug: true, datePublished: true, excerpt: true, category: { select: { name: true } }, featuredImage: { select: { url: true, bunnyUrl: true, blurDataURL: true } } },
    }),
  ]);
  if (!client) return null;


  const foundingYear = client.foundingDate ? new Intl.DateTimeFormat("ar-SA", { year: "numeric" }).format(client.foundingDate) : null;
  const dateFmt = new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" });
  const mapHref =
    client.addressLatitude != null && client.addressLongitude != null
      ? `https://www.google.com/maps?q=${client.addressLatitude},${client.addressLongitude}`
      : null;

  const data: HomeData = {
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
      verified: Boolean(client.commercialRegistrationNumber || client.legalName || client.verificationImageUrl),
      credentials: client.credentials.filter((c) => c.name?.trim()).map((c) => ({ name: c.name, authority: c.authority ?? null, year: c.year ?? null })),
    },
    about: { description: client.description, legalName: client.legalName },
    services: client.services.filter((s) => s.title?.trim()).map((s) => ({ title: s.title, description: s.description ?? null })),
    stats: client.achievements.filter((a) => a.value && a.label).map((a) => ({ value: a.value, label: a.label })),
    testimonials: reviews.map((r) => ({ rating: r.rating, comment: r.comment, author: r.reviewer?.name ?? "عميل" })),
    gallery: gallery.map((m) => ({ url: mediaSrc(m) ?? m.url, alt: m.altText ?? "", width: m.width ?? null, height: m.height ?? null })).filter((g) => g.url),
    team: client.teamMembers.filter((m) => m.name?.trim()).map((m) => ({ name: m.name, role: m.role ?? null, photoUrl: m.photoUrl ?? null })),
    video: client.introVideoMedia?.mp4Url
      ? { url: client.introVideoMedia.mp4Url, posterUrl: client.introVideoMedia.thumbnailUrl ?? null, title: client.introVideoMedia.title ?? null }
      : null,
    faqs: faqs.filter((f): f is { question: string; answer: string } => Boolean(f.answer)),
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
      mapEmbedSrc:
        client.addressLatitude != null && client.addressLongitude != null
          ? `https://www.google.com/maps?q=${client.addressLatitude},${client.addressLongitude}&z=15&output=embed`
          : null,
      hours: parseHours(client.openingHoursSpecification),
    },
  };

  return { data, hiddenSections: client.site?.hiddenSections ?? [], slug: client.slug };
}
