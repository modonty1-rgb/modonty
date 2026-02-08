import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

const ALLOWED_TAGS = ["articles", "settings"] as const;

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

    const revalidationSecret = process.env.REVALIDATION_SECRET || process.env.REVALIDATE_SECRET || "dev-secret-key";
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
