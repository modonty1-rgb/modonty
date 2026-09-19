import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canSeeReports } from "@/lib/can-see-reports";

/**
 * Network-boundary auth gate (Next.js 16 proxy, nodejs runtime). Runs BEFORE any
 * route renders, so an unauthorized request never reaches a page and its data is
 * never fetched or streamed. This is what actually prevents client-data leakage —
 * layout/page-level guards run too late (layout + page render in parallel, so a
 * layout redirect does not stop the page from streaming its data).
 *
 * The role is verified from the SIGNED TOKEN, which `auth.config.ts` refreshes from the
 * database at most once a minute (`STAFF_RECHECK_MS`). A demoted or deactivated admin is
 * therefore blocked within that minute — the authority stays in the database, it is simply
 * not re-read on every single request. That per-request read was one of the sources of the
 * Atlas connection exhaustion measured in production (Khalid, 2026-09-19).
 */
const PUBLIC_PREFIXES = ["/login", "/forgot-password", "/reset-password"];

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const userId = (req.auth?.user as { id?: string } | undefined)?.id;
  const isDailyTasksReport = pathname === "/daily-tasks" || pathname.startsWith("/daily-tasks/");

  /**
   * **الحكمُ من التوكن — صفرُ استعلامٍ في الـproxy** (خالد ١٩ سبتمبر ٢٠٢٦: «أبغى حلاًّ جذريّاً»).
   *
   * كان هذا الملفّ يقرأ `db.staff.findUnique` في **كلّ طلبٍ محميّ**: استعلامٌ لكلّ نقرة،
   * من نسخةٍ سيرفرلس قد تكون باردة — أحدُ منابع استنفاد اتّصالات أطلس في الإنتاج.
   *
   * والحالةُ اليوم تعيش في التوكن الموقَّع، ويُجدّدها `auth.config.ts` من القاعدة مرّةً
   * كلَّ دقيقة. فالسلطةُ باقيةٌ في القاعدة — تأخّرَت دقيقةً وحسب — والطلبُ العاديُّ لا
   * يلمسها. وثمنُ الدقيقة مكتوبٌ هناك صراحةً.
   */
  const claims = req.auth?.user as
    | { isActive?: boolean; role?: string | null; canViewReports?: boolean | null }
    | undefined;

  // Public auth pages: a signed-in ACTIVE staff member → dashboard; everyone else → allow.
  if (isPublic) {
    if (userId && claims?.isActive !== false) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
    return NextResponse.next();
  }

  // Protected: must be an authenticated, ACTIVE staff member (authoritative from the DB,
  // so someone deactivated while still holding a valid token is blocked at once). Role
  // does not gate access — employment status does.
  if (!userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (!claims || claims.isActive === false) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  // Permission on the person, not on the role — see `lib/can-see-reports.ts`. Still read
  // from the DB on every request, so ticking or clearing the box takes effect immediately
  // rather than at the holder's next sign-in.
  if (isDailyTasksReport && !canSeeReports(claims)) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

// Skip Next internals, static assets, and the NextAuth API (needed for login).
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon|manifest|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?)$).*)",
  ],
};
