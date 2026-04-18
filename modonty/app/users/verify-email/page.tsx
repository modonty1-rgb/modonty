import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <VerifyResult success={false} message="رابط التفعيل غير صالح." />;
  }

  const record = await db.verificationToken.findUnique({
    where: { token },
  });

  if (!record) {
    return <VerifyResult success={false} message="الرابط غير صالح أو تم استخدامه مسبقاً." />;
  }

  if (record.expires < new Date()) {
    await db.verificationToken.delete({ where: { token } }).catch(() => null);
    return <VerifyResult success={false} message="انتهت صلاحية رابط التفعيل. سجّل الدخول وطلب رابطاً جديداً." />;
  }

  await Promise.all([
    db.user.updateMany({
      where: { email: record.identifier },
      data: { emailVerified: new Date() },
    }),
    db.verificationToken.delete({ where: { token } }),
  ]);

  redirect("/users/login?verified=1");
}

function VerifyResult({ success, message }: { success: boolean; message: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-4">
        <div className={`text-5xl ${success ? "text-green-500" : "text-destructive"}`}>
          {success ? "✓" : "✗"}
        </div>
        <h1 className="text-xl font-semibold">{success ? "تم تفعيل حسابك!" : "تعذّر التفعيل"}</h1>
        <p className="text-muted-foreground text-sm">{message}</p>
        <Link href="/users/login" className="inline-block text-primary hover:underline text-sm">
          تسجيل الدخول
        </Link>
      </div>
    </div>
  );
}
