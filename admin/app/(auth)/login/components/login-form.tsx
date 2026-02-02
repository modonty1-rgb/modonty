"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const emailValue = (formData.get("email") as string)?.trim() ?? "";
    const passwordValue = (formData.get("password") as string) ?? "";

    if (!emailValue || !passwordValue) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    signIn("credentials", {
      email: emailValue,
      password: passwordValue,
      redirect: false,
    })
      .then(async (result) => {
        console.log("[Login] signIn result:", result);

        if (result?.error) {
          console.error("[Login] Auth error:", result.error);
          if (result.error === "CredentialsSignin") {
            setError("Invalid email or password");
          } else {
            setError(result.error);
          }
          setLoading(false);
          return;
        }

        // Always verify session before redirect (NextAuth v5 beta quirk)
        const session = await getSession();
        if (session) {
          console.log("[Login] Session verified - login successful, redirecting...");
          router.push("/");
          router.refresh();
        } else {
          console.warn("[Login] No session found despite successful signIn");
          setError("Login failed. Please try again.");
        }
        setLoading(false);
      })
      .catch(async (error) => {
        console.error("[Login] signIn threw error:", error);

        // NextAuth v5 beta can throw even when login succeeds
        // Check session to verify if login actually succeeded
        await new Promise((resolve) => setTimeout(resolve, 500));

        const session = await getSession();
        if (session) {
          console.log("[Login] Session found - login succeeded despite error");
          router.push("/");
          router.refresh();
          setLoading(false);
          return;
        }

        // Real error - no session found
        console.error("[Login] No session found - real login failure");
        const err = error as Error;

        if (
          err.message?.includes("Failed to fetch") ||
          err.message?.includes("network") ||
          err.message?.includes("fetch") ||
          err.name === "TypeError"
        ) {
          setError(
            "Cannot connect to authentication server. Please check:\n" +
            "• Server is running\n" +
            "• /api/auth/signin is accessible\n" +
            "• AUTH_SECRET is set in .env"
          );
        } else {
          setError(err.message || "Login failed. Please try again.");
        }
        setLoading(false);
      });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
        <CardDescription className="text-center">
          Sign in to access the admin dashboard
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
              name="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            <Mail className="h-4 w-4 mr-2" />
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/forgot-password" className="underline hover:no-underline">
              Forgot password?
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
