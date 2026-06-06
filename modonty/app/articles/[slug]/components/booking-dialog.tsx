"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IconCalendar } from "@/lib/icons";
import { trackCtaClick } from "@/lib/cta-tracking";

import { BookingForm } from "./booking-form";
import type { BookingSource } from "../actions/booking-actions";

interface BookingDialogProps {
  clientId: string;
  articleId?: string | null;
  clientName: string;
  source: BookingSource;
  user: { name: string | null; email: string | null } | null;
  /** Button text override (defaults to «احجز الآن»). */
  label?: string | null;
}

/** FORM-mode CTA for the desktop client card: a button that opens a booking dialog. */
export function BookingDialog({
  clientId,
  articleId,
  clientName,
  source,
  user,
  label,
}: BookingDialogProps) {
  const [open, setOpen] = useState(false);
  const btnLabel = label?.trim() || "احجز الآن";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          trackCtaClick({
            type: "FORM",
            label: btnLabel,
            targetUrl: "#",
            articleId: articleId ?? undefined,
            clientId,
          });
        }
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <IconCalendar className="h-4 w-4" />
          {btnLabel}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[88dvh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {btnLabel} — {clientName}
          </DialogTitle>
          <DialogDescription>عبّي بياناتك ونوصل طلبك للشركة مباشرة.</DialogDescription>
        </DialogHeader>
        <BookingForm
          clientId={clientId}
          articleId={articleId}
          source={source}
          clientName={clientName}
          user={user}
          submitLabel="تأكيد الحجز"
        />
      </DialogContent>
    </Dialog>
  );
}
