'use client';

import { useState } from 'react';
import Link from "@/components/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SocialFacebookOutline } from "@/components/icons/facebook";
import { Linkedin } from "@/components/icons/linkedin";
import { Youtube } from "@/components/icons/youtube";
import { Twitter } from "@/components/icons/twitter";
import { Instagram } from "@/components/icons/instagram";
import { TiktokLogoLight } from "@/components/icons/tiktok";
import { RoundSnapchat } from "@/components/icons/snapchat";
import {
  IconChevronDown, IconFeed, IconInfo, IconMessage, IconHelpCircle, IconLoading, IconCheckCircle, IconBell,
} from "@/lib/icons";
import type { ComponentType, SVGProps } from "react";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const ICON_MAP: Record<string, IconComponent> = {
  facebook:  SocialFacebookOutline,
  linkedin:  Linkedin,
  youtube:   Youtube,
  twitter:   Twitter,
  instagram: Instagram,
  tiktok:    TiktokLogoLight,
  snapchat:  RoundSnapchat,
};

const linkClass =
  "inline-flex items-center gap-1.5 w-full rounded px-2 py-1 text-xs text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors [&>svg]:h-3 [&>svg]:w-3 [&>svg]:shrink-0";

interface SocialLink { key: string; href: string; label: string }

export function FollowCardClient({ socialLinks }: { socialLinks: SocialLink[] }) {
  const [expanded, setExpanded] = useState(false);
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
      const result = await res.json() as { success: boolean; error?: string };
      if (result.success) {
        setSuccess(true);
        setEmail("");
      } else {
        setError(result.error ?? "فشل الاشتراك. يرجى المحاولة مرة أخرى.");
      }
    } catch {
      setError("حدث خطأ. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="flex-none">
      <CardContent className="p-4 flex flex-col gap-3">

        {/* Row 1: label + social icons (full width) */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <IconBell className="h-4 w-4 shrink-0 text-primary" />
            <h2 className="text-xs font-semibold text-muted-foreground uppercase shrink-0">
              تابعنا
            </h2>
          </div>
          {socialLinks.length > 0 && (
            <nav className="flex flex-wrap gap-0.5" aria-label="روابط وسائل التواصل الاجتماعي">
              {socialLinks.map(({ key, href, label }) => {
                const Icon = ICON_MAP[key];
                if (!Icon) return null;
                return (
                  <Link
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors"
                    aria-label={label}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Newsletter form */}
        {success ? (
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-foreground">
            <IconCheckCircle className="h-4 w-4 shrink-0 text-primary" />
            <span>شكراً، تم تسجيل بريدك بنجاح.</span>
          </div>
        ) : (
          <form id="newsletter-form" onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="أدخل بريدك الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
              required
            />
            {error && <p className="text-xs text-destructive">{error}</p>}

            {/* Row 2: اشترك + المزيد side by side */}
            <div className="flex gap-2">
              <Button
                type="submit"
                form="newsletter-form"
                className="flex-1 h-9 text-sm bg-accent text-accent-foreground hover:bg-accent/90 transition-colors border-0"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <IconLoading className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "انضم"
                )}
              </Button>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="inline-flex items-center gap-0.5 px-3 h-9 rounded-md border border-border text-[11px] text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors shrink-0"
                aria-expanded={expanded}
                aria-label="روابط إضافية"
              >
                المزيد
                <IconChevronDown className={`h-3 w-3 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </form>
        )}

        {expanded && (
          <nav aria-label="روابط إضافية" className="flex flex-col gap-0.5 border-t border-border pt-2">
            <Link href="/news" className={linkClass}><IconFeed aria-hidden />أخبار مودونتي</Link>
            <Link href="/about" className={linkClass}><IconInfo aria-hidden />من نحن</Link>
            <Link href="/help" className={linkClass}><IconHelpCircle aria-hidden />مركز المساعدة</Link>
            <Link href="/help/feedback" className={linkClass}><IconMessage aria-hidden />إرسال ملاحظات</Link>
            <div className="mt-1 border-t border-border pt-1 flex flex-wrap gap-x-2 gap-y-0.5">
              <Link href="/terms" className="text-[10px] text-muted-foreground hover:text-primary transition-colors">الشروط</Link>
              <Link href="/legal/privacy-policy" className="text-[10px] text-muted-foreground hover:text-primary transition-colors">الخصوصية</Link>
              <Link href="/legal/cookie-policy" className="text-[10px] text-muted-foreground hover:text-primary transition-colors">ملفات الارتباط</Link>
              <Link href="/legal/copyright-policy" className="text-[10px] text-muted-foreground hover:text-primary transition-colors">حقوق النشر</Link>
            </div>
          </nav>
        )}
      </CardContent>
    </Card>
  );
}
