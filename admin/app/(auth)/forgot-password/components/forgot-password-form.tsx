"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "../actions/forgot-password-actions";
import { Mail } from "lucide-react";

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitted(false);
    setError(null);

    try {
      const result = await requestPasswordReset(email);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Check your email</CardTitle>
          <CardDescription className="text-center">
            If an account exists, you&apos;ll receive an email shortly with a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 text-sm bg-muted border rounded-md text-center">
            <p className="font-medium">Email sent to: {email}</p>
            <p className="text-muted-foreground mt-1">
              Please check your inbox and click the reset link.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Back to login</Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Didn&apos;t receive the email? Go back to login and try again.
            <br />
            <span className="text-destructive">Note: Requesting again will invalidate the previous link.</span>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Forgot password</CardTitle>
        <CardDescription className="text-center">
          Enter your email to receive a reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            <Mail className="h-4 w-4 mr-2" />
            {loading ? "Sending..." : "Send reset link"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="underline hover:no-underline">
              Back to login
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
