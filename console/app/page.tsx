import { redirect } from "next/navigation";
import { Lock, BarChart3, Shield, Activity, Share2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { ar } from "@/lib/ar";
import { LoginForm } from "@/app/(auth)/login/components/login-form";
import { ModontyLogo } from "@/app/components/modonty-logo";
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
    <div className="h-dvh flex flex-col overflow-x-hidden overflow-y-hidden bg-background">
      {/* Mobile hero - logo full width, flat, stable width to prevent scroll-induced resize */}
      <div className="md:hidden flex-shrink-0 flex items-center justify-center px-4 py-6 w-full min-w-full">
        <div className="w-full">
          <ModontyLogo />
        </div>
      </div>
      <div className="flex-1 min-w-0 overflow-auto [scrollbar-gutter:stable] flex items-center justify-center py-4 px-5 md:py-5 md:px-6">
        <div className="container mx-auto max-w-5xl grid md:grid-cols-2 gap-4 items-stretch">
          {/* Left Side - Main Content (hidden on mobile) */}
          <div className="hidden md:block bg-card border border-border rounded-lg shadow-sm p-5 md:p-6 text-center md:text-start space-y-3">
            <ModontyLogo />

            <h1 className="text-2xl md:text-3xl font-semibold leading-tight text-foreground">
              {ar.login.clientPortal}
            </h1>

            <p className="text-base leading-relaxed text-muted-foreground max-w-lg">
              {ar.login.signInCopy}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div className="text-start">
                    <h3 className="font-semibold text-foreground mb-1">{ar.login.yourDashboard}</h3>
                    <p className="text-sm text-muted-foreground">{ar.login.trackEverything}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div className="text-start">
                    <h3 className="font-semibold text-foreground mb-1">{ar.login.secureLogin}</h3>
                    <p className="text-sm text-muted-foreground">{ar.login.safeAccountAccess}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="text-start">
                    <h3 className="font-semibold text-foreground mb-1">{ar.login.accountSecurity}</h3>
                    <p className="text-sm text-muted-foreground">{ar.login.protectedData}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div className="text-start">
                    <h3 className="font-semibold text-foreground mb-1">{ar.login.realtimeUpdates}</h3>
                    <p className="text-sm text-muted-foreground">{ar.login.stayInformed}</p>
                  </div>
                </div>
              </div>

            <p className="pt-3 border-t border-border text-sm text-muted-foreground">
              {ar.login.secureAccess}
            </p>
          </div>

          {/* Right Side - Login Form + Marketing */}
          <div className="flex items-center justify-center w-full">
            <div className="flex w-full max-w-md flex-col gap-3">
              <LoginForm variant="inline" />
              <Card className="hidden md:block overflow-hidden rounded-lg border-border bg-card shadow-sm transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-3 pb-1">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                    aria-hidden
                  >
                    <Share2 className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-semibold leading-snug text-foreground">
                    {ar.login.referTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 pb-4">
                  <p className="text-base leading-relaxed text-muted-foreground">
                    {ar.login.referDesc}
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
