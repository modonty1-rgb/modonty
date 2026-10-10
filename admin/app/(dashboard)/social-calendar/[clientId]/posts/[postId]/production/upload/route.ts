import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { readImageMeta } from "@/lib/media/generate-aspect-crops";
import { uploadToBunny } from "@modonty/shared/lib/bunny";

import { ASSETS_LOCKED_STATUSES } from "../../../../../helpers/post-transitions";
import { requireSocialActor } from "../../../../../helpers/require-social-actor";
import { revalidateSocialCalendar } from "../../../../../helpers/revalidate-social-calendar";

/**
 * رفع صورة إبداع لمنشور — مسار يخدم صفحة الإنتاج وحدها، فيعيش بجانبها.
 *
 * route لا server action: الأكشن مقيّد بـ١MB افتراضياً، والصورة تصل ٤MB. والمتصفّح يرفع بـ
 * `uploadWithProgress` (XHR) ليرسم شريط تقدّم حقيقياً كالقديم.
 *
 * الحدّ ٤MB لا ١٠MB كالقديم: سقف Vercel لجسم الطلب ٤٫٥MB ثابت لا يُرفع
 * (`lib/media/upload-image-to-bunny.ts:11-14`). الفيديو لا يمرّ من هنا — Bunny Stream مباشرة.
 *
 * التخزين: زون `clients` تحت `social/{clientSlug}/{postId}/{uuid}.{ext}`؛ خارج الإنتاج يسبقه
 * `_dev/` تلقائياً (`shared/lib/bunny.ts`).
 */
export const maxDuration = 60;

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ clientId: string; postId: string }> },
) {
  const actor = await requireSocialActor("produce");
  if ("error" in actor) return NextResponse.json({ error: actor.error }, { status: 403 });

  const { clientId, postId } = await params;
  if (!/^[a-f\d]{24}$/i.test(clientId) || !/^[a-f\d]{24}$/i.test(postId)) {
    return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch (error) {
    console.error("[social-calendar] upload: bad form data", error);
    return NextResponse.json({ error: "طلب رفع غير صالح" }, { status: 400 });
  }

  const file = form.get("file");
  const label = String(form.get("label") ?? "").trim().slice(0, 200);
  if (!(file instanceof File)) return NextResponse.json({ error: "لم يصل ملف" }, { status: 400 });

  const ext = EXT_BY_MIME[file.type];
  if (!ext) {
    return NextResponse.json({ error: "الصيغة غير مدعومة — JPG · PNG · WebP · GIF · AVIF" }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_BYTES) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
    return NextResponse.json(
      { error: `حجم الملف ${sizeMB}MB أكبر من الحد المسموح (4MB للصور). اختر ملف أصغر.` },
      { status: 413 },
    );
  }

  try {
    const post = await db.socialPost.findFirst({
      where: { id: postId, clientId },
      select: { id: true, status: true, client: { select: { slug: true } } },
    });
    if (!post) return NextResponse.json({ error: "المنشور غير موجود" }, { status: 404 });
    if (ASSETS_LOCKED_STATUSES.includes(post.status)) {
      return NextResponse.json({ error: "الإبداع مقفل بعد الموافقة" }, { status: 409 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const meta = await readImageMeta(buffer).catch((error: unknown) => {
      console.error("[social-calendar] upload: could not read image size", error);
      return { width: 0, height: 0, format: "" };
    });

    const { url, path } = await uploadToBunny(
      "clients",
      buffer,
      `social/${post.client.slug}/${post.id}/${randomUUID()}.${ext}`,
      file.type,
    );

    const order = await db.socialPostAsset.count({ where: { postId: post.id } });
    const asset = await db.socialPostAsset.create({
      data: {
        postId: post.id,
        kind: "IMAGE",
        url,
        path,
        label: label || null,
        bytes: file.size,
        width: meta.width || null,
        height: meta.height || null,
        order,
        uploadedById: actor.staffId,
      },
      select: { id: true, kind: true, url: true, label: true, width: true, height: true, bytes: true, bunnyVideoId: true },
    });

    revalidateSocialCalendar();
    return NextResponse.json({ asset });
  } catch (error) {
    console.error("[social-calendar] upload failed", error);
    return NextResponse.json({ error: "فشل الرفع إلى Bunny — حاول مرة أخرى" }, { status: 500 });
  }
}
