import { auth } from "@/lib/auth";
import { SessionProvider } from "@/components/providers/SessionContext";

/**
 * Deliberately NOT async: awaiting the session here would force every page under
 * it to wait for the request, and nothing would land in the static shell. We hand
 * the unresolved promise to the client provider instead, and only the components
 * that actually read the session suspend — each behind its own boundary.
 */
export function SessionProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Swallow decryption failures (missing/rotated AUTH_SECRET) so a bad cookie
  // renders a signed-out page instead of crashing the deploy.
  const sessionPromise = auth().catch(() => null);

  return (
    <SessionProvider sessionPromise={sessionPromise}>{children}</SessionProvider>
  );
}
