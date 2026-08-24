import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";

const revalidateSchema = z.object({
  slug: z.string().min(1).max(200),
  secret: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = revalidateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request", fields: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { slug, secret } = parsed.data;

    const revalidationSecret = process.env.REVALIDATE_SECRET;
    if (!revalidationSecret) {
      return NextResponse.json(
        { success: false, error: "Revalidation not configured" },
        { status: 503 }
      );
    }
    const providedSecret = secret || req.headers.get("x-revalidate-secret");

    const isInternalCall = providedSecret === revalidationSecret;
    
    if (!isInternalCall) {
      const session = await auth();

      // A session here is a READER: registration on modonty is open to the public, so
      // "signed in" meant "anyone who filled the form". Purging is a cost and an
      // availability lever — a loop over slugs empties the route cache and leaves every
      // article to render cold. Only the ADMIN role passes; the role rides on the
      // session from auth.config.ts (jwt → session), typed in types/next-auth.d.ts.
      // Admin and console keep using the secret header, which is their real identity.
      if (session?.user?.role !== UserRole.ADMIN) {
        return NextResponse.json(
          { success: false, error: "Unauthorized. Provide an admin session or the secret." },
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
