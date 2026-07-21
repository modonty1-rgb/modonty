import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Network-boundary auth gate (Next.js 16 proxy, nodejs runtime). Runs BEFORE any
 * route renders, so an unauthorized request never reaches a page and its data is
 * never fetched or streamed. This is what actually prevents client-data leakage —
 * layout/page-level guards run too late (layout + page render in parallel, so a
 * layout redirect does not stop the page from streaming its data).
 *
 * The role is verified AUTHORITATIVELY from the DB here (not from the JWT claim),
 * so a demoted admin still holding a valid ADMIN token is blocked too — closing
 * the leak globally for every protected page from this single chokepoint. Proxy
 * runs on the nodejs runtime and Prisma is already in its graph (via auth.config).
 */
const PUBLIC_PREFIXES = ["/login", "/forgot-password", "/reset-password"];

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const userId = (req.auth?.user as { id?: string } | undefined)?.id;

  // Public auth pages: a signed-in admin → dashboard; everyone else → allow.
  if (isPublic) {
    if (userId) {
      const me = await db.user
        .findUnique({ where: { id: userId }, select: { role: true } })
        .catch(() => null);
      if (me?.role === "ADMIN") return NextResponse.redirect(new URL("/", req.nextUrl));
    }
    return NextResponse.next();
  }

  // Protected: must be authenticated AND role === ADMIN in the DB (authoritative).
  if (!userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  // TRANSITION FALLBACK: role from `staff`, else from an ADMIN `users` row, so admins
  // mid-migration reach the panel. Remove once staff is fully populated.
  const staffRow = await db.staff
    .findUnique({ where: { id: userId }, select: { role: true } })
    .catch(() => null);
  const role =
    staffRow?.role ??
    (await db.user
      .findUnique({ where: { id: userId }, select: { role: true } })
      .catch(() => null))?.role;
  if (role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
});

// Skip Next internals, static assets, and the NextAuth API (needed for login).
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon|manifest|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?)$).*)",
  ],
};
