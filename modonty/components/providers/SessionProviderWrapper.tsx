import { auth } from "@/lib/auth";
import { SessionProvider } from "@/components/providers/SessionContext";

export async function SessionProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
