import { NextRequest, NextResponse } from "next/server";

import { uploadToBunny } from "@modonty/shared/lib/bunny";
import { auth } from "@/lib/auth";
import { imageExtension, resolveUploadFolder } from "@/lib/bunny/upload-folders";
import { generateBlurDataUrl } from "@/lib/media/generate-blur";

export const runtime = "nodejs";
export const maxDuration = 60;

const MB = 1024 * 1024;
// Fallback only — uploads go browser → Bunny (`lib/bunny/upload-image.ts`). This route is used
// when direct upload isn't configured, and stays under Vercel's 4.5MB request-body limit.
const IMAGE_LIMIT = 4 * MB;

/**
 * FALLBACK server-side proxy upload to Bunny (reels zone) — the browser never sees the
 * storage password. Files live in the reels zone by locked decision
 * (unified source). The optional `folder` field selects a whitelisted subfolder
 * (gallery | achievements | licenses); it defaults to gallery for backward compatibility.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    const clientId = (session as { clientId?: string })?.clientId;
    if (!clientId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const fd = await req.formData();
    const file = fd.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const folder = resolveUploadFolder(String(fd.get("folder") ?? "gallery"));

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "الملف مش صورة" }, { status: 415 });
    }
    if (file.size > IMAGE_LIMIT) {
      return NextResponse.json(
        { error: `حجم الصورة ${(file.size / MB).toFixed(1)}MB أكبر من الحد (4MB)` },
        { status: 413 },
      );
    }

    const ext = imageExtension(file.type);
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const remotePath = `clients/${clientId}/${folder}/${unique}.${ext}`;

    const buf = Buffer.from(await file.arrayBuffer());
    // The buffer is already in memory for the Bunny write, so the blur placeholder costs
    // one resize and zero extra downloads. Built here (server-side) rather than in the
    // browser so the stored value can't be forged by the client.
    const [{ url }, blurDataURL] = await Promise.all([
      uploadToBunny("reels", buf, remotePath, file.type),
      generateBlurDataUrl(buf),
    ]);

    return NextResponse.json({ url, bytes: file.size, blurDataURL });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
