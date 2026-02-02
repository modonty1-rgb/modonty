"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, Eye, EyeOff, Link2, Link2Off } from "lucide-react";
import { passwordSchema, type PasswordFormData } from "../helpers/schemas/settings-schemas";
import { changePassword, disconnectOAuthProvider } from "../actions/settings-actions";
import { useSession } from "next-auth/react";

export function SecuritySettings() {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [hasPassword, setHasPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!session?.user?.id) return;
      try {
        const response = await fetch(`/api/users/${session.user.id}/accounts`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setConnectedAccounts(data.data.accounts || []);
            setHasPassword(data.data.hasPassword || false);
          }
        }
      } catch (err) {
        console.error("Error fetching accounts:", err);
      }
    };
    fetchAccounts();
  }, [session?.user?.id]);

  const onSubmit = async (data: PasswordFormData) => {
    if (!session?.user?.id) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await changePassword(session.user.id, data);
      if (result.success) {
        setSuccess("تم تغيير كلمة المرور بنجاح");
        reset();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || "فشل تغيير كلمة المرور");
      }
    } catch (err) {
      setError("حدث خطأ أثناء تغيير كلمة المرور");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisconnect = async (accountId: string, provider: string) => {
    if (!session?.user?.id) return;
    if (!confirm(`هل أنت متأكد من قطع الاتصال بـ ${provider}?`)) return;

    try {
      const result = await disconnectOAuthProvider(session.user.id, provider, accountId);
      if (result.success) {
        setConnectedAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
        setSuccess("تم قطع الاتصال بنجاح");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || "فشل قطع الاتصال");
      }
    } catch (err) {
      setError("حدث خطأ أثناء قطع الاتصال");
    }
  };

  const getProviderName = (provider: string) => {
    const names: Record<string, string> = {
      google: "Google",
      facebook: "Facebook",
    };
    return names[provider] || provider;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            كلمة المرور
          </CardTitle>
          <CardDescription>
            {hasPassword
              ? "قم بتغيير كلمة المرور الخاصة بك"
              : "قم بإنشاء كلمة مرور لحسابك"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {hasPassword && (
              <div className="space-y-2">
                <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    {...register("currentPassword")}
                    placeholder="أدخل كلمة المرور الحالية"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.currentPassword && (
                  <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  {...register("newPassword")}
                  placeholder="أدخل كلمة المرور الجديدة"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-destructive">{errors.newPassword.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير، حرف صغير، ورقم
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            {success && (
              <div className="p-3 bg-green-500/10 text-green-500 rounded-md text-sm">
                {success}
              </div>
            )}

            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                {error}
              </div>
            )}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "تغيير كلمة المرور"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            الحسابات المتصلة
          </CardTitle>
          <CardDescription>
            إدارة الحسابات المرتبطة بحسابك
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connectedAccounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد حسابات متصلة</p>
          ) : (
            <div className="space-y-3">
              {connectedAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Link2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{getProviderName(account.provider)}</p>
                      <p className="text-sm text-muted-foreground">{account.providerAccountId}</p>
                    </div>
                  </div>
                  {connectedAccounts.length > 1 || hasPassword ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(account.id, account.provider)}
                    >
                      <Link2Off className="h-4 w-4 mr-2" />
                      قطع الاتصال
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      يجب أن يكون لديك طريقة تسجيل دخول واحدة على الأقل
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
