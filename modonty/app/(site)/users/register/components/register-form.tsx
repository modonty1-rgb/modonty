"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IconLoading, IconRegister, IconViews, IconEyeOff, IconBell, IconSaved, IconGift } from "@/lib/icons";
import { GoogleIcon } from "@modonty/shared/components/icons/google-icon";
import { registerSchema, type RegisterFormData } from "../helpers/schemas/register-schema";
import { registerUser } from "../actions/register-actions";
import { trackSignupClient } from "@/app/(site)/users/register/helpers/track-signup-client";
import { useGoogleRedirectState } from "../../helpers/use-google-redirect-state";
import { PASSWORD_HINT } from "@/lib/auth/password-rule";
import { ALERT_TOPICS } from "@/lib/users/alert-topics";

/**
 * **أيقوناتُ السجلّ لا الإيموجي** (خالد ٢٠ سبتمبر ٢٠٢٦: «استخدم البراندينج أيكونز»).
 *
 * والإيموجي يُرسم بخطّ النظام: شكلُه يختلف بين ويندوز وآيفون وأندرويد، ولا يرث لونَ
 * العلامة ولا حجمَها. وأيقونةُ السجلّ `currentColor` — فتتبع الثيم والوضع الليليّ معاً.
 */
const BENEFITS = [
  { Icon: IconBell, text: "جديد تخصصك" },
  { Icon: IconSaved, text: "احفظ مقالاتك" },
  { Icon: IconGift, text: "عروض حصرية" },
] as const;

export function RegisterForm() {
  const router = useRouter();
  // Where to land after signing up: a page that sent the reader here (`?callbackUrl=`), internal
  // paths only — `//evil.com` would be an open redirect. Without one, the home page as before.
  const params = useSearchParams();
  const requested = params.get("callbackUrl");
  const callbackUrl = requested && requested.startsWith("/") && !requested.startsWith("//") ? requested : "/";
  // A page that invites readers to an alert sends them with `?alert=<id>`: one box, and ticking it
  // is the whole subscription (Khalid, 27 Sep 2026: «حيسجل ويدينا التشيك بوكس خلاص»).
  const alertTopic = ALERT_TOPICS.find((t) => t.id === params.get("alert"));
  const [alertOn, setAlertOn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Google locks its own button only — the email form stays usable, and back-from-Google unlocks it (ب١).
  const google = useGoogleRedirectState();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The account exists and the session is live — say so before leaving the page, or the reader
  // lands on the home page with no sign that anything happened (QA finding #1, 29 Sep 2026).
  const [welcomed, setWelcomed] = useState(false);

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
    google.start();
    setError(null);
    trackSignupClient("start", "google", "page");
    try {
      await signIn("google", { callbackUrl });
    } catch {
      setError("تعذّر التسجيل بحساب Google. حاول مرة أخرى.");
      google.stop();
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setError(null);
    trackSignupClient("start", "email", "page");

    try {
      const result = await registerUser({ ...data, alertTopic: alertOn ? alertTopic?.id : undefined });

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

      // next-auth v5 returns ok:true on a rejected sign-in too — the failure is in `error`.
      if (signInResult?.ok && !signInResult.error) {
        setWelcomed(true);
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 1400);
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
            سجّل مجاناً وتابع جديد تخصصك
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Value: why subscribe */}
          <ul className="grid grid-cols-3 gap-2 rounded-lg bg-muted/40 p-3 text-center">
            {BENEFITS.map((b) => (
              <li key={b.text} className="flex flex-col items-center gap-1.5">
                <b.Icon className="h-5 w-5 text-primary" aria-hidden />
                <span className="text-xs leading-tight text-foreground/80">{b.text}</span>
              </li>
            ))}
          </ul>

          {welcomed && (
            <div role="status" className="rounded-md bg-primary/10 p-3 text-center text-sm font-medium text-primary">
              أهلاً بك في مدوّنتي — حسابك جاهز، نرجّعك لمكانك…
            </div>
          )}

          {google.stuck && !error && (
            <div role="alert" className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              صفحة Google ما فتحت. تأكّد من الإنترنت واضغط الزر مرة ثانية، أو سجّل بالبريد.
            </div>
          )}

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
            disabled={google.pending || isSubmitting}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-md border border-[#747775] bg-white text-sm font-medium text-[#1F1F1F] shadow-sm transition-colors hover:bg-[#f8f9fa] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <GoogleIcon />
            {google.pending ? "جاري فتح Google..." : "المتابعة بحساب Google"}
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
              <Label htmlFor="name">الاسم</Label>
              <Input
                id="name"
                autoComplete="name"
                className="max-md:h-11"
                placeholder="يظهر على تعليقاتك"
                {...register("name")}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                className="max-md:h-11"
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
                  placeholder={PASSWORD_HINT}
                  className="pe-10 max-md:h-11 max-md:pe-12"
                  {...register("password")}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 end-2 flex items-center text-muted-foreground hover:text-foreground max-md:end-0 max-md:w-11 max-md:justify-center"
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? <IconEyeOff className="h-5 w-5" /> : <IconViews className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/**
              * موافقةُ الرسائل التسويقيّة — **فارغةٌ افتراضاً ولا تمنع التسجيل**.
              *
              * ومربّعٌ معبّأٌ سلفاً ليس موافقة، ورفضُه لا يُغلق الباب: من رفض التسويق
              * يبقى له حسابٌ وتنبيهاتُ ردودٍ على تعليقاته — وهي ليست إعلاناً.
              */}
            {/**
              * **`htmlFor` لا لفٌّ للمدخل داخل الوسم.**
              *
              * كان الـ`<label>` يلفّ الـ`<input>`، فالنقرةُ على المربّع تصعد إلى الوسم
              * فيعيد الوسمُ تفعيلَ المربّع — تبديلان يلغي أحدهما الآخر. مقيس:
              * «Clicking the checkbox did not change its state». والربطُ بـ`id`
              * يعطي نفسَ اتّساع النقر بلا هذا التضاعف.
              */}
            {alertTopic && (
              <div className="flex items-start gap-2.5 rounded-lg border border-primary/40 bg-primary/5 p-3">
                <input
                  id="alertConsent"
                  type="checkbox"
                  checked={alertOn}
                  onChange={(e) => setAlertOn(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
                  disabled={isSubmitting}
                />
                <label htmlFor="alertConsent" className="cursor-pointer text-sm font-medium leading-relaxed">
                  {alertTopic.consent}
                </label>
              </div>
            )}

            <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/30 p-3">
              <input
                id="marketingConsent"
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
                disabled={isSubmitting}
                {...register("marketingConsent")}
              />
              <label htmlFor="marketingConsent" className="cursor-pointer text-xs leading-relaxed text-foreground/80">
                أوافق على استقبال رسائل مدوّنتي — الجديد في تخصّصي والعروض الحصريّة —
                على بريدي. <span className="text-muted-foreground">اختياريّ، ويمكنك إيقافه في أيّ وقت من إعدادات حسابك.</span>
              </label>
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
            <Link
              href={callbackUrl === "/" ? "/users/login" : `/users/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="text-primary hover:underline max-md:inline-flex max-md:min-h-11 max-md:items-center max-md:px-2"
            >
              تسجيل الدخول
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
