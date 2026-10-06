"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { IconLoading, IconSend, IconSuccess } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { submitClientPageQuestion } from "@/app/(partner)/clients/[slug]/actions/client-faq-actions";

interface ClientFaqQuestionFormProps {
  slug: string;
}

// The server action gates auth and returns this exact message when not logged in.
const LOGIN_REQUIRED_ERROR = "يجب تسجيل الدخول لطرح سؤال";

/**
 * Compact «اطرح سؤالاً» island for the client-page FAQ section. Mirrors the
 * proven ask-client-dialog UX: useTransition pending state, success reset, and a
 * login link when the server reports auth is required. Visitor input is optional
 * (name) / required (email + question); the server re-validates everything.
 */
export function ClientFaqQuestionForm({ slug }: ClientFaqQuestionFormProps) {
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const registerHref = `/users/register?callbackUrl=${encodeURIComponent(pathname)}`;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const needsLogin = error === LOGIN_REQUIRED_ERROR;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await submitClientPageQuestion({ name, email, question }, slug);
      if (!result.success) {
        setError(result.error ?? "تعذّر إرسال سؤالك، حاول مرة أخرى.");
        return;
      }
      setName("");
      setEmail("");
      setQuestion("");
      setDone(true);
    });
  };

  if (done) {
    return (
      <div role="status" className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-bold text-success">
        <IconSuccess className="h-4 w-4 shrink-0" aria-hidden />
        تم إرسال سؤالك — سنجيبك قريبًا.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3"
    >
      {/* Restyled to the partner-site sections (4 Oct 2026): it was the old card's 12.5px text
          and 36px fields, under the new 14px / 44px sections. Labels for screen readers. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="sr-only" htmlFor="faq-ask-name">الاسم (اختياري)</label>
        <Input
          id="faq-ask-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="الاسم (اختياري)"
          className="h-11 rounded-full px-5 text-sm"
          disabled={isPending}
        />
        <label className="sr-only" htmlFor="faq-ask-email">البريد الإلكتروني</label>
        <Input
          id="faq-ask-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="البريد الإلكتروني"
          className="h-11 rounded-full px-5 text-sm"
          disabled={isPending}
          required
        />
      </div>

      <label className="sr-only" htmlFor="faq-ask-question">سؤالك</label>
      <Textarea
        id="faq-ask-question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="اكتب سؤالك هنا..."
        rows={3}
        className="resize-none rounded-lg px-5 py-3 text-sm"
        disabled={isPending}
        required
      />

      {error && (
        <div role="alert" className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <p>{error}</p>
          {needsLogin && (
            <Button asChild size="sm" className="mt-2">
              <Link href={registerHref}>سجّل مجاناً</Link>
            </Button>
          )}
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="inline-flex h-11 items-center gap-2 self-start rounded-full px-6 font-bold"
      >
        {isPending ? (
          <IconLoading className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <IconSend className="h-4 w-4" aria-hidden />
        )}
        {isPending ? "جارٍ الإرسال..." : "إرسال السؤال"}
      </Button>
    </form>
  );
}
