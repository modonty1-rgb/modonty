"use server";

import { getMediaUsage } from "./get-media-usage";

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

    // Client-owned GALLERY / CLIENT_MINI images are live on the client's page (gallery
    // ImageObject[] · sidebar slider · article client card) and consumed by clientId+type
    // with NO back-relation — deleting one leaves a hole with no warning. Block it. Same
    // data-loss class as the article-gallery guard above.
    const CLIENT_LIVE_TYPES = new Set<string>(["GALLERY", "CLIENT_MINI"]);
    if (usage.ownerClientId && CLIENT_LIVE_TYPES.has(usage.mediaType as string)) {
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
