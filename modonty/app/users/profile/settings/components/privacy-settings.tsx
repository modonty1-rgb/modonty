"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Lock } from "lucide-react";
import { updatePrivacySettings } from "../actions/settings-actions";
import { useSession } from "next-auth/react";
import type { PrivacyFormData } from "../helpers/schemas/settings-schemas";

export function PrivacySettings() {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<PrivacyFormData>({
    profileVisibility: "public",
    showEmail: false,
    showActivity: true,
    showComments: true,
    showLikes: true,
    showFavorites: true,
  });

  useEffect(() => {
    // Load settings from API
    const loadSettings = async () => {
      if (!session?.user?.id) return;
      try {
        const response = await fetch(`/api/users/${session.user.id}/settings`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.privacy) {
            setSettings(data.data.privacy);
          }
        }
      } catch (err) {
        console.error("Error loading privacy settings:", err);
      }
    };
    loadSettings();
  }, [session?.user?.id]);

  const handleSave = async () => {
    if (!session?.user?.id) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updatePrivacySettings(session.user.id, settings);
      if (result.success) {
        setSuccess("تم حفظ إعدادات الخصوصية بنجاح");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || "فشل حفظ الإعدادات");
      }
    } catch (err) {
      setError("حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          إعدادات الخصوصية
        </CardTitle>
        <CardDescription>
          تحكم في من يمكنه رؤية معلوماتك ونشاطك
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>رؤية الملف الشخصي</Label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="profileVisibility"
                  value="public"
                  checked={settings.profileVisibility === "public"}
                  onChange={(e) =>
                    setSettings({ ...settings, profileVisibility: e.target.value as "public" | "connections" | "private" })
                  }
                  className="w-4 h-4"
                />
                <span>عام (يمكن للجميع رؤيته)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="profileVisibility"
                  value="connections"
                  checked={settings.profileVisibility === "connections"}
                  onChange={(e) =>
                    setSettings({ ...settings, profileVisibility: e.target.value as "public" | "connections" | "private" })
                  }
                  className="w-4 h-4"
                />
                <span>المتابعون فقط</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="profileVisibility"
                  value="private"
                  checked={settings.profileVisibility === "private"}
                  onChange={(e) =>
                    setSettings({ ...settings, profileVisibility: e.target.value as "public" | "connections" | "private" })
                  }
                  className="w-4 h-4"
                />
                <span>خاص (أنت فقط)</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>إظهار البريد الإلكتروني</Label>
              <p className="text-sm text-muted-foreground">
                السماح للآخرين برؤية بريدك الإلكتروني
              </p>
            </div>
            <Switch
              checked={settings.showEmail}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, showEmail: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>إظهار النشاط</Label>
              <p className="text-sm text-muted-foreground">
                إظهار نشاطك على الملف الشخصي
              </p>
            </div>
            <Switch
              checked={settings.showActivity}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, showActivity: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>إظهار التعليقات</Label>
              <p className="text-sm text-muted-foreground">
                إظهار تعليقاتك علناً
              </p>
            </div>
            <Switch
              checked={settings.showComments}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, showComments: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>إظهار الإعجابات</Label>
              <p className="text-sm text-muted-foreground">
                إظهار ما أعجبك علناً
              </p>
            </div>
            <Switch
              checked={settings.showLikes}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, showLikes: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>إظهار المحفوظات</Label>
              <p className="text-sm text-muted-foreground">
                إظهار المقالات المحفوظة علناً
              </p>
            </div>
            <Switch
              checked={settings.showFavorites}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, showFavorites: checked })
              }
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
