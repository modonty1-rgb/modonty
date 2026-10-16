import type { VideoPublishItem } from "@prisma/client";

import { PLATFORMS_FOR_ASSET, type AssetKey } from "./video-api-values";

/**
 * بنود الاعتماد (ملف × منصة) بعد إرسالٍ من السيرفر — قواعد العقد (Q4 · F2 · F3):
 *  • revision جديدة: `published` و`skipped` تبقى؛ كل ما سواها (rejected · approved غير المنشور · failed)
 *    يرجع `pending` لأن الملف تغيّر ويحتاج نظرة.
 *  • نفس الـrevision (إعادة إرسال آمنة): البنود تبقى كما هي.
 *  • ملف اختفى من الإرسال: يبقى بنده لو منشوراً (تاريخ)، وإلا يُحذف.
 */
export function buildPublishItems(
  assets: AssetKey[],
  previous: VideoPublishItem[],
  isNewRevision: boolean,
  now: Date,
): VideoPublishItem[] {
  const key = (i: Pick<VideoPublishItem, "asset" | "platform">) => `${i.asset}|${i.platform}`;
  const prev = new Map(previous.map((i) => [key(i), i]));
  const wanted = assets.flatMap((asset) => PLATFORMS_FOR_ASSET(asset).map((platform) => ({ asset, platform })));
  const wantedKeys = new Set(wanted.map(key));

  const items = wanted.map((w): VideoPublishItem => {
    const old = prev.get(key(w));
    if (!old) return blank(w.asset, w.platform, now);
    if (!isNewRevision || old.status === "PUBLISHED" || old.status === "SKIPPED") return old;
    return { ...blank(w.asset, w.platform, now), note: old.note };
  });
  // A published item whose file left the payload stays — it is live on the platform.
  const kept = previous.filter((i) => !wantedKeys.has(key(i)) && i.status === "PUBLISHED");
  return [...items, ...kept];
}

function blank(asset: string, platform: VideoPublishItem["platform"], now: Date): VideoPublishItem {
  return {
    asset,
    platform,
    status: "PENDING",
    approvedById: null,
    approvedByName: null,
    approvedAt: null,
    note: null,
    externalId: null,
    url: null,
    postedManuallyAt: null,
    error: null,
    updatedAt: now,
  };
}
