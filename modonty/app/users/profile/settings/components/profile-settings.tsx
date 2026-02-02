"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Upload, User } from "lucide-react";
import { profileSchema, type ProfileFormData } from "../helpers/schemas/settings-schemas";
import { updateProfile } from "../actions/settings-actions";
import { useSession } from "next-auth/react";

export function ProfileSettings() {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name || "",
      bio: "",
      image: session?.user?.image || null,
    },
  });

  const imageUrl = watch("image");

  useEffect(() => {
    if (session?.user) {
      setValue("name", session.user.name || "");
      setValue("image", session.user.image || null);
      setImagePreview(session.user.image || null);
    }
  }, [session, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!session?.user?.id) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateProfile(session.user.id, data);
      if (result.success) {
        setSuccess("تم تحديث الملف الشخصي بنجاح");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || "فشل تحديث الملف الشخصي");
      }
    } catch (err) {
      setError("حدث خطأ أثناء تحديث الملف الشخصي");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setValue("image", result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          الملف الشخصي
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={imagePreview || imageUrl || undefined} alt={session?.user?.name || ""} />
              <AvatarFallback className="text-2xl">
                {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center gap-2">
              <Label htmlFor="image-upload" className="cursor-pointer">
                <Button type="button" variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    تغيير الصورة
                  </span>
                </Button>
              </Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              {errors.image && (
                <p className="text-sm text-destructive">{errors.image.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">الاسم</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="أدخل اسمك"
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
              value={session?.user?.email || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              لا يمكن تغيير البريد الإلكتروني
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">السيرة الذاتية</Label>
            <textarea
              id="bio"
              {...register("bio")}
              placeholder="اكتب سيرتك الذاتية (اختياري)"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              maxLength={500}
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
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
              "حفظ التغييرات"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
