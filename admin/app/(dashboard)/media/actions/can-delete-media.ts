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

    // Check for published articles usage
    const publishedUsage = usage.featuredIn.filter(
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

    return { canDelete: true, usage };
  } catch (error) {
    return { canDelete: false, reason: "Failed to check media usage" };
  }
}
