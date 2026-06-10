"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";

function AdminAccessInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // guard against double-invoke (React strict mode)
    ran.current = true;

    const token = params.get("token");
    if (!token) {
      setError("رابط غير صالح — لا يوجد رمز دخول.");
      return;
    }

    signIn("admin-impersonation", { token, redirect: false })
      .then((res) => {
        if (res?.ok && !res.error) {
          router.replace("/dashboard");
        } else {
          setError("انتهت صلاحية الرابط أو غير صالح. ارجع للأدمن وافتح كونسول العميل من جديد.");
        }
      })
      .catch(() => setError("تعذّر الدخول. حاول من جديد."));
  }, [params, router]);

  return (
    <div dir="rtl" className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 text-center shadow-sm">
        {error ? (
          <>
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-red-500/10 text-red-500">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">تعذّر فتح الكونسول</p>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{error}</p>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-semibold text-foreground">جارٍ فتح كونسول العميل…</p>
            <p className="mt-1 text-xs text-muted-foreground">لحظات ويتم تحويلك للوحة التحكم.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminAccessPage() {
  return (
    <Suspense fallback={null}>
      <AdminAccessInner />
    </Suspense>
  );
}
