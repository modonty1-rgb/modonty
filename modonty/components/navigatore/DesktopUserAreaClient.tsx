"use client";

import { UserMenu } from "@/components/auth/UserMenu";
import { ChatTriggerButton } from "@/components/chatbot/ChatTriggerButton";
import { Button } from "@/components/ui/button";
import { trackCtaClick } from "@/lib/cta-tracking";

export function DesktopUserAreaClient() {
  return (
    <div className="flex items-center justify-end gap-3">
      <Button variant="default" size="sm" asChild className="hidden lg:flex gap-1.5 text-xs font-medium bg-accent/15 text-accent hover:bg-accent/25 border border-accent/30 transition-colors">
        <a
          href="https://www.jbrseo.com"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackCtaClick({ type: "BUTTON", label: "Header Desktop CTA — عملاء بلا إعلانات", targetUrl: "https://www.jbrseo.com" })}
        >
          عملاء بلا إعلانات
          <span aria-hidden="true">↗</span>
        </a>
      </Button>
      <UserMenu />
      <ChatTriggerButton variant="pill" />
    </div>
  );
}

