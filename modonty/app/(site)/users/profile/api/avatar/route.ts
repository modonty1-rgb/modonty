import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { uploadUserAvatar } from "@/lib/users/upload-user-avatar";

// No `export const runtime` here: modonty runs with `cacheComponents`, which rejects the
// runtime segment config. Node is the default runtime anyway, and `uploadToBunny` needs it.
export const maxDuration = 60;

const STATUS = { missing: 400, too_large: 413, bad_type: 415 } as const;

/**
 * Visitor avatar upload → Bunny (assets zone, `avatars/users/`).
 *
 * Before this route the settings form base64-encoded the file into `User.image`
 * (`FileReader.readAsDataURL`), which passed `z.string().url()` because data URIs are
 * valid URLs — so the whole image was stored inside the document: DB bloat, no CDN, no
 * optimization. The browser never sees the storage password; the user id comes from the
 * session, never from the request body.
 *
 * Web door: identity from the session cookie, logic in `uploadUserAvatar` (shared with the mobile API).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const form = await request.formData();
    const result = await uploadUserAvatar(userId, form.get("file"));
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: STATUS[result.reason] });
    }
    return NextResponse.json({ success: true, url: result.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "فشل رفع الصورة";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
