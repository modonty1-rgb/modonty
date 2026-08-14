import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { trackLoginStart } from "@/lib/analytics/events-registry";

type LoginMethod = "google" | "email";

function isMethod(m: unknown): m is LoginMethod {
  return m === "google" || m === "email";
}

// Client-fired login funnel event: login_start on Google/email button click on
// /users/login. login_complete is not tracked here — a returning session is
// implicit; a brand-new Google user still counts signup_complete server-side.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { method?: unknown };
    if (!isMethod(body.method)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const session = await auth();
    const opts = session?.user?.id ? { userId: session.user.id } : undefined;

    void trackLoginStart({ login_method: body.method }, opts);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
