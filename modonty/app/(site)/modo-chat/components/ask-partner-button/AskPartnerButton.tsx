"use client";

import { useState, useTransition } from "react";

import { askPartnerFromChat } from "@/app/(site)/modo-chat/data/ask-partner-from-chat";
import { IconCheck, IconSend } from "@/lib/icons";

interface AskPartnerButtonProps {
  partnerSlug: string;
  partnerName: string;
  /** The visitor's own question, sent verbatim — retyping it is friction nobody accepts. */
  question: string;
}

/**
 * Hands the visitor's question to the partner, and says so.
 *
 * Modo's honest "ما لقيت جواب" was a dead end: the visitor asked a real question, we have the
 * person who can answer it, and nothing connected the two. The server action existed since
 * 2026-08-18 with ZERO callers — written, never reachable — which is why this button exists.
 *
 * Anonymous visitors are refused by the action itself (the answer travels by email, so a name and
 * an address are required); the refusal is shown as-is rather than hidden behind a disabled button.
 */
export function AskPartnerButton({ partnerSlug, partnerName, question }: AskPartnerButtonProps) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  if (result?.ok) {
    return (
      <p className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
        <IconCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {result.text}
      </p>
    );
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await askPartnerFromChat({ partnerSlug, question });
            setResult(
              res.success
                ? { ok: true, text: "سؤالك وصله — والرد يجيك على بريدك." }
                : { ok: false, text: res.error ?? "ما قدرنا نوصّل سؤالك الآن." }
            );
          })
        }
        className="inline-flex items-center gap-1 text-sm font-medium text-link transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        <IconSend className="h-4 w-4 shrink-0" aria-hidden />
        {pending ? "نوصّل سؤالك…" : `اسأل ${partnerName} مباشرة`}
      </button>
      {result && !result.ok && (
        <span className="text-xs text-destructive">{result.text}</span>
      )}
    </span>
  );
}
