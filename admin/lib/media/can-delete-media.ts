"use server";

import { db } from "@/lib/db";
import { getMediaUsage } from "./get-media-usage";
import { PLATFORM_DEFAULT_PREFIX } from "./usage-where";

const SETTINGS_IMAGE_FIELDS = {
  logoUrl: "site logo",
  logoIconUrl: "site icon",
  ogImageUrl: "default share image",
  certificateImageUrl: "trust certificate",
  categoriesPageImage: "categories page image",
  tagsPageImage: "tags page image",
  industriesPageImage: "industries page image",
} as const;

/** Where on Modonty's own pages this file shows, named for the reason text — or null. */
async function findSiteReference(id: string): Promise<string | null> {
  const [m, settings] = await Promise.all([
    db.media.findUnique({
      where: { id },
      select: {
        url: true,
        bunnyUrl: true,
        filename: true,
        authorImages: { select: { name: true }, take: 1 },
        authorSocialImages: { select: { name: true }, take: 1 },
        categorySocialImages: { select: { name: true }, take: 1 },
        tagSocialImages: { select: { name: true }, take: 1 },
        industrySocialImages: { select: { name: true }, take: 1 },
        modontyHeroImages: { select: { title: true }, take: 1 },
        modontySocialImages: { select: { title: true }, take: 1 },
        introVideoClients: { select: { name: true }, take: 1 },
      },
    }),
    db.settings.findFirst({ select: Object.fromEntries(Object.keys(SETTINGS_IMAGE_FIELDS).map((k) => [k, true])) as Record<keyof typeof SETTINGS_IMAGE_FIELDS, true> }),
  ]);
  if (!m) return null;
  if (m.filename.startsWith(PLATFORM_DEFAULT_PREFIX)) return "platform default image (Settings › Defaults)";
  const linked =
    (m.authorImages[0] && `author «${m.authorImages[0].name}»`) ||
    (m.authorSocialImages[0] && `author «${m.authorSocialImages[0].name}»`) ||
    (m.categorySocialImages[0] && `category «${m.categorySocialImages[0].name}»`) ||
    (m.tagSocialImages[0] && `tag «${m.tagSocialImages[0].name}»`) ||
    (m.industrySocialImages[0] && `industry «${m.industrySocialImages[0].name}»`) ||
    (m.modontyHeroImages[0] && `page «${m.modontyHeroImages[0].title}»`) ||
    (m.modontySocialImages[0] && `page «${m.modontySocialImages[0].title}»`) ||
    (m.introVideoClients[0] && `intro video of «${m.introVideoClients[0].name}»`);
  if (linked) return linked;
  const urls = new Set([m.url, m.bunnyUrl].filter(Boolean));
  const field = settings
    ? (Object.keys(SETTINGS_IMAGE_FIELDS) as Array<keyof typeof SETTINGS_IMAGE_FIELDS>).find((k) => {
        const v = (settings as Record<string, string | null>)[k];
        return !!v && urls.has(v);
      })
    : undefined;
  return field ? `${SETTINGS_IMAGE_FIELDS[field]} (Settings)` : null;
}

export async function canDeleteMedia(id: string, clientId?: string) {
  try {
    const usageResult = await getMediaUsage(id, clientId);
    if (!usageResult.success) {
      return { canDelete: false, reason: usageResult.error as string };
    }

    const { usage } = usageResult;
    if (!usage) {
      return { canDelete: false, reason: "Failed to get usage information" };
    }

    // Check for published articles usage — as the featured image OR inside the gallery.
    // The gallery half was missing until 2026-07-13: deleting one of those images left a
    // hole in a live article, and nothing warned you.
    const publishedUsage = [...usage.featuredIn, ...usage.inArticle].filter(
      (a: { status: string }) => a.status === "PUBLISHED"
    );
    if (publishedUsage.length > 0) {
      return {
        canDelete: false,
        reason: `This media is used in ${publishedUsage.length} published article(s). Please remove it from articles first.`,
        usage: publishedUsage,
      };
    }

    // Check for Client media relations
    const { clientUsage } = usage;
    const logoClients = (clientUsage?.logoClients as Array<{ name: string }>) ?? [];
    const heroClients = (clientUsage?.heroImageClients as Array<{ name: string }>) ?? [];
    const mobileHeroClients = (clientUsage?.mobileHeroImageClients as Array<{ name: string }>) ?? [];

    if (logoClients.length > 0) {
      const names = logoClients.map((c) => c.name).join(", ");
      return {
        canDelete: false,
        reason: `This media is used as logo for client(s): ${names}. Please change the client's media settings first.`,
        usage: { clientUsage },
      };
    }
    if (heroClients.length > 0) {
      const names = heroClients.map((c) => c.name).join(", ");
      return {
        canDelete: false,
        reason: `This media is used as hero image for client(s): ${names}. Please change the client's media settings first.`,
        usage: { clientUsage },
      };
    }
    if (mobileHeroClients.length > 0) {
      const names = mobileHeroClients.map((c) => c.name).join(", ");
      return {
        canDelete: false,
        reason: `This media is used as mobile cover for client(s): ${names}. Please change the client's media settings first.`,
        usage: { clientUsage },
      };
    }

    // Modonty's own pages: an author, category, tag, industry or site page showing this file,
    // or a site setting holding its URL (logo, share image, listing-page images). None of these
    // was checked until 27 Sep 2026 — an industry's share image could be deleted from under it.
    const siteRef = await findSiteReference(id);
    if (siteRef) {
      return { canDelete: false, reason: `This media is used on Modonty: ${siteRef}. Change it there first.` };
    }

    // Client-owned GALLERY / CLIENT_MINI images are live on the client's page (gallery
    // ImageObject[] · sidebar slider · article client card) and consumed by clientId+type
    // with NO back-relation — deleting one leaves a hole with no warning. Block it. Same
    // data-loss class as the article-gallery guard above.
    // The mini image is the exception: the site shows only the NEWEST CLIENT_MINI of a client
    // (modonty get-article-content-by-slug: orderBy createdAt desc, take 1), so an older one is
    // not on any page. Blocking it too left every replaced mini undeletable (26 Sep 2026).
    let supersededMini = false;
    if (usage.ownerClientId && usage.mediaType === "CLIENT_MINI") {
      const newest = await db.media.findFirst({
        where: { clientId: usage.ownerClientId, type: "CLIENT_MINI" },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });
      supersededMini = !!newest && newest.id !== id;
    }
    const CLIENT_LIVE_TYPES = new Set<string>(["GALLERY", "CLIENT_MINI"]);
    if (usage.ownerClientId && CLIENT_LIVE_TYPES.has(usage.mediaType as string) && !supersededMini) {
      return {
        canDelete: false,
        reason:
          "This image belongs to a client's gallery/card and is live on their page. Remove it from the client in the console first.",
      };
    }

    // ريل رآه الزائر — أو ما زال في الطابور. الحارس كان يجهل الريلز تماماً (صفر ورود
    // لـ`inReels` أو `reelStatus`)، فصفّ ريل يُحذف من شاشة الوسائط بلا تحذير، ويبقى
    // الفيديو عند بني بلا مالك: مساحة مدفوعة ورابط عامّ مكسور، ولا مسار يستدعي
    // `deleteStreamVideo`. نفس صنف فقدان البيانات الذي عالجه حارس معرض المقال أعلاه.
    //
    // المؤرشف والمرفوض يُحذفان: خرجا من الواجهة العامّة وقرارهما اتُّخذ.
    const REEL_LIVE_STATUSES = new Set<string>(["DRAFT", "PENDING_APPROVAL", "APPROVED", "PUBLISHED"]);
    const reelStatus = usage.reelStatus as string | null;
    if (usage.inReels || (reelStatus && REEL_LIVE_STATUSES.has(reelStatus))) {
      const label =
        reelStatus === "PUBLISHED"
          ? "منشور على مدونتي"
          : reelStatus === "APPROVED"
            ? "معتمَد وينتظر النشر"
            : reelStatus === "PENDING_APPROVAL"
              ? "في طابور الاعتماد"
              : "مسوّدة ريل";
      return {
        canDelete: false,
        reason: `هذا الوسيط ريل ${label}. أرشفه من شاشة الريلز أوّلاً — الحذف من هنا يترك الفيديو عند بني بلا مالك.`,
        usage,
      };
    }

    return { canDelete: true, usage };
  } catch (error) {
    return { canDelete: false, reason: "Failed to check media usage" };
  }
}
