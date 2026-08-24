import { NextRequest, NextResponse } from "next/server";

import { uploadToBunny } from "@modonty/shared/lib/bunny";
import { auth } from "@/lib/auth";

// No `export const runtime` here: modonty runs with `cacheComponents`, which rejects the
// runtime segment config. Node is the default runtime anyway, and `uploadToBunny` needs it.
export const maxDuration = 60;

const MB = 1024 * 1024;
// Stays under Vercel's 4.5MB function body limit; the client downscales before sending.
const IMAGE_LIMIT = 4 * MB;

interface ImageKind {
  mime: "image/jpeg" | "image/png" | "image/webp";
  ext: "jpg" | "png" | "webp";
}

/**
 * `file.type` is a string the uploader chooses — the browser copies it from the file, a script
 * types whatever it likes. Trusting it meant an HTML or SVG payload labelled `image/png` was
 * stored on the assets CDN and later served under our domain, where a browser would run it.
 * The bytes cannot lie the same way, so the format is read from the file's own signature and
 * the three formats below are the only ones with a path through: both the stored extension and
 * the content type sent to Bunny come from what was found, never from the request.
 */
function detectImageKind(buffer: Buffer): ImageKind | null {
  if (buffer.length < 12) return null;

  // JPEG — SOI marker, FF D8 FF.
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  // PNG — \x89 P N G \r \n \x1a \n.
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { mime: "image/png", ext: "png" };
  }
  // WebP — a RIFF container whose form type is WEBP; bytes 4-7 are the length, not part of it.
  if (
    buffer.subarray(0, 4).toString("latin1") === "RIFF" &&
    buffer.subarray(8, 12).toString("latin1") === "WEBP"
  ) {
    return { mime: "image/webp", ext: "webp" };
  }

  return null;
}

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
    // Size first, so a rejected upload never also pays for the full copy into a Buffer below.
    if (file.size > IMAGE_LIMIT) {
      return NextResponse.json(
        { success: false, error: `حجم الصورة ${(file.size / MB).toFixed(1)} ميجا — الحد ٤ ميجا` },
        { status: 413 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const kind = detectImageKind(buffer);
    if (!kind) {
      return NextResponse.json(
        { success: false, error: "الملف لازم يكون صورة JPG أو PNG أو WebP" },
        { status: 415 },
      );
    }

    const remotePath = `avatars/users/${userId}-${Date.now()}.${kind.ext}`;
    const { url } = await uploadToBunny("assets", buffer, remotePath, kind.mime);

    return NextResponse.json({ success: true, url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "فشل رفع الصورة";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
