"use server";

import { randomUUID } from "node:crypto";

import { db } from "@/lib/db";
import { bunnyWritePath, getBunnyPublicUrl } from "@modonty/shared/lib/bunny";
import { bunnyObjectSize, createBunnyUploadTicket } from "@modonty/shared/lib/bunny-upload-ticket";
import type { TicketResult } from "@modonty/shared/lib/direct-upload";

import { objectIdSchema } from "../helpers/post-schema";
import { ASSETS_LOCKED_STATUSES } from "../helpers/post-transitions";
import { requireSocialActor } from "../helpers/require-social-actor";
import { revalidateSocialCalendar } from "../helpers/revalidate-social-calendar";
import type { ActionResultWith } from "./action-result";

/**
 * صور الإبداع تُرفع من المتصفح إلى Bunny مباشرة عبر المسار الموحّد (`shared/lib/direct-upload.ts`) —
 * لا تمرّ على Vercel ولا سقفه ٤٫٥MB. هنا سياسة الكاليندر فقط: من يرفع، وإلى أين.
 * ١) `requestSocialImageUpload`: صلاحية الإنتاج + حالة المنشور، ثم تذكرة لمسار واحد بحجم الملف بالضبط.
 * ٢) المتصفح يرفع بـ PUT إلى سكربت Edge على بني (`shared/lib/bunny-upload-ticket.ts`).
 * ٣) `registerSocialImageAsset`: يتأكّد أنّ الملف وصل بنفس الحجم وفي مسار هذا المنشور، ثم يسجّله.
 * بلا إعداد الرفع المباشر ترجع التذكرة null، والمتصفح يكمل بالمسار القديم (`production/upload`، ٤MB).
 */
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

async function loadEditablePost(postId: string) {
  const post = await db.socialPost.findUnique({
    where: { id: postId },
    select: { id: true, status: true, calendarId: true },
  });
  if (!post) return { error: "المنشور غير موجود" } as const;
  if (ASSETS_LOCKED_STATUSES.includes(post.status)) return { error: "الإبداع مقفل بعد الموافقة" } as const;
  return { post } as const;
}

export async function requestSocialImageUpload(
  postId: string,
  mime: string,
  bytes: number,
): Promise<TicketResult> {
  const actor = await requireSocialActor("produce");
  if ("error" in actor) return { ok: false, error: actor.error };
  if (!objectIdSchema.safeParse(postId).success) return { ok: false, error: "معرّف غير صالح" };

  const ext = EXT_BY_MIME[mime];
  if (!ext) return { ok: false, error: "الصيغة غير مدعومة — JPG · PNG · WebP · GIF · AVIF" };
  if (!Number.isInteger(bytes) || bytes <= 0) return { ok: false, error: "ملف فارغ" };
  if (bytes > MAX_IMAGE_BYTES) {
    return { ok: false, error: `حجم الملف ${(bytes / 1024 / 1024).toFixed(1)}MB أكبر من الحد المسموح (10MB للصور).` };
  }

  try {
    const loaded = await loadEditablePost(postId);
    if ("error" in loaded) return { ok: false, error: loaded.error ?? "تعذّر فتح المنشور" };
    const { post } = loaded;

    const ticket = createBunnyUploadTicket({
      zone: "clients",
      path: `social/${post.calendarId}/${post.id}/${randomUUID()}.${ext}`,
      maxBytes: bytes,
    });
    return { ok: true, url: ticket?.url ?? null, path: ticket?.path };
  } catch (error) {
    console.error("[social-calendar] requestSocialImageUpload failed", error);
    return { ok: false, error: "تعذّر تجهيز رفع الصورة — حاول مرة أخرى" };
  }
}

export async function registerSocialImageAsset(input: {
  postId: string;
  path: string;
  bytes: number;
  width: number;
  height: number;
  label: string;
}): Promise<
  ActionResultWith<{
    asset: { id: string; kind: "IMAGE" | "VIDEO"; url: string; label: string | null; width: number | null; height: number | null; bytes: number | null; bunnyVideoId: string | null };
  }>
> {
  const actor = await requireSocialActor("produce");
  if ("error" in actor) return { success: false, error: actor.error };
  if (!objectIdSchema.safeParse(input.postId).success) return { success: false, error: "معرّف غير صالح" };

  try {
    const loaded = await loadEditablePost(input.postId);
    if ("error" in loaded) return { success: false, error: loaded.error ?? "تعذّر فتح المنشور" };
    const { post } = loaded;

    // المسار لازم يكون داخل مجلّد هذا المنشور — لا يُسجَّل ملف من مكان آخر.
    const prefix = bunnyWritePath(`social/${post.calendarId}/${post.id}/`);
    if (!input.path.startsWith(prefix) || input.path.includes("..")) return { success: false, error: "مسار غير صالح" };

    const size = await bunnyObjectSize("clients", input.path);
    if (size === null || size !== input.bytes) {
      console.error("[social-calendar] direct upload not confirmed", { path: input.path, expected: input.bytes, got: size });
      return { success: false, error: "لم يكتمل الرفع إلى Bunny — حاول مرة أخرى" };
    }

    const order = await db.socialPostAsset.count({ where: { postId: post.id } });
    const asset = await db.socialPostAsset.create({
      data: {
        postId: post.id,
        kind: "IMAGE",
        url: getBunnyPublicUrl("clients", input.path),
        path: input.path,
        label: input.label.trim().slice(0, 200) || null,
        bytes: input.bytes,
        width: input.width > 0 ? Math.round(input.width) : null,
        height: input.height > 0 ? Math.round(input.height) : null,
        order,
        uploadedById: actor.staffId,
      },
      select: { id: true, kind: true, url: true, label: true, width: true, height: true, bytes: true, bunnyVideoId: true },
    });

    revalidateSocialCalendar();
    return { success: true, asset };
  } catch (error) {
    console.error("[social-calendar] registerSocialImageAsset failed", error);
    return { success: false, error: "تعذّر حفظ الصورة — حاول مرة أخرى" };
  }
}
