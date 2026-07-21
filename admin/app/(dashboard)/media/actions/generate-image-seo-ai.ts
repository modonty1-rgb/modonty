"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateImageSeoField, type ImageSeoField } from "@/lib/ai/gemini-image-seo";

// AI draft for ONE gallery image, written from the owning client's DATA (NOT from analysing
// the image — the doctor uploads case photos; the field/city/services are what matter). It
// does NOT save — the writer reviews the draft in the dialog and saves via saveImageSeo
// (human-in-the-loop, important for YMYL). One button per image, on demand.

const CLIENT_CTX = {
  id: true,
  name: true,
  addressCity: true,
  businessBrief: true,
  targetAudience: true,
  keywords: true,
  services: true,
  industry: { select: { name: true } },
} as const;

export async function generateImageSeoAi(
  mediaId: string,
  field: ImageSeoField,
): Promise<{ success: true; text: string } | { success: false; error: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "غير مصرّح" };

  if (!mediaId?.trim()) return { success: false, error: "معرّف الصورة مفقود" };
  if (field !== "altText" && field !== "description") {
    return { success: false, error: "حقل غير معروف" };
  }

  const media = await db.media.findUnique({
    where: { id: mediaId },
    select: {
      type: true,
      clientId: true,
      client: { select: CLIENT_CTX },
      logoClients: { select: CLIENT_CTX, take: 1 },
      heroImageClients: { select: CLIENT_CTX, take: 1 },
    },
  });
  if (!media) return { success: false, error: "الصورة غير موجودة" };

  const client = media.client ?? media.logoClients[0] ?? media.heroImageClients[0] ?? null;
  if (!client) {
    return { success: false, error: "لا يوجد عميل مرتبط بالصورة — التوليد يعتمد على بيانات العميل." };
  }

  // 1-based position of this image among the client's gallery, to push distinct angles.
  let galleryIndex: number | null = null;
  if (media.type === "GALLERY" && media.clientId) {
    const gallery = await db.media.findMany({
      where: { clientId: media.clientId, type: "GALLERY" },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    const pos = gallery.findIndex((g) => g.id === mediaId);
    if (pos >= 0) galleryIndex = pos + 1;
  }

  try {
    const text = await generateImageSeoField(
      {
        clientName: client.name,
        industry: client.industry?.name ?? null,
        city: client.addressCity,
        businessBrief: client.businessBrief,
        targetAudience: client.targetAudience,
        services: client.services?.map((s) => s.title).filter(Boolean) ?? [],
        keywords: client.keywords ?? [],
        galleryIndex,
      },
      field,
    );
    return { success: true, text };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "فشل التوليد" };
  }
}
