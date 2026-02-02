"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField } from "@/components/admin/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Eye, EyeOff, KeyRound, AlertCircle } from "lucide-react";
import type { ClientFormSchemaType } from "../../helpers/client-form-schema";

function generateRandomPassword(length = 12): string {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  const arr = new Uint8Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < length; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(arr, (b) => charset[b % charset.length]).join("");
}

interface SecuritySectionProps {
  form: UseFormReturn<ClientFormSchemaType>;
  isEditMode?: boolean;
}

export function SecuritySection({ form, isEditMode = false }: SecuritySectionProps) {
  const { watch, setValue, formState: { errors } } = form;
  const email = watch("email");
  const [showPassword, setShowPassword] = useState(false);

  const hint = isEditMode
    ? "اتركه فارغاً للاحتفاظ بكلمة المرور الحالية - الحد الأدنى 8 أحرف"
    : "اختياري - الحد الأدنى 8 أحرف - يُستخدم لمصادقة العميل وتسجيل الدخول";

  const hasSecurityErrors = Boolean(errors.password);

  return (
    <div className="border border-border rounded-lg bg-muted/30 p-4 md:p-5 flex flex-col md:flex-row gap-4">
      {/* Left column: icon + title */}
      <div className="flex flex-row md:flex-col items-start gap-3 md:w-56">
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center border border-border">
            <KeyRound className="h-6 w-6 text-muted-foreground" />
          </div>
          {hasSecurityErrors && (
            <AlertCircle className="h-4 w-4 text-destructive absolute -top-1 -right-1" aria-hidden="true" />
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-xs font-extrabold text-foreground tracking-wide uppercase">
            Security & access
          </h3>
          <p className="text-xs text-muted-foreground">
            Manage the client&apos;s login email and optional password for access.
          </p>
        </div>
      </div>

      {/* Right column: fields */}
      <div className="flex-1 space-y-4">
        <div className="relative">
          <label className="text-sm font-medium text-foreground block mb-1.5">
            Email
          </label>
          <div className="h-12 w-full rounded-md border-2 border-input bg-muted flex items-center gap-2 px-3">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm text-muted-foreground">
              {email || "No email set"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 px-1">
            Client login email • Synced with Required tab
          </p>
        </div>

        <FormField
          label="Password"
          name="password"
          error={errors.password?.message}
          hint={hint}
        >
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={watch("password") || ""}
              onChange={(e) => setValue("password", e.target.value || null, { shouldValidate: true })}
              placeholder={isEditMode ? "Enter new password to change" : "Enter password (optional)"}
              className={errors.password ? "border-destructive pr-28" : "pr-28"}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
                onClick={() => setValue("password", generateRandomPassword(), { shouldValidate: true })}
              >
                <KeyRound className="h-4 w-4 mr-1" />
                Generate
              </Button>
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="p-1.5 rounded text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </FormField>
      </div>
    </div>
  );
}
