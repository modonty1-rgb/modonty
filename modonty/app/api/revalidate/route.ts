import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const path = req.nextUrl.searchParams.get("path");
    const secret = req.nextUrl.searchParams.get("secret");

    if (!path) {
      return NextResponse.json(
        { success: false, error: "path is required" },
        { status: 400 }
      );
    }

    const revalidationSecret = process.env.REVALIDATE_SECRET || "dev-secret-key";
    if (secret !== revalidationSecret) {
      return NextResponse.json(
        { success: false, error: "Invalid secret" },
        { status: 401 }
      );
    }

    revalidatePath(path);

    return NextResponse.json({
      success: true,
      message: `Path ${path} revalidated`,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Revalidation failed" },
      { status: 500 }
    );
  }
}
