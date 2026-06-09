"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";

import { IconLoading, IconSend, IconSuccess } from "@/lib/icons";
import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { submitClientPageQuestion } from "@/app/clients/[slug]/actions/client-faq-actions";

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
  const loginHref = `/users/login?callbackUrl=${encodeURIComponent(pathname)}`;
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
      <div className="mt-4 flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-4 py-3 text-[12.5px] font-bold text-success">
        <IconSuccess className="h-4 w-4 shrink-0" aria-hidden />
        تم إرسال سؤالك — سنجيبك قريبًا.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 flex flex-col gap-2.5 border-t pt-4"
    >
      <p className="text-[12.5px] font-extrabold text-foreground">
        اطرح سؤالاً
      </p>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="الاسم (اختياري)"
          className="h-9 text-[13px]"
          disabled={isPending}
        />
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="البريد الإلكتروني"
          className="h-9 text-[13px]"
          disabled={isPending}
          required
        />
      </div>

      <Textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="اكتب سؤالك هنا..."
        rows={3}
        className="resize-none text-[13px]"
        disabled={isPending}
        required
      />

      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
          <p>{error}</p>
          {needsLogin && (
            <Button asChild size="sm" className="mt-2">
              <Link href={loginHref}>تسجيل الدخول</Link>
            </Button>
          )}
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-2 self-start"
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
