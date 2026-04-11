"use client";

import { UserMenu } from "@/components/auth/UserMenu";
import { ChatTriggerButton } from "@/components/chatbot/ChatTriggerButton";
import { Button } from "@/components/ui/button";

export function DesktopUserAreaClient() {
  return (
    <div className="flex items-center justify-end gap-3">
      <Button variant="outline" size="sm" asChild className="hidden lg:flex gap-1.5 text-xs font-medium border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
        <a href="https://www.jbrseo.com" target="_blank" rel="noopener noreferrer">
          عملاء بلا إعلانات
          <span aria-hidden="true">↗</span>
        </a>
      </Button>
      <UserMenu />
      <ChatTriggerButton variant="pill" />
    </div>
  );
}

