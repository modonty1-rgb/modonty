import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, secret } = body;
    
    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Slug is required" },
        { status: 400 }
      );
    }

    const revalidationSecret = process.env.REVALIDATION_SECRET || "dev-secret-key";
    const providedSecret = secret || req.headers.get("x-revalidation-secret");

    const isInternalCall = providedSecret === revalidationSecret;
    
    if (!isInternalCall) {
      const session = await auth();
      
      if (!session?.user?.id) {
        return NextResponse.json(
          { success: false, error: "Unauthorized. Provide valid session or secret." },
          { status: 401 }
        );
      }
    }

    revalidatePath(`/articles/${slug}`);
    
    return NextResponse.json({
      success: true,
      message: `Article ${slug} revalidated`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Revalidation failed" },
      { status: 500 }
    );
  }
}
