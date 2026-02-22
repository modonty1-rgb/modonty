"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ar } from "@/lib/ar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword } from "../actions/change-password-action";

interface ChangePasswordFormProps {
  clientId: string;
}

export function ChangePasswordForm({ clientId }: ChangePasswordFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (newPassword !== confirmPassword) {
      setError(ar.settings.passwordsMismatch);
      return;
    }
    if (newPassword.length < 8) {
      setError(ar.settings.passwordMinLength);
      return;
    }
    setLoading(true);
    try {
      const res = await changePassword(clientId, currentPassword, newPassword);
      if (res.success) {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        router.refresh();
      } else {
        setError(
          res.error === "wrongPassword"
            ? ar.settings.wrongPassword
            : res.error ?? ar.settings.updateFailed
        );
      }
    } catch {
      setError(ar.settings.somethingWrong);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{ar.settings.changePassword}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-md">
              {ar.settings.passwordChanged}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">{ar.settings.currentPassword}</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">{ar.settings.newPassword}</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              required
              minLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{ar.settings.confirmPassword}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? ar.settings.saving : ar.settings.save}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
