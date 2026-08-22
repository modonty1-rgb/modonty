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
  const session = await auth();
  return {
    userId: session?.user?.id ?? null,
    box: session?.user
      ? { name: session.user.name ?? null, email: session.user.email ?? null }
      : null,
  };
});
