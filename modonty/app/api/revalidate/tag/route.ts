import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

// "pages" is the tag `getContentPageRow` caches the eleven content pages under (about,
// contact, terms, the four legal pages, trust, story, audio, reels). It was missing here, so
// every admin save of one of those pages fired a revalidation this route answered with 400 —
// the row changed in the database and the live page kept serving the old blob for hours.
const ALLOWED_TAGS = ["articles", "settings", "categories", "clients", "tags", "industries", "faqs", "authors", "ga4-clients", "reels", "pages"] as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { tag, secret } = body;

    if (!tag || !ALLOWED_TAGS.includes(tag)) {
      return NextResponse.json(
        { success: false, error: `Tag must be one of: ${ALLOWED_TAGS.join(", ")}` },
        { status: 400 }
      );
    }

    const revalidationSecret = process.env.REVALIDATE_SECRET;
    if (!revalidationSecret) {
      return NextResponse.json(
        { success: false, error: "Revalidation not configured" },
        { status: 503 }
      );
    }
    const providedSecret = secret ?? req.headers.get("x-revalidation-secret") ?? req.headers.get("x-revalidate-secret");

    if (providedSecret !== revalidationSecret) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Provide valid secret." },
        { status: 401 }
      );
    }

    revalidateTag(tag, "max");

    return NextResponse.json({
      success: true,
      message: `Tag "${tag}" revalidated`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Revalidation failed" },
      { status: 500 }
    );
  }
}
