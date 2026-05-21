import Link from "next/link";
import { CheckCircle2, LogIn, ExternalLink, ShieldCheck } from "lucide-react";
import { ar } from "@/lib/ar";
import { ModontyLogo } from "@/app/components/modonty-logo";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

export const metadata = {
  title: ar.signedOut.pageTitle + " · مدوّنتي",
};

export default function SignedOutPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-background px-5 py-8">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="flex justify-center">
          <div className="w-48">
            <ModontyLogo />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-5">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="rounded-full bg-emerald-500/10 p-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              {ar.signedOut.heading}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {ar.signedOut.subtitle}
            </p>
          </div>

          <div className="space-y-2.5">
            <Button asChild className="w-full" size="lg">
              <Link href="/login">
                <LogIn className="h-4 w-4 me-2" />
                {ar.signedOut.signInAgain}
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="lg">
              <a href="https://modonty.com" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 me-2" />
                {ar.signedOut.visitModonty}
              </a>
            </Button>
          </div>

          <div className="flex items-start gap-2 pt-2 border-t border-border">
            <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {ar.signedOut.safeNote}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
