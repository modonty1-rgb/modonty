import { cacheTag, cacheLife } from "next/cache";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { db } from "@/lib/db";
import { Prisma, ArticleStatus, ClientCtaMode, SubscriptionStatus } from "@prisma/client";
import type { ClientResponse } from "@/lib/types";

/** بطاقة الخدمة في الشريط السفلي — لا يقرأها غير هذا الملف. */
export interface ClientServiceCardData {
  id: string;
  label: string;
  visual: "booking" | "shop";
}

function getClientServiceVisual(mode: ClientCtaMode): ClientServiceCardData["visual"] {
  if (mode === "FORM") return "booking";
  return "shop";
}

export async function getServicesCard(): Promise<ClientServiceCardData[]> {
  "use cache";
  cacheTag("clients");
  cacheLife("hours");
  const presets = await db.ctaPreset.findMany({
    where: { isActive: true },
    select: { id: true, labelAr: true, labelKey: true, mode: true },
    orderBy: { sortOrder: "asc" },
  });
  const counts = await db.client.groupBy({
    by: ["ctaPresetId"],
    where: { subscriptionStatus: SubscriptionStatus.ACTIVE, ctaPresetId: { in: presets.map((preset) => preset.id) } },
    _count: { _all: true },
  });
  const countByPreset = new Map(counts.map((item) => [item.ctaPresetId, item._count._all]));
  return presets
    .filter((preset) => preset.mode === "FORM" || preset.labelKey.includes("تسوق"))
    .filter((preset) => preset.labelKey.includes("تسوق") || (countByPreset.get(preset.id) ?? 0) > 0)
    .map((preset) => ({
      id: preset.id,
      label: preset.labelAr,
      visual: getClientServiceVisual(preset.mode),
    }));
}
