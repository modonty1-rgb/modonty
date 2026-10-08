import type { SocialAssetKind, SocialPostStatus } from "@prisma/client";

import { db } from "@/lib/db";

export interface GalleryAsset {
  id: string;
  kind: SocialAssetKind;
  url: string;
  label: string | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
}

export interface GalleryPost {
  id: string;
  scheduledFor: Date;
  idea: string;
  status: SocialPostStatus;
  assets: GalleryAsset[];
}

/**
 * معرض الإبداع — كل منشورات العميل التي فيها أصل واحد على الأقل.
 * كالقديم (`getEntriesWithAssets`): لا يستثني المؤرشف — المعرض أرشيف الإبداع كلّه.
 */
export async function getClientGallery(clientId: string): Promise<GalleryPost[]> {
  return db.socialPost.findMany({
    where: { clientId, assets: { some: {} } },
    orderBy: [{ scheduledFor: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      scheduledFor: true,
      idea: true,
      status: true,
      assets: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        select: { id: true, kind: true, url: true, label: true, width: true, height: true, bytes: true },
      },
    },
  });
}
