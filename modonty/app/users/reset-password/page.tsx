"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "@/components/link";
import { resetPasswordAction } from "./actions/reset-password-action";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="text-4xl mb-2">❌</div>
            <CardTitle>رابط غير صحيح</CardTitle>
            <CardDescription>هذا الرابط غير صحيح أو منتهي الصلاحية.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/users/forgot-password" className="text-primary text-sm hover:underline">
              طلب رابط جديد
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="text-4xl mb-2">✅</div>
            <CardTitle>تم تغيير كلمة المرور</CardTitle>
            <CardDescription>يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/users/login">
              <Button className="w-full h-12">تسجيل الدخول</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("token", token);

    startTransition(async () => {
      const result = await resetPasswordAction(formData);
      if (result.success) {
        setDone(true);
      } else {
        setError(result.error ?? "حدث خطأ");
      }
    });
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">كلمة مرور جديدة</CardTitle>
          <CardDescription className="text-center">
            أدخل كلمة المرور الجديدة — 8 أحرف على الأقل
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور الجديدة</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                minLength={8}
                required
                disabled={isPending}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button type="submit" className="w-full h-12" disabled={isPending}>
              {isPending ? "جاري الحفظ..." : "حفظ كلمة المرور الجديدة"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
