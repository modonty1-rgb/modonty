import { auth } from "@/lib/auth";

export async function getSessionClientId(): Promise<string | null> {
  const session = await auth();
  return (session as { clientId?: string })?.clientId ?? null;
}
