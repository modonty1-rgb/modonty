"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trackCtaClick } from "@/lib/analytics/cta-tracking";
import type { PendingFaq } from "./ask-client-pending-dialog";

// The two dialogs load on the first tap, never with the page (plan أ١, 3 Oct 2026): the form
// brought Radix Dialog + react-hook-form + zod into every article's first load. Pointing at a
// trigger warms its chunk so the tap that follows finds it in cache.
const loadForm = () => import("./ask-client-form-dialog");
const loadPending = () => import("./ask-client-pending-dialog");
const AskClientFormDialog = dynamic(() => loadForm().then((m) => ({ default: m.AskClientFormDialog })), { ssr: false });
const AskClientPendingDialog = dynamic(() => loadPending().then((m) => ({ default: m.AskClientPendingDialog })), { ssr: false });

interface AskClientDialogProps {
  articleId: string;
  clientId: string;
  clientName?: string;
  articleTitle?: string;
  user: { name: string | null; email: string | null } | null;
  pendingFaqs?: PendingFaq[];
  /** When true, render content only (no Card) for embedding inside another card */
  embedInCard?: boolean;
  /** Override the trigger button className (e.g. compact size for the mobile bar) */
  triggerClassName?: string;
  /** Override the trigger button label (e.g. short "اسأل العميل" for the mobile bar) */
  triggerLabel?: string;
  /** When true, render ONLY the dialog trigger button — no Card or pending-FAQ wrapper */
  triggerOnly?: boolean;
}

export function AskClientDialog({
  articleId,
  clientId,
  clientName,
  articleTitle,
  user,
  pendingFaqs = [],
  embedInCard = false,
  triggerClassName,
  triggerLabel,
  triggerOnly = false,
}: AskClientDialogProps) {
  const [open, setOpen] = useState(false);
  const [formMounted, setFormMounted] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);
  const [pendingMounted, setPendingMounted] = useState(false);

  const isLoggedIn = Boolean(user?.email);

  const openForm = () => {
    trackCtaClick({
      type: "FORM",
      label: clientName ? `تواصل مع ${clientName}` : "اسأل العميل",
      targetUrl: "#",
      articleId,
      clientId,
    });
    setFormMounted(true);
    setOpen(true);
  };

  const mainDialog = (
    <>
      <Button
        variant="outline"
        className={cn("w-full h-auto py-2 whitespace-normal justify-center bg-amber-500 border-amber-500 text-black font-semibold hover:bg-amber-400 hover:border-amber-400 shadow-sm", triggerClassName)}
        type="button"
        aria-haspopup="dialog"
        onPointerEnter={() => void loadForm()}
        onFocus={() => void loadForm()}
        onClick={openForm}
      >
        {/* One default for every surface (Khalid, 19 Aug). It used to build
            «اسأل ⟨الاسم⟩ مباشرةً» here, and only the partner card overrode it — so the same
            button read differently in Modo's chat than under an article. An invitation with
            no pronoun also fits a doctor, a company and a shop alike. */}
        {triggerLabel ?? "عندك سؤال؟"}
      </Button>
      {formMounted && (
        <AskClientFormDialog
          open={open}
          onOpenChange={setOpen}
          articleId={articleId}
          clientName={clientName}
          articleTitle={articleTitle}
          user={user}
        />
      )}
    </>
  );

  const content = (
    <>
      {isLoggedIn && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-muted-foreground hover:text-foreground"
            type="button"
            aria-haspopup="dialog"
            onPointerEnter={() => void loadPending()}
            onClick={() => {
              setPendingMounted(true);
              setPendingOpen(true);
            }}
          >
            أسئلتك المعلقة{pendingFaqs.length > 0 ? ` (${pendingFaqs.length})` : ""}
          </Button>
          {pendingMounted && <AskClientPendingDialog open={pendingOpen} onOpenChange={setPendingOpen} pendingFaqs={pendingFaqs} />}
        </>
      )}
      {mainDialog}
    </>
  );

  if (triggerOnly) return mainDialog;

  if (embedInCard) {
    return (
      <div className="flex flex-col gap-4 border-t border-border pt-4 mt-2">
        {content}
      </div>
    );
  }

  return (
    <Card className="min-w-0">
      <CardContent className="p-4 flex flex-col gap-4">
        {content}
      </CardContent>
    </Card>
  );
}
