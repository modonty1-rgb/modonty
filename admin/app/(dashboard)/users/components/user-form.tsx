"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormInput } from "@/components/admin/form-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowRight, Loader2, Save, Trash2, Eye, EyeOff, UserPlus, ImageOff, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createUser, updateUser, deleteUser } from "../actions/users-actions";

interface UserFormProps {
  initialData?: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  userId?: string;
}

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  if (!password) return { label: "", color: "", width: "0%" };
  if (password.length < 6) return { label: "Weak", color: "bg-destructive", width: "25%" };
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const score = [hasUpper, hasLower, hasNumber, hasSpecial, password.length >= 10].filter(Boolean).length;
  if (score <= 2) return { label: "Fair", color: "bg-yellow-500", width: "50%" };
  if (score <= 3) return { label: "Good", color: "bg-blue-500", width: "75%" };
  return { label: "Strong", color: "bg-green-500", width: "100%" };
}

export function UserForm({ initialData, userId }: UserFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const isEditMode = Boolean(userId);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    password: "",
    image: initialData?.image || "",
  });

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);
  const initials = (formData.name || "A").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const hasValidImage = formData.image && !imgError;

  const handleImageChange = (url: string) => {
    setFormData((prev) => ({ ...prev, image: url }));
    setImgError(false);
  };

  const handleClearImage = () => {
    setFormData((prev) => ({ ...prev, image: "" }));
    setImgError(false);
    setShowImageInput(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isEditMode && formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const imageValue = hasValidImage ? formData.image : "";

    const result = userId
      ? await updateUser(userId, {
          name: formData.name,
          email: formData.email,
          password: formData.password || undefined,
          image: imageValue,
        })
      : await createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          image: imageValue || undefined,
        });

    if (result.success) {
      toast({
        title: isEditMode ? "تم التحديث" : "تم الإنشاء",
        description: isEditMode
          ? "تم تحديث بيانات المستخدم"
          : "تم إنشاء المستخدم بنجاح",
        variant: "success",
      });
      router.push("/users");
      router.refresh();
    } else {
      setError(result.error || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userId) return;
    setDeleteLoading(true);
    const result = await deleteUser(userId);
    if (result.success) {
      toast({
        title: "تم الحذف",
        description: "تم حذف المستخدم بنجاح",
        variant: "success",
      });
      router.push("/users");
      router.refresh();
    } else {
      setDeleteLoading(false);
      setDeleteOpen(false);
      toast({
        title: "فشل الحذف",
        description: result.error || "حدث خطأ أثناء الحذف.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/users">
            <Button variant="ghost" size="icon" type="button">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold leading-tight">
              {isEditMode ? "Edit Admin" : "Add New Admin"}
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {isEditMode ? "Update account details" : "Create a new admin account for the dashboard"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isEditMode && (
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" type="button" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4 me-2" />
                  Remove
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Remove this admin?</DialogTitle>
                  <DialogDescription>
                    {formData.name ? `"${formData.name}" will be permanently removed from the system.` : "This admin will be permanently removed."}{" "}
                    This cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleteLoading}>
                    Keep
                  </Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
                    {deleteLoading ? <><Loader2 className="h-4 w-4 me-2 animate-spin" /> Removing...</> : "Yes, Remove"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? (
              <><Loader2 className="h-4 w-4 me-2 animate-spin" /> Saving...</>
            ) : isEditMode ? (
              <><Save className="h-4 w-4 me-2" /> Save Changes</>
            ) : (
              <><UserPlus className="h-4 w-4 me-2" /> Create Account</>
            )}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
          {error}
        </div>
      )}

      <div className="max-w-2xl">
        <Card>
          <CardContent className="pt-8">
            {/* Avatar — centered hero element */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-border bg-muted flex items-center justify-center">
                  {hasValidImage ? (
                    <img
                      src={formData.image}
                      alt={formData.name || "Admin"}
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : formData.image && imgError ? (
                    <ImageOff className="h-10 w-10 text-destructive/40" />
                  ) : (
                    <span className="text-3xl font-semibold text-muted-foreground/60">{initials}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (formData.image) handleClearImage();
                    else setShowImageInput(true);
                  }}
                  className="absolute bottom-0 end-0 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                >
                  {formData.image ? (
                    <Trash2 className="h-4 w-4" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Image URL input — shows on camera click */}
              {(showImageInput || formData.image) && (
                <div className="mt-4 w-full max-w-sm">
                  <Input
                    value={formData.image}
                    onChange={(e) => handleImageChange(e.target.value)}
                    placeholder="Paste image link..."
                    className={imgError ? "border-destructive" : ""}
                  />
                  {imgError && (
                    <p className="text-xs text-destructive mt-1">This link doesn&apos;t seem to be a valid image</p>
                  )}
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              <FormInput
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ahmed Mohammed"
                required
              />
              <FormInput
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@email.com"
                required
                hint="Used to log in to the dashboard"
                autoComplete="new-email"
              />

              {/* Password */}
              <div className="space-y-2">
                <div className="relative">
                  <FormInput
                    label={isEditMode ? "New Password" : "Password"}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={isEditMode ? "Leave empty to keep current" : "Min 6 characters"}
                    required={!isEditMode}
                    hint={isEditMode ? "Only fill this to change the password" : undefined}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: passwordStrength.width }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Password strength: <span className="font-medium">{passwordStrength.label}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
