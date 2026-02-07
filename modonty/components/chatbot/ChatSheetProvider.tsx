"use client";

import { createContext, useContext, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sparkles, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleChatbotContent } from "@/components/chatbot/ArticleChatbotContent";

function getArticleSlug(pathname: string | null): string | null {
  if (!pathname) return null;
  const m = pathname.match(/^\/articles\/([^/]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

const Ctx = createContext<{ open: boolean; setOpen: (v: boolean) => void } | null>(null);

export function useChatSheet() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useChatSheet must be used within ChatSheetProvider");
  return ctx;
}

function ChatLoginPrompt() {
  return (
    <div dir="rtl" className="flex flex-col h-full items-center justify-center p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
        <Sparkles className="h-8 w-8 text-primary" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">مدونتي الذكية بانتظارك</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-[260px]">
        سجّل دخولك للاستفادة من محادثات ذكية حول مقالاتك المفضلة
      </p>
      <Button
        onClick={() => signIn()}
        className="gap-2"
        size="lg"
      >
        <LogIn className="h-4 w-4" />
        تسجيل الدخول
      </Button>
    </div>
  );
}

export function ChatSheetProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const articleSlug = getArticleSlug(pathname);
  const { data: session, status } = useSession();

  return (
    <Ctx.Provider value={{ open, setOpen }}>
      {children}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          dir="rtl"
          className="flex flex-col gap-0 p-0 w-[80%] sm:max-w-md"
        >
          <SheetHeader className="shrink-0 flex-row items-center gap-3 border-b px-4 py-4 pr-12">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Sparkles className="h-5 w-5" />
            </div>
            <SheetTitle className="text-base">اسأل عن هذا المقال</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-hidden">
            {status === "loading" ? (
              <div className="flex h-full items-center justify-center p-8">
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
              </div>
            ) : session?.user ? (
              <ArticleChatbotContent
                articleSlug={articleSlug}
                userName={session.user.name ?? session.user.email ?? undefined}
              />
            ) : (
              <ChatLoginPrompt />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </Ctx.Provider>
  );
}
