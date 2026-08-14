import { NextRequest, NextResponse } from "next/server";

import { uploadToBunny } from "@modonty/shared/lib/bunny";
import { auth } from "@/lib/auth";

// No `export const runtime` here: modonty runs with `cacheComponents`, which rejects the
// runtime segment config. Node is the default runtime anyway, and `uploadToBunny` needs it.
export const maxDuration = 60;

const MB = 1024 * 1024;
// Stays under Vercel's 4.5MB function body limit; the client downscales before sending.
const IMAGE_LIMIT = 4 * MB;

/**
 * Visitor avatar upload → Bunny (assets zone, `avatars/users/`).
 *
 * Before this route the settings form base64-encoded the file into `User.image`
 * (`FileReader.readAsDataURL`), which passed `z.string().url()` because data URIs are
 * valid URLs — so the whole image was stored inside the document: DB bloat, no CDN, no
 * optimization. The browser never sees the storage password; the user id comes from the
 * session, never from the request body.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "لم يتم إرسال ملف" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "الملف لازم يكون صورة" }, { status: 415 });
    }
    if (file.size > IMAGE_LIMIT) {
      return NextResponse.json(
        { success: false, error: `حجم الصورة ${(file.size / MB).toFixed(1)} ميجا — الحد ٤ ميجا` },
        { status: 413 },
      );
    }

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const remotePath = `avatars/users/${userId}-${Date.now()}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { url } = await uploadToBunny("assets", buffer, remotePath, file.type);

    return NextResponse.json({ success: true, url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "فشل رفع الصورة";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
