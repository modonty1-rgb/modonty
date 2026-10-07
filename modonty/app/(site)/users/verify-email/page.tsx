import { redirect } from "next/navigation";
import Link from "next/link";
import { IconError, IconSuccess } from "@/lib/icons";
import { verifyEmailToken } from "./helpers/verify-email-token";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <VerifyResult success={false} message="رابط التفعيل غير صالح." />;
  }

  const result = await verifyEmailToken(token);

  if (result === "invalid") {
    return <VerifyResult success={false} message="الرابط غير صالح أو تم استخدامه مسبقاً." />;
  }

  if (result === "expired") {
    return <VerifyResult success={false} message="انتهت صلاحية رابط التفعيل. سجّل الدخول وطلب رابطاً جديداً." />;
  }

  redirect("/users/login?verified=1");
}

function VerifyResult({ success, message }: { success: boolean; message: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-4">
        <div className={`text-5xl ${success ? "text-green-500" : "text-destructive"}`}>
          {success
              ? <IconSuccess className="h-10 w-10 text-emerald-600 dark:text-emerald-400" aria-hidden />
              : <IconError className="h-10 w-10 text-destructive" aria-hidden />}
        </div>
        <h1 className="text-xl font-semibold">{success ? "تم تفعيل حسابك!" : "تعذّر التفعيل"}</h1>
        <p className="text-muted-foreground text-sm">{message}</p>
        <Link
          href="/users/login"
          className="inline-block text-primary hover:underline text-sm max-md:inline-flex max-md:min-h-11 max-md:items-center max-md:px-3"
        >
          تسجيل الدخول
        </Link>
      </div>
    </div>
  );
}
