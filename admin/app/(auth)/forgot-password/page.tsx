import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ForgotPasswordForm } from "./components/forgot-password-form";

export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  let session;
  try {
    session = await auth();
  } catch {
    session = null;
  }

  if (session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <ForgotPasswordForm />
    </div>
  );
}
