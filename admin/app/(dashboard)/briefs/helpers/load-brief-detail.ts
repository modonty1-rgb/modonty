import { db } from "@/lib/db";
import { ArticleStatus, type NotificationPriority } from "@prisma/client";
import { mediaSrc } from "@modonty/database/lib/media-src";

// One client's writer brief.
//
// The select list below is the whole privacy story: money fields are not filtered out
// downstream, they are never read. No price, no payment state, no subscription status,
// no invoice, no opening balance, no password hash. `articlesPerMonth` is here because
// it is a content commitment — how many pieces we owe — not a sum of money.

export interface BriefArticle {
  id: string;
  title: string;
  status: ArticleStatus;
  datePublished: string | null;
  category: string | null;
}

/** One of the client's images — sized, because a designer's first question is "how big?". */
export interface BriefImage {
  id: string;
  url: string;
  altText: string | null;
  filename: string;
  width: number | null;
  height: number | null;
  fileSize: number | null;
  /** Where it is used: logo · cover · gallery · reel · article — plain Arabic. */
  role: string;
}

/** Logo, then cover, then the rest in the order the query returned (newest first). */
function brandRank(role: string): number {
  return role === "شعار" ? 0 : role === "غلاف" ? 1 : 2;
}

/** Media.type is a code; the designer needs the word. */
const ROLE_LABELS: Record<string, string> = {
  LOGO: "شعار",
  GALLERY: "معرض",
  HERO: "غلاف",
  OGIMAGE: "صورة مشاركة",
  POST: "صورة مقال",
  GENERAL: "عامة",
};

export interface BriefDetail {
  id: string;
  name: string;
  slug: string;
  slogan: string | null;
  description: string | null;
  businessBrief: string | null;
  industry: string | null;
  isYmyl: boolean;

  // Where a writer or designer can go LOOK at the client. Phone and email are absent on
  // purpose (Khalid 2026-08-05): nobody on the content side contacts the client, and the
  // fields only crowded out the facts that do get used.
  url: string | null;
  addressCity: string | null;
  addressRegion: string | null;
  addressCountry: string | null;
  sameAs: string[];

  // The questionnaire — the heart of the brief.
  intake: unknown;
  intakeUpdatedAt: Date | null;

  // Content commitment + what already exists, so nobody writes the same piece twice.
  monthlyQuota: number;
  publishedThisMonth: number;
  publishedTotal: number;
  recentArticles: BriefArticle[];
  categoriesUsed: { name: string; count: number }[];

  /** Every image this client owns — the designer's shelf. */
  images: BriefImage[];

  /** Notes the team was told about this client, newest first. */
  notifications: BriefNotification[];
}

export interface BriefNotification {
  id: string;
  message: string;
  priority: NotificationPriority;
  recipientNames: string[];
  sentByName: string;
  sentByEmail: string;
  delivered: boolean;
  error: string | null;
  createdAt: string;
}

export async function getBriefDetail(clientId: string): Promise<BriefDetail | null> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const client = await db.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      name: true,
      slug: true,
      slogan: true,
      description: true,
      businessBrief: true,
      isYmyl: true,
      url: true,
      addressCity: true,
      addressRegion: true,
      addressCountry: true,
      sameAs: true,
      intake: true,
      intakeUpdatedAt: true,
      articlesPerMonth: true,
      // Ids only. Which file is the logo is a relation ON THE CLIENT, not a value in
      // `Media.type` — without these the brand assets sit in the gallery labelled "عامة"
      // like any stock photo. The urls come from the gallery query itself.
      logoMedia: { select: { id: true } },
      heroImageMedia: { select: { id: true } },
      industry: { select: { name: true } },
      // Quota only — `price` is deliberately NOT selected.
      subscriptionTierConfig: { select: { articlesPerMonth: true } },
    },
  });
  if (!client) return null;

  const [recent, published, publishedThisMonth, media, notifications] = await Promise.all([
    db.article.findMany({
      where: { clientId },
      orderBy: [{ datePublished: "desc" }, { createdAt: "desc" }],
      take: 12,
      select: {
        id: true,
        title: true,
        status: true,
        datePublished: true,
        category: { select: { name: true } },
      },
    }),
    db.article.findMany({
      where: { clientId, status: ArticleStatus.PUBLISHED },
      select: { category: { select: { name: true } } },
    }),
    db.article.count({
      where: { clientId, status: ArticleStatus.PUBLISHED, datePublished: { gte: startOfMonth } },
    }),
    // Images only. A designer's shelf has no PDFs on it, and the video rows here carry a
    // playlist url that renders as a broken tile.
    db.media.findMany({
      where: { clientId, mimeType: { startsWith: "image/" } },
      orderBy: { createdAt: "desc" },
      take: 60,
      select: {
        id: true,
        url: true,
        bunnyUrl: true, blurDataURL: true,
        altText: true,
        filename: true,
        width: true,
        height: true,
        fileSize: true,
        type: true,
      },
    }),
    db.clientNotification.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        message: true,
        priority: true,
        recipientNames: true,
        sentByName: true,
        sentByEmail: true,
        delivered: true,
        error: true,
        createdAt: true,
      },
    }),
  ]);

  // Which subjects this client already owns — a writer picking the next topic needs the
  // shape of what exists, not just a list of titles.
  const counts = new Map<string, number>();
  for (const a of published) {
    const name = a.category?.name;
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  return {
    id: client.id,
    name: client.name,
    slug: client.slug,
    slogan: client.slogan,
    description: client.description,
    businessBrief: client.businessBrief,
    industry: client.industry?.name ?? null,
    isYmyl: client.isYmyl,
    url: client.url,
    addressCity: client.addressCity,
    addressRegion: client.addressRegion,
    addressCountry: client.addressCountry,
    sameAs: client.sameAs ?? [],
    intake: client.intake,
    intakeUpdatedAt: client.intakeUpdatedAt,
    monthlyQuota: client.articlesPerMonth ?? client.subscriptionTierConfig?.articlesPerMonth ?? 0,
    publishedThisMonth,
    publishedTotal: published.length,
    recentArticles: recent.map((a) => ({
      id: a.id,
      title: a.title,
      status: a.status,
      datePublished: a.datePublished?.toISOString() ?? null,
      category: a.category?.name ?? null,
    })),
    categoriesUsed: [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    images: media
      .map((m) => ({
        id: m.id,
        url: mediaSrc(m) ?? m.url,
        altText: m.altText,
        filename: m.filename,
        width: m.width,
        height: m.height,
        fileSize: m.fileSize,
        // The relation wins over the column: a logo is whatever the client POINTS at.
        role:
          m.id === client.logoMedia?.id
            ? "شعار"
            : m.id === client.heroImageMedia?.id
              ? "غلاف"
              : (ROLE_LABELS[m.type] ?? m.type),
      }))
      // A row whose url never resolved would render as a broken tile and make the whole
      // shelf look wrong.
      .filter((m) => !!m.url)
      // Brand first: the logo, then the cover, then everything else newest-first. A
      // designer opens this to grab the identity, not to scroll for it.
      .sort((a, b) => brandRank(a.role) - brandRank(b.role)),
    notifications: notifications.map((n) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
    })),
  };
}
