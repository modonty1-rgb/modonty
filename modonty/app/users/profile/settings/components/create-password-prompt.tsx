"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  IconLoading,
  IconShield,
  IconLock,
  IconViews,
  IconEyeOff,
} from "@/lib/icons";
import { createPasswordSchema, type CreatePasswordFormData } from "../helpers/schemas/settings-schemas";
import { createPassword } from "../actions/settings-actions";
import { useSession } from "@/components/providers/SessionContext";

export function CreatePasswordPrompt() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePasswordFormData>({
    resolver: zodResolver(createPasswordSchema),
  });

  const onSubmit = async (data: CreatePasswordFormData) => {
    if (!session?.user?.id) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createPassword(session.user.id, data);

      if (!result.success) {
        setError(result.error || "فشل إنشاء كلمة المرور");
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error("Error creating password:", err);
      setError("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card className="border-primary/50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-3">
                <IconShield className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary">
                تم إنشاء كلمة المرور بنجاح
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                يمكنك الآن الوصول إلى جميع الإعدادات
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2">
            <IconLock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>إنشاء كلمة مرور</CardTitle>
            <CardDescription>
              تحتاج إلى إنشاء كلمة مرور للوصول إلى إعدادات الحساب
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <IconEyeOff className="h-4 w-4" />
                ) : (
                  <IconViews className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("confirmPassword")}
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <IconEyeOff className="h-4 w-4" />
                ) : (
                  <IconViews className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <IconLoading className="h-4 w-4 mr-2 animate-spin" />
                جاري إنشاء كلمة المرور...
              </>
            ) : (
              <>
                <IconShield className="h-4 w-4 mr-2" />
                إنشاء كلمة المرور
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
