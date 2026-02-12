"use client";

import { UserMenu } from "@/components/auth/UserMenu";
import { ChatTriggerButton } from "@/components/chatbot/ChatTriggerButton";

export function DesktopUserAreaClient() {
  return (
    <div className="flex items-center justify-end gap-3">
      <UserMenu />
      <ChatTriggerButton variant="pill" />
    </div>
  );
}

