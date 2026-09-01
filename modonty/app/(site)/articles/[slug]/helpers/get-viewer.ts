import { cache } from "react";

import { auth } from "@/lib/auth";

export interface Viewer {
  userId: string | null;
  /** Name + email for the forms that prefill them — nothing else of the session travels. */
  box: { name: string | null; email: string | null } | null;
}

/**
 * The reader's identity, read ONCE per request and only inside a Suspense boundary.
 *
 * Reading the session at the top of the page is what kept this article out of the static
 * shell: Next is explicit that touching cookies, headers or searchParams at the top level of a
 * route «forces the entire page into dynamic rendering». The article itself is the same bytes
 * for everyone, so the session moved down into the few parts that actually differ per reader —
 * the like/save state, the comment box, and the forms that greet you by name.
 *
 * `cache()` keeps the three islands from decoding the same session three times in one request.
 */
export const getViewer = cache(async (): Promise<Viewer> => {
  // Guarded, because `<Suspense>` does not do what the paragraph above quietly assumes.
  //
  // Suspense catches SUSPENSION, not ERRORS. A throw inside a Suspense child walks straight past
  // it to the nearest error boundary — here `articles/[slug]/error.tsx` — and takes the whole
  // article down. So «the session only runs inside a boundary» made these five islands safe to
  // be SLOW, never safe to FAIL.
  //
  // That is the asymmetry behind the bug Khalid kept hitting and no measurement of ours
  // reproduced: `curl` carries no cookie, so `auth()` returns null instantly and the page always
  // rendered for us; a signed-in reader takes this path, and when the session lookup flaked the
  // article — cached, complete, sitting right there — was replaced by «المقال ما فتحت».
  // Reproduced live twice on 1 Sep 2026 (07:47 and 09:38) on two different articles, both of
  // which answered HTTP 200 with full content to a cookie-less request seconds apart.
  //
  // Failure mode is the signed-out view: the article reads perfectly, and only the personal
  // touches (like state, prefilled name) fall back to their neutral values.
  try {
    const session = await auth();
    return {
      userId: session?.user?.id ?? null,
      box: session?.user
        ? { name: session.user.name ?? null, email: session.user.email ?? null }
        : null,
    };
  } catch (err) {
    console.error("[getViewer] session unavailable, rendering as signed-out:", err);
    return { userId: null, box: null };
  }
});
