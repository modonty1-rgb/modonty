"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardTitleWithIcon } from "@/components/ui/card-title-with-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconBell } from "@/lib/icons";

interface ClientNewsletterCardProps {
  clientId: string;
  clientName: string;
}

export function ClientNewsletterCard({ clientId, clientName }: ClientNewsletterCardProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), clientId }),
      });
      const data = await res.json() as { success: boolean; error?: string };

      if (data.success) {
        setStatus("success");
        setEmail("");
      } else {
        setErrorMsg(data.error ?? "حصل خطأ، حاول مرة ثانية");
        setStatus("error");
      }
    } catch {
      setErrorMsg("تأكد من اتصالك بالإنترنت وحاول ثانية");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-5 text-center space-y-1">
          <p className="text-sm font-semibold text-primary">تم الاشتراك ✓</p>
          <p className="text-xs text-muted-foreground">راح تصلك آخر مقالات {clientName} على بريدك</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitleWithIcon title="اشترك في نشرة العميل" icon={IconBell} />
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">
          خلّ آخر مقالات {clientName} توصلك مباشرة على بريدك.
        </p>
        <form onSubmit={handleSubmit} className="space-y-2">
          <Input
            type="email"
            placeholder="بريدك الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
            required
            className="text-sm"
            dir="ltr"
          />
          {status === "error" && (
            <p className="text-xs text-destructive">{errorMsg}</p>
          )}
          <Button
            type="submit"
            size="sm"
            className="w-full"
            disabled={status === "loading" || !email.trim()}
          >
            {status === "loading" ? "جاري الاشتراك..." : "اشترك"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
