"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ar } from "@/lib/ar";
import { messages } from "@/lib/messages";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Lock } from "lucide-react";

type LoginFormVariant = "default" | "inline";

interface LoginFormProps {
  variant?: LoginFormVariant;
}

const ID_IDENTIFIER = "login-identifier";
const ID_PASSWORD = "login-password";
const ID_ERROR = "login-error";

export function LoginForm({ variant = "default" }: LoginFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const clearError = () => {
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        identifier: identifier.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        const errorMsg = messages.error.invalidCredentials;
        setError(errorMsg);
        toast.error(errorMsg);
      } else if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError(ar.login.somethingWrong);
    } finally {
      setLoading(false);
    }
  };

  const errorProps = error
    ? { "aria-invalid": true as const, "aria-describedby": ID_ERROR }
    : {};

  const form = (
    <form
      onSubmit={handleSubmit}
      className={variant === "inline" ? "space-y-4" : "space-y-4"}
      noValidate
    >
      {error && (
        <div
          id={ID_ERROR}
          role="alert"
          aria-live="assertive"
          className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive transition-colors"
        >
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor={ID_IDENTIFIER} className="text-foreground">
          {ar.login.emailOrSlug}
        </Label>
        <Input
          id={ID_IDENTIFIER}
          type="text"
          inputMode="text"
          autoComplete="username"
          placeholder={ar.login.placeholderIdentifier}
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            clearError();
          }}
          required
          disabled={loading}
          className="h-11 border-input bg-background transition-colors focus-visible:ring-ring"
          {...errorProps}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={ID_PASSWORD} className="text-foreground">
          {ar.login.password}
        </Label>
        <Input
          id={ID_PASSWORD}
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearError();
          }}
          required
          disabled={loading}
          className="h-11 border-input bg-background transition-colors focus-visible:ring-ring"
          {...errorProps}
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        size="lg"
        className="w-full transition-colors hover:bg-primary/90"
      >
        <LogIn className="h-4 w-4 shrink-0" aria-hidden />
        <span>{loading ? ar.login.signingIn : ar.login.signIn}</span>
      </Button>
    </form>
  );

  if (variant === "inline") {
    return (
      <Card className="w-full border-border bg-card shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="space-y-1.5 pb-4">
          <div className="flex items-center gap-2">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
              aria-hidden
            >
              <Lock className="h-4 w-4" />
            </div>
            <CardTitle className="text-lg font-semibold leading-snug text-foreground">
              {ar.login.signIn}
            </CardTitle>
          </div>
          <CardDescription className="text-sm text-muted-foreground">
            {ar.login.useEmailOrSlug}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">{form}</CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="space-y-1.5 text-center">
        <CardTitle className="text-2xl font-semibold leading-tight tracking-tight text-foreground">
          {ar.login.clientPortal}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {ar.login.useEmailOrSlug}
        </CardDescription>
      </CardHeader>
      <CardContent>{form}</CardContent>
    </Card>
  );
}
