import { auth } from "@/lib/auth";
import { SessionProvider } from "@/components/providers/SessionContext";

export async function SessionProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  try {
    session = await auth();
  } catch {
    // e.g. no matching decryption secret (missing/changed AUTH_SECRET); render without session so deploy doesn't crash
  }
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
