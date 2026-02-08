import { auth } from "@/lib/auth";
import { SessionProvider } from "@/components/providers/SessionProvider";

export async function SessionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
