"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Newspaper } from "lucide-react";
import { useState } from "react";

interface NewsletterCTAProps {
  clientId: string;
}

export function NewsletterCTA({ clientId }: NewsletterCTAProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setLoading(true);
    try {
      const response = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, clientId }),
      });

      if (response.ok) {
        setSubscribed(true);
        setEmail("");
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="min-w-0 hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Newspaper className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            اشترك في النشرة الإخبارية
          </span>
        </div>
        {subscribed ? (
          <p className="text-sm text-muted-foreground">
            شكراً لك! تم الاشتراك بنجاح.
          </p>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
            <Input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-9 text-sm"
            />
            <Button type="submit" size="sm" disabled={loading} className="w-full">
              {loading ? "جاري..." : "اشترك"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
