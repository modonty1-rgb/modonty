"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IconLoading, IconRegister, IconViews, IconEyeOff } from "@/lib/icons";
import { GoogleIcon } from "@/components/auth/google-icon";
import { registerSchema, type RegisterFormData } from "../helpers/schemas/register-schema";
import { registerUser } from "../actions/register-actions";
import { trackSignupClient } from "@/lib/analytics/track-signup-client";
import Link from "@/components/link";

const BENEFITS = [
  { icon: "🔔", text: "جديد تخصصك" },
  { icon: "🔖", text: "احفظ مقالاتك" },
  { icon: "🎁", text: "عروض حصرية" },
] as const;

export function RegisterForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Funnel: register page viewed.
  useEffect(() => {
    trackSignupClient("view", undefined, "page");
  }, []);

  const handleGoogle = async () => {
    setIsSubmitting(true);
    setError(null);
    trackSignupClient("start", "google", "page");
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch {
      setError("تعذّر التسجيل بحساب Google. حاول مرة أخرى.");
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setError(null);
    trackSignupClient("start", "email", "page");

    try {
      const result = await registerUser(data);

      if (!result.success) {
        setError(result.error || "فشل إنشاء الحساب");
        setIsSubmitting(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("تم إنشاء الحساب بنجاح، لكن فشل تسجيل الدخول. يرجى تسجيل الدخول يدوياً.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">انضم لمجتمع مدوّنتي</CardTitle>
          <CardDescription className="text-center">
            اشترك مجاناً وتابع جديد تخصصك
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Value: why subscribe */}
          <ul className="grid grid-cols-3 gap-2 rounded-lg bg-muted/40 p-3 text-center">
            {BENEFITS.map((b) => (
              <li key={b.text} className="flex flex-col items-center gap-1.5">
                <span className="text-xl leading-none">{b.icon}</span>
                <span className="text-xs leading-tight text-foreground/80">{b.text}</span>
              </li>
            ))}
          </ul>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Fastest path first — Google */}
          {/* Plain button (not shadcn Button) — guarantees Google's exact light-theme
              colors win over the dark-theme variant classes. */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={isSubmitting}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-md border border-[#747775] bg-white text-sm font-medium text-[#1F1F1F] shadow-sm transition-colors hover:bg-[#f8f9fa] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <GoogleIcon />
            المتابعة بحساب Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">أو بالبريد</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="example@email.com"
                {...register("email")}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="٨ أحرف على الأقل"
                  className="pe-10"
                  {...register("password")}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 end-2 flex items-center text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? <IconEyeOff className="h-5 w-5" /> : <IconViews className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12"
              variant="default"
            >
              {isSubmitting ? (
                <>
                  <IconLoading className="h-5 w-5 me-2 animate-spin" />
                  جاري إنشاء الحساب...
                </>
              ) : (
                <>
                  <IconRegister className="h-5 w-5 me-2" />
                  إنشاء حساب مجاني
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">لديك حساب بالفعل؟ </span>
            <Link href="/users/login" className="text-primary hover:underline">
              تسجيل الدخول
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
