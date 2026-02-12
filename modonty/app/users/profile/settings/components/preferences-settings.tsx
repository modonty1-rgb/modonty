"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Palette } from "lucide-react";
import { updatePreferences } from "../actions/settings-actions";
import { useSession } from "@/components/providers/SessionContext";
import type { PreferencesFormData } from "../helpers/schemas/settings-schemas";

export function PreferencesSettings() {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<PreferencesFormData>({
    theme: "system",
    language: "ar",
    fontSize: "medium",
    layout: "comfortable",
    defaultSort: "newest",
    itemsPerPage: 10,
    autoExpandComments: false,
  });

  useEffect(() => {
    const loadPreferences = async () => {
      if (!session?.user?.id) return;
      try {
        const response = await fetch(`/api/users/${session.user.id}/settings`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.preferences) {
            setPreferences(data.data.preferences);
          }
        }
      } catch (err) {
        console.error("Error loading preferences:", err);
      }
    };
    loadPreferences();
  }, [session?.user?.id]);

  const handleSave = async () => {
    if (!session?.user?.id) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updatePreferences(session.user.id, preferences);
      if (result.success) {
        setSuccess("تم حفظ التفضيلات بنجاح");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || "فشل حفظ التفضيلات");
      }
    } catch (err) {
      setError("حدث خطأ أثناء حفظ التفضيلات");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          التفضيلات
        </CardTitle>
        <CardDescription>
          تخصيص تجربة الاستخدام حسب تفضيلاتك
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>المظهر</Label>
            <select
              value={preferences.theme}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  theme: e.target.value as "light" | "dark" | "system",
                })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="light">فاتح</option>
              <option value="dark">داكن</option>
              <option value="system">نظام</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>اللغة</Label>
            <select
              value={preferences.language}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  language: e.target.value as "ar" | "en",
                })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>حجم الخط</Label>
            <select
              value={preferences.fontSize}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  fontSize: e.target.value as "small" | "medium" | "large",
                })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="small">صغير</option>
              <option value="medium">متوسط</option>
              <option value="large">كبير</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>التخطيط</Label>
            <select
              value={preferences.layout}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  layout: e.target.value as "compact" | "comfortable",
                })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="compact">مضغوط</option>
              <option value="comfortable">مريح</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>الترتيب الافتراضي</Label>
            <select
              value={preferences.defaultSort}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  defaultSort: e.target.value as "newest" | "oldest" | "popular",
                })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="newest">الأحدث</option>
              <option value="oldest">الأقدم</option>
              <option value="popular">الأكثر شعبية</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>عدد العناصر في الصفحة</Label>
            <input
              type="number"
              min="5"
              max="50"
              value={preferences.itemsPerPage}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  itemsPerPage: parseInt(e.target.value) || 10,
                })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>توسيع التعليقات تلقائياً</Label>
              <p className="text-sm text-muted-foreground">
                عرض جميع التعليقات بشكل افتراضي
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.autoExpandComments}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  autoExpandComments: e.target.checked,
                })
              }
              className="w-4 h-4"
            />
          </div>
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

        <Button onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            "حفظ التغييرات"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
