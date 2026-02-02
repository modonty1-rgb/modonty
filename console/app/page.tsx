import Image from "next/image";
import { redirect } from "next/navigation";
import { Lock, BarChart3, Shield, Activity, Share2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/app/(auth)/login/components/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let session;
  try {
    session = await auth();
  } catch {
    session = null;
  }
  if (session?.clientId) {
    redirect("/dashboard");
  }

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-background">
      <div className="flex-1 overflow-hidden flex items-center justify-center py-4 px-5 md:py-5 md:px-6">
        <div className="container mx-auto max-w-5xl grid md:grid-cols-2 gap-4 items-stretch">
          {/* Left Side - Main Content */}
          <div className="bg-card border border-border rounded-lg shadow-sm p-5 md:p-6 text-center md:text-left space-y-3">
            {/* Logo/Brand Mark */}
            <div className="relative aspect-[3/1] w-full">
              <Image
                src="https://res.cloudinary.com/dfegnpgwx/image/upload/v1768724691/final-01_fdnhom.svg"
                alt="Modonty Client Portal"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="rounded-xl object-cover"
              />
            </div>

            {/* Main Heading */}
            <h1 className="text-2xl md:text-3xl font-semibold leading-tight text-foreground">
              Client Portal
            </h1>

            {/* Description */}
            <p className="text-base leading-relaxed text-muted-foreground max-w-lg">
              Sign in to access your dashboard, content, and analytics.
            </p>

            {/* Features Preview */}
            <div className="grid grid-cols-2 gap-2 pt-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground mb-1">Your Dashboard</h3>
                    <p className="text-sm text-muted-foreground">Track everything</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground mb-1">Secure Login</h3>
                    <p className="text-sm text-muted-foreground">Safe account access</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground mb-1">Account Security</h3>
                    <p className="text-sm text-muted-foreground">Protected data</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground mb-1">Real-time Updates</h3>
                    <p className="text-sm text-muted-foreground">Stay informed</p>
                  </div>
                </div>
              </div>

            {/* Additional Info */}
            <p className="pt-3 border-t border-border text-sm text-muted-foreground">
              Secure client access.
            </p>
          </div>

          {/* Right Side - Login Form + Marketing */}
          <div className="flex items-center justify-center w-full">
            <div className="flex w-full max-w-md flex-col gap-3">
              <LoginForm variant="inline" />
              <Card className="overflow-hidden rounded-lg border-border bg-card shadow-sm transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-3 pb-1">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                    aria-hidden
                  >
                    <Share2 className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-semibold leading-snug text-foreground">
                    Refer a colleague — earn 5 free articles each
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 pb-4">
                  <p className="text-base leading-relaxed text-muted-foreground">
                    When your referral subscribes to Modonty, you both receive five additional articles per month. Expand your content library while supporting your network.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
