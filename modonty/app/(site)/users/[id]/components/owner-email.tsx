import { auth } from "@/lib/auth";
import { IconEmail } from "@/lib/icons";

/**
 * The profile owner's email — the ONLY part of this page that depends on who is looking.
 *
 * It lives in its own component so the rest of the profile can be cached: a profile is the
 * same bytes for every visitor, and reading the session at the top of the page would force
 * the whole route to render per-request. Next's own guidance for Cache Components says any
 * component reading session data must sit behind a Suspense boundary; here that boundary is
 * in `page.tsx`, and this component is what it wraps.
 *
 * The privacy rule it carries (S-01, QA 2026-08-20) is unchanged: the address renders only
 * when the signed-in viewer IS this profile's owner. Anyone else gets nothing — not a
 * placeholder, not a masked string.
 *
 * A failed session read is not an outage: the viewer is simply treated as not-the-owner,
 * which is the safe direction. It must never take the profile down.
 */
export async function OwnerEmail({ ownerId, email }: { ownerId?: string; email?: string | null }) {
  if (!ownerId || !email) return null;

  let isOwner = false;
  try {
    const session = await auth();
    isOwner = !!session?.user?.id && session.user.id === ownerId;
  } catch {
    return null;
  }

  if (!isOwner) return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      <IconEmail className="h-4 w-4 text-muted-foreground" aria-hidden />
      <span>{email}</span>
    </div>
  );
}
