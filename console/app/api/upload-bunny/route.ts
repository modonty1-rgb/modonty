import { NextRequest, NextResponse } from "next/server";

import { uploadToBunny } from "@modonty/database/lib/bunny";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

const MB = 1024 * 1024;
// Client-side compression outputs WebP ≤2000px (~0.1–2MB) — 4MB is a generous ceiling
// that also stays under Vercel's request-body limit.
const IMAGE_LIMIT = 4 * MB;

// Whitelisted upload folders — the browser must NOT choose an arbitrary path.
const FOLDERS = ["gallery", "achievements"] as const;
type Folder = (typeof FOLDERS)[number];

/**
 * Server-side proxy upload to Bunny (reels zone) — the browser never sees the
 * storage password. Files live in the reels zone by locked decision
 * (unified source). The optional `folder` field selects a whitelisted subfolder
 * (gallery | achievements); it defaults to gallery for backward compatibility.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    const clientId = (session as { clientId?: string })?.clientId;
    if (!clientId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const fd = await req.formData();
    const file = fd.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const requested = String(fd.get("folder") ?? "gallery");
    const folder: Folder = (FOLDERS as readonly string[]).includes(requested)
      ? (requested as Folder)
      : "gallery";

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "الملف مش صورة" }, { status: 415 });
    }
    if (file.size > IMAGE_LIMIT) {
      return NextResponse.json(
        { error: `حجم الصورة ${(file.size / MB).toFixed(1)}MB أكبر من الحد (4MB)` },
        { status: 413 },
      );
    }

    const ext = file.type === "image/webp" ? "webp" : file.type === "image/png" ? "png" : "jpg";
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const remotePath = `clients/${clientId}/${folder}/${unique}.${ext}`;

    const buf = Buffer.from(await file.arrayBuffer());
    const { url } = await uploadToBunny("reels", buf, remotePath, file.type);

    return NextResponse.json({ url, bytes: file.size });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
