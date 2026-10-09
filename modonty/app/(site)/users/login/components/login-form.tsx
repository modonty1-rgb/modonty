"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconEmail } from "@/lib/icons";
import { GoogleIcon } from "@modonty/shared/components/icons/google-icon";
import { trackLoginClient } from "@/app/(site)/users/login/helpers/track-login-client";
import { useGoogleRedirectState } from "../../helpers/use-google-redirect-state";

interface LoginFormProps {
  callbackUrl: string;
  initialError?: string;
}

export function LoginForm({ callbackUrl, initialError }: LoginFormProps) {
  const router = useRouter();
  // Google and email lock separately: a stuck Google redirect must not lock the email form (ب١).
  const google = useGoogleRedirectState();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError ?? null);

  const handleOAuthSignIn = async (provider: "google") => {
    google.start();
    setError(null);
    trackLoginClient("google");
    try {
      await signIn(provider, { callbackUrl });
    } catch (err) {
      console.error("Sign in error:", err);
      setError("تعذّر بدء الدخول عبر Google. حاول مرة ثانية.");
      google.stop();
    }
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    trackLoginClient("email");
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      // next-auth v5 returns ok:true on a rejected password too — the failure is in `error`.
      if (result?.ok && !result.error) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Sign in error:", err);
      setError("حدث خطأ غير متوقع. حاول مرة ثانية.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-background flex items-center justify-center px-4 py-8 sm:py-24">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">تسجيل الدخول</CardTitle>
          <CardDescription className="text-center">
            سجل الدخول للتعليق والتفاعل مع المحتوى
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {google.stuck && !error && (
            <div role="alert" className="bg-destructive/10 text-destructive text-sm p-3 rounded-md text-center">
              صفحة Google ما فتحت. تأكّد من الإنترنت واضغط الزر مرة ثانية، أو ادخل بالإيميل.
            </div>
          )}
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md text-center">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={() => handleOAuthSignIn("google")}
            disabled={google.pending || loading}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-md border border-[#747775] bg-white text-sm font-medium text-[#1F1F1F] shadow-sm transition-colors hover:bg-[#f8f9fa] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <GoogleIcon />
            {google.pending ? "جاري فتح Google..." : "تسجيل الدخول بـ Google"}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">أو</span>
            </div>
          </div>

          <form onSubmit={handleCredentialsSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                className="max-lg:h-11"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                className="max-lg:h-11"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12"
              variant="default"
            >
              <IconEmail className="h-5 w-5 mr-2" />
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>

            <div className="text-center">
              <Link
                href="/users/forgot-password"
                className="text-sm text-muted-foreground hover:text-primary max-lg:inline-flex max-lg:min-h-11 max-lg:items-center max-md:px-3 lg:inline-flex lg:min-h-6 lg:items-center"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">أو</span>
            </div>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">ليس لديك حساب؟ </span>
            <Link
              href="/users/register"
              className="text-primary hover:underline max-lg:inline-flex max-lg:min-h-11 max-lg:items-center max-md:px-2 lg:inline-flex lg:min-h-6 lg:items-center"
            >
              سجل الآن
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
