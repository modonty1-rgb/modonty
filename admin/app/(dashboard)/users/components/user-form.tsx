"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { messages } from "@/lib/messages";
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
import { ArrowRight, Loader2, Save, Trash2, Eye, EyeOff, UserPlus, ImageOff, Camera, Activity, Clock, CalendarDays, ScrollText, ShieldCheck } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { StaffRole } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createUser, updateUser, deleteUser } from "../actions/users-actions";
import { STAFF_ROLES, roleMeta } from "../lib/roles";

interface UserFormProps {
  initialData?: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role?: string;
    isActive?: boolean | null;
    createdAt?: Date;
  };
  /** Edit mode only — the account's activity snapshot for the sidebar. */
  activity?: {
    total: number;
    last7: number;
    lastActiveAt: Date | null;
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

export function UserForm({ initialData, activity, userId }: UserFormProps) {
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
    role: (initialData?.role as StaffRole) || ("ADMIN" as StaffRole),
    isActive: initialData?.isActive !== false, // absent/null/true = active
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
          role: formData.role,
          isActive: formData.isActive,
        })
      : await createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          image: imageValue || undefined,
          role: formData.role,
          isActive: formData.isActive,
        });

    if (result.success) {
      toast({
        title: isEditMode ? messages.success.updated : messages.success.created,
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
        title: messages.success.deleted,
        description: "تم حذف المستخدم بنجاح",
        variant: "success",
      });
      router.push("/users");
      router.refresh();
    } else {
      setDeleteLoading(false);
      setDeleteOpen(false);
      toast({
        title: messages.error.delete_failed,
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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold leading-tight">
                {isEditMode ? "Edit Staff" : "Add New Staff"}
              </h1>
              {isEditMode && (
                <Badge className={cn("border-transparent", roleMeta(formData.role).badge)}>
                  {roleMeta(formData.role).label}
                </Badge>
              )}
              {isEditMode && (
                <Badge
                  className={cn(
                    "border-transparent",
                    formData.isActive
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                      : "bg-red-500/15 text-red-600 dark:text-red-300"
                  )}
                >
                  {formData.isActive ? "Active" : "Inactive"}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">
              {isEditMode ? "Update account details" : "Create a new staff account for the dashboard"}
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
                  <DialogTitle>Remove this staff member?</DialogTitle>
                  <DialogDescription>
                    {formData.name ? `"${formData.name}" will be permanently removed from the system.` : "This staff member will be permanently removed."}{" "}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Profile + Security ─────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Name, email and the role this person plays on the team.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
                    {hasValidImage ? (
                      <Image
                        src={formData.image}
                        alt={formData.name || "Staff"}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        sizes="80px"
                        onError={() => setImgError(true)}
                      />
                    ) : formData.image && imgError ? (
                      <ImageOff className="h-8 w-8 text-destructive/40" />
                    ) : (
                      <span className="text-2xl font-semibold text-muted-foreground/60">{initials}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.image) handleClearImage();
                      else setShowImageInput(true);
                    }}
                    className="absolute bottom-0 end-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                  >
                    {formData.image ? <Trash2 className="h-3.5 w-3.5" /> : <Camera className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {(showImageInput || formData.image) && (
                  <div className="flex-1">
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
                hint={messages.hints.user.email}
                autoComplete="new-email"
              />

              {/* Role */}
              <div className="space-y-1.5">
                <Label htmlFor="role">
                  Role <span className="text-destructive">*</span>
                </Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {STAFF_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label} — {r.description}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">{roleMeta(formData.role).description}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <CardTitle>Security</CardTitle>
              </div>
              <CardDescription>
                {isEditMode ? "Leave empty to keep the current password." : "Set the initial password — the staff member can change it later."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-w-md">
                <div className="relative">
                  <FormInput
                    label={isEditMode ? "New Password" : "Password"}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={isEditMode ? "Leave empty to keep current" : "Min 6 characters"}
                    required={!isEditMode}
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
            </CardContent>
          </Card>
        </div>

        {/* ── Right: Status · Account · Activity ───────────────────── */}
        <div className="space-y-6">
          {/* Employment status — controls whether they can sign in */}
          <Card>
            <CardHeader>
              <CardTitle>Employment status</CardTitle>
              <CardDescription>
                Inactive staff keep their record &amp; history but can no longer sign in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="inline-flex rounded-lg border bg-muted/40 p-0.5 text-sm font-semibold">
                {([{ v: true, l: "Active" }, { v: false, l: "Inactive" }] as const).map((o) => (
                  <button
                    key={o.l}
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: o.v })}
                    className={cn(
                      "rounded-md px-4 py-1.5 transition-colors",
                      formData.isActive === o.v
                        ? o.v
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                          : "bg-red-500/15 text-red-600 dark:text-red-300"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
              {!formData.isActive && (
                <p className="mt-3 text-xs text-red-600 dark:text-red-400">
                  This person will be signed out and blocked from the system on save.
                </p>
              )}
            </CardContent>
          </Card>

          {isEditMode && (
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4 shrink-0" />
                  <span>Member since</span>
                  <span className="ms-auto font-medium text-foreground" suppressHydrationWarning>
                    {initialData?.createdAt ? format(new Date(initialData.createdAt), "PP") : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>Last active</span>
                  <span className="ms-auto font-medium text-foreground" suppressHydrationWarning>
                    {activity?.lastActiveAt
                      ? formatDistanceToNow(new Date(activity.lastActiveAt), { addSuffix: true })
                      : "No activity"}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {isEditMode && activity && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <CardTitle>Activity</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-2xl font-semibold tabular-nums leading-none">{activity.total.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Total actions</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-2xl font-semibold tabular-nums leading-none">{activity.last7.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
                  </div>
                </div>
                {initialData?.id && (
                  <Link
                    href={`/users/${initialData.id}/log`}
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <ScrollText className="h-4 w-4" />
                    View full activity
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </form>
  );
}
