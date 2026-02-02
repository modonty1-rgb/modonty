import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { ResetPasswordForm } from "./components/reset-password-form";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  let session;
  try {
    session = await auth();
  } catch {
    session = null;
  }

  if (session) {
    redirect("/");
  }

  const sp = await searchParams;
  const t = sp.token;
  const token = (Array.isArray(t) ? t[0] : t) ?? "";
  const hasToken = token.trim().length > 0;

  if (!hasToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4 text-center">
          <p className="text-destructive font-medium">Invalid or expired link.</p>
          <p className="text-sm text-muted-foreground">
            <Link href="/forgot-password" className="underline hover:no-underline">
              Request a new reset link
            </Link>
          </p>
          <Link
            href="/login"
            className="inline-block text-sm font-medium text-primary underline hover:no-underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <ResetPasswordForm token={token.trim()} />
    </div>
  );
}
