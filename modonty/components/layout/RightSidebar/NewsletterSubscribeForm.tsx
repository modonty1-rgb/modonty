"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconLoading, IconCheckCircle } from "@/lib/icons";

export function NewsletterSubscribeForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email?.trim() || !email.includes("@")) {
      setError("يرجى إدخال بريد إلكتروني صحيح");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/news/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const result = await res.json();
      if (result.success) {
        setSuccess(true);
        setEmail("");
      } else {
        setError(result.error || "فشل الاشتراك. يرجى المحاولة مرة أخرى.");
      }
    } catch {
      setError("حدث خطأ. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-foreground">
        <IconCheckCircle className="h-4 w-4 shrink-0 text-primary" />
        <span>شكراً، تم تسجيل بريدك بنجاح.</span>
      </div>
    );
  }

  return (
    <form className="space-y-2" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="أدخل بريدك الإلكتروني"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isSubmitting}
        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
        required
      />
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      <Button type="submit" className="w-full h-9 text-sm bg-accent text-accent-foreground hover:bg-accent/90 transition-colors border-0" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <IconLoading className="h-3.5 w-3.5 animate-spin shrink-0" />
            <span className="mr-1.5">جاري الاشتراك...</span>
          </>
        ) : (
          "اشترك"
        )}
      </Button>
    </form>
  );
}
