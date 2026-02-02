"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
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
    <Card className="mt-12 mb-8 hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Mail className="h-5 w-5" />
          اشترك في النشرة الإخبارية
        </CardTitle>
      </CardHeader>
      <CardContent>
        {subscribed ? (
          <p className="text-sm text-muted-foreground">
            شكراً لك! تم الاشتراك بنجاح.
          </p>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "جاري..." : "اشترك"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
