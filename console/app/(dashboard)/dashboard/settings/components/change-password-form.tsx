"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { ar } from "@/lib/ar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { changePassword } from "../actions/change-password-action";

type StrengthLevel = "weak" | "medium" | "strong";

function gradePassword(pw: string): { level: StrengthLevel; score: number } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score <= 2) return { level: "weak", score };
  if (score <= 3) return { level: "medium", score };
  return { level: "strong", score };
}

export function ChangePasswordForm() {
  const s = ar.settings;
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const strength = useMemo(() => gradePassword(newPassword), [newPassword]);
  const showStrength = newPassword.length > 0;
  const mismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(s.passwordsMismatch);
      return;
    }
    if (newPassword.length < 8) {
      toast.error(s.passwordMinLength);
      return;
    }
    startTransition(async () => {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        toast.success(s.passwordChanged);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res.error || s.updateFailed);
      }
    });
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <KeyRound className="h-4 w-4 text-primary" />
          {s.passwordCard}
        </CardTitle>
        <CardDescription>{s.passwordHint}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField
            id="currentPassword"
            label={s.currentPassword}
            value={currentPassword}
            onChange={setCurrentPassword}
            visible={showCurrent}
            toggle={() => setShowCurrent((v) => !v)}
            disabled={isPending}
          />

          <div className="space-y-2">
            <PasswordField
              id="newPassword"
              label={s.newPassword}
              value={newPassword}
              onChange={setNewPassword}
              visible={showNew}
              toggle={() => setShowNew((v) => !v)}
              disabled={isPending}
              minLength={8}
            />
            {showStrength && <StrengthMeter level={strength.level} />}
          </div>

          <div className="space-y-2">
            <PasswordField
              id="confirmPassword"
              label={s.confirmPassword}
              value={confirmPassword}
              onChange={setConfirmPassword}
              visible={showConfirm}
              toggle={() => setShowConfirm((v) => !v)}
              disabled={isPending}
              error={mismatch ? s.passwordsMismatch : undefined}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                isPending ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword ||
                mismatch
              }
            >
              {isPending ? s.saving : s.changePassword}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
  toggle,
  disabled,
  minLength,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  visible: boolean;
  toggle: () => void;
  disabled: boolean;
  minLength?: number;
  error?: string;
}) {
  const s = ar.settings;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required
          minLength={minLength}
          className="pe-10"
        />
        <button
          type="button"
          onClick={toggle}
          aria-label={visible ? s.hidePassword : s.showPassword}
          className="absolute end-2 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
          tabIndex={-1}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function StrengthMeter({ level }: { level: StrengthLevel }) {
  const s = ar.settings;
  const cfg = {
    weak: {
      label: s.strengthWeak,
      classes: "bg-red-500",
      width: "w-1/3",
      text: "text-red-600",
    },
    medium: {
      label: s.strengthMedium,
      classes: "bg-amber-500",
      width: "w-2/3",
      text: "text-amber-600",
    },
    strong: {
      label: s.strengthStrong,
      classes: "bg-emerald-500",
      width: "w-full",
      text: "text-emerald-600",
    },
  }[level];

  return (
    <div className="space-y-1">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full transition-all ${cfg.classes} ${cfg.width}`}
        />
      </div>
      <p className={`text-xs ${cfg.text}`}>{cfg.label}</p>
    </div>
  );
}
