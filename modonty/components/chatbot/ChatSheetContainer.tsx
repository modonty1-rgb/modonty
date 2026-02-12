"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useChatSheetStore } from "@/components/chatbot/chat-sheet-store";

const ChatSheet = dynamic(
  () => import("@/components/chatbot/ChatSheet").then((m) => ({ default: m.ChatSheet })),
  { ssr: false }
);

export function ChatSheetContainer() {
  const open = useChatSheetStore((s) => s.open);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  if (!mounted) return null;
  return <ChatSheet />;
}
