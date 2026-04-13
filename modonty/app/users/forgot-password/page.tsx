"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "@/components/link";
import { forgotPasswordAction } from "./actions/forgot-password-action";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await forgotPasswordAction(formData);
      if (result.success) {
        setSent(true);
      } else {
        setError(result.error ?? "حدث خطأ");
      }
    });
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="text-4xl mb-2">📬</div>
            <CardTitle className="text-xl">تحقق من بريدك الإلكتروني</CardTitle>
            <CardDescription>
              إذا كان البريد الإلكتروني مرتبطاً بحساب، ستصل رسالة إعادة تعيين كلمة المرور خلال دقائق.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/users/login" className="text-primary text-sm hover:underline">
              العودة لتسجيل الدخول
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">نسيت كلمة المرور؟</CardTitle>
          <CardDescription className="text-center">
            أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
                required
                disabled={isPending}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button type="submit" className="w-full h-12" disabled={isPending}>
              {isPending ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
            </Button>

            <div className="text-center text-sm">
              <Link href="/users/login" className="text-muted-foreground hover:text-primary">
                العودة لتسجيل الدخول
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
