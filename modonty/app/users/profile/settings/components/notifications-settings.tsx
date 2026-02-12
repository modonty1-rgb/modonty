"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Bell } from "lucide-react";
import { updateNotificationSettings } from "../actions/settings-actions";
import { useSession } from "@/components/providers/SessionContext";
import type { NotificationFormData } from "../helpers/schemas/settings-schemas";

export function NotificationsSettings() {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<NotificationFormData>({
    emailCommentReplies: true,
    emailCommentLikes: true,
    emailArticleLikes: true,
    emailNewArticles: true,
    emailWeeklyDigest: false,
    inAppNotifications: true,
    notificationSound: true,
    pushNotifications: false,
  });

  useEffect(() => {
    const loadSettings = async () => {
      if (!session?.user?.id) return;
      try {
        const response = await fetch(`/api/users/${session.user.id}/settings`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.notifications) {
            setSettings(data.data.notifications);
          }
        }
      } catch (err) {
        console.error("Error loading notification settings:", err);
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
      const result = await updateNotificationSettings(session.user.id, settings);
      if (result.success) {
        setSuccess("تم حفظ إعدادات الإشعارات بنجاح");
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
          <Bell className="h-5 w-5" />
          إعدادات الإشعارات
        </CardTitle>
        <CardDescription>
          اختر كيف ومتى تريد تلقي الإشعارات
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold">إشعارات البريد الإلكتروني</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>ردود على تعليقاتي</Label>
              <p className="text-sm text-muted-foreground">
                إرسال إشعار عند الرد على تعليقاتك
              </p>
            </div>
            <Switch
              checked={settings.emailCommentReplies}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, emailCommentReplies: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>إعجابات على تعليقاتي</Label>
              <p className="text-sm text-muted-foreground">
                إرسال إشعار عند الإعجاب بتعليقاتك
              </p>
            </div>
            <Switch
              checked={settings.emailCommentLikes}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, emailCommentLikes: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>إعجابات على مقالاتي</Label>
              <p className="text-sm text-muted-foreground">
                إرسال إشعار عند الإعجاب بمقالاتك
              </p>
            </div>
            <Switch
              checked={settings.emailArticleLikes}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, emailArticleLikes: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>مقالات جديدة من المتابعين</Label>
              <p className="text-sm text-muted-foreground">
                إرسال إشعار عند نشر مقالات جديدة
              </p>
            </div>
            <Switch
              checked={settings.emailNewArticles}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, emailNewArticles: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>ملخص أسبوعي</Label>
              <p className="text-sm text-muted-foreground">
                إرسال ملخص أسبوعي بنشاطك
              </p>
            </div>
            <Switch
              checked={settings.emailWeeklyDigest}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, emailWeeklyDigest: checked })
              }
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold">إشعارات التطبيق</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>الإشعارات داخل التطبيق</Label>
              <p className="text-sm text-muted-foreground">
                عرض الإشعارات داخل التطبيق
              </p>
            </div>
            <Switch
              checked={settings.inAppNotifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, inAppNotifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>صوت الإشعارات</Label>
              <p className="text-sm text-muted-foreground">
                تشغيل صوت عند وصول إشعار
              </p>
            </div>
            <Switch
              checked={settings.notificationSound}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, notificationSound: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>الإشعارات الفورية</Label>
              <p className="text-sm text-muted-foreground">
                إرسال إشعارات فورية للمتصفح
              </p>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, pushNotifications: checked })
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
