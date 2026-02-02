import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  let session;
  try {
    session = await auth();
  } catch {
    session = null;
  }

  if (session?.clientId) {
    redirect("/dashboard");
  }

  redirect("/");
}
