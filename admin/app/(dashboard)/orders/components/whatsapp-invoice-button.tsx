"use client";

import { useTransition } from "react";
import { MessageCircle } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { logInvoiceWhatsappAction } from "../actions";

/**
 * Opens WhatsApp with the ready invoice message (PAY-E6). The link is built on the server;
 * the click only records that a staff member sent it (PAY-Q13: the send is a human act
 * outside the system, so the audit row is the trace). Logging never blocks the link.
 */
export function WhatsappInvoiceButton({ href, orderId }: { href: string; orderId: string }) {
  const [, startTransition] = useTransition();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonVariants({ variant: "outline" })}
      onClick={() => startTransition(async () => { try { await logInvoiceWhatsappAction(orderId); } catch { /* the message still opens; the log is best-effort */ } })}
    >
      <MessageCircle aria-hidden />
      إرسال الفاتورة واتساب
    </a>
  );
}
