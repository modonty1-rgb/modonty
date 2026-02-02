"use server";

import { getMediaUsage } from "./get-media-usage";

export async function canDeleteMedia(id: string, clientId?: string) {
  try {
    const usageResult = await getMediaUsage(id, clientId);
    if (!usageResult.success) {
      return { canDelete: false, reason: usageResult.error };
    }

    const { usage } = usageResult;
    if (!usage) {
      return { canDelete: false, reason: "Failed to get usage information" };
    }

    // Check for published articles usage
    const publishedUsage = usage.featuredIn.filter((a) => a.status === "PUBLISHED");
    if (publishedUsage.length > 0) {
      return {
        canDelete: false,
        reason: `This media is used in ${publishedUsage.length} published article(s). Please remove it from articles first.`,
        usage: publishedUsage,
      };
    }

    // Check for Client media relations
    const { clientUsage } = usage;
    const logoClients = clientUsage?.logoClients ?? [];
    const ogClients = clientUsage?.ogImageClients ?? [];
    const twitterClients = clientUsage?.twitterImageClients ?? [];

    if (logoClients.length > 0) {
      const names = logoClients.map((c) => c.name).join(", ");
      return {
        canDelete: false,
        reason: `This media is used as logo for client(s): ${names}. Please change the client's media settings first.`,
        usage: { clientUsage },
      };
    }
    if (ogClients.length > 0) {
      const names = ogClients.map((c) => c.name).join(", ");
      return {
        canDelete: false,
        reason: `This media is used as OG image for client(s): ${names}. Please change the client's media settings first.`,
        usage: { clientUsage },
      };
    }
    if (twitterClients.length > 0) {
      const names = twitterClients.map((c) => c.name).join(", ");
      return {
        canDelete: false,
        reason: `This media is used as Twitter image for client(s): ${names}. Please change the client's media settings first.`,
        usage: { clientUsage },
      };
    }

    return { canDelete: true, usage };
  } catch (error) {
    return { canDelete: false, reason: "Failed to check media usage" };
  }
}
