import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { trackSignupView, trackSignupStart } from "@/lib/analytics/events-registry";

type SignupSource = "header" | "banner" | "page";
type SignupMethod = "google" | "email";

function isSource(s: unknown): s is SignupSource {
  return s === "header" || s === "banner" || s === "page";
}
function isMethod(m: unknown): m is SignupMethod {
  return m === "google" || m === "email";
}

// Client-fired funnel events (signup_view on register-page load, signup_start on
// Google/email button click). signup_complete is fired server-side (registerUser
// for email, events.createUser for Google) — never from the client.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { event?: string; method?: unknown; source?: unknown };
    const source = isSource(body.source) ? body.source : undefined;

    const session = await auth();
    const opts = session?.user?.id ? { userId: session.user.id } : undefined;

    if (body.event === "view") {
      void trackSignupView({ signup_source: source }, opts);
      return NextResponse.json({ ok: true });
    }
    if (body.event === "start" && isMethod(body.method)) {
      void trackSignupStart({ signup_method: body.method, signup_source: source }, opts);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false }, { status: 400 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
