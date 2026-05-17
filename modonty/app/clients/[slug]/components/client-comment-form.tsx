"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/providers/SessionContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import {
  postClientCommentAction,
  type ClientCommentFormState,
} from "../actions/client-comment-actions";

interface ClientCommentFormProps {
  clientSlug: string;
}

const initialState: ClientCommentFormState = { ok: false, message: "" };

export function ClientCommentForm({ clientSlug }: ClientCommentFormProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [content, setContent] = useState("");
  const [state, formAction, pending] = useActionState(
    postClientCommentAction,
    initialState,
  );

  useEffect(() => {
    if (state.ok && state.attempt) {
      setContent("");
      formRef.current?.reset();
    }
  }, [state.ok, state.attempt]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-3 rounded-lg border bg-muted/20 p-4"
    >
      <input type="hidden" name="clientSlug" value={clientSlug} />

      {status === "authenticated" ? (
        <p className="text-xs text-muted-foreground">
          تعلق بصفتك:{" "}
          <span className="font-medium text-foreground">
            {session?.user?.name ?? session?.user?.email}
          </span>
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          يجب{" "}
          <button
            type="button"
            onClick={() => router.push("/users/login")}
            className="text-primary underline"
          >
            تسجيل الدخول
          </button>{" "}
          لإضافة تعليق.
        </p>
      )}

      <Textarea
        name="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="شارك رأيك في هذه الشركة..."
        rows={3}
        disabled={pending}
        maxLength={2000}
        className="resize-none"
      />

      {state.message && (
        <p
          aria-live="polite"
          className={
            state.ok
              ? "text-xs text-emerald-600"
              : "text-xs text-destructive"
          }
        >
          {state.message}
        </p>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          disabled={pending || content.trim().length < 3}
          className="gap-2"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          إرسال التعليق
        </Button>
      </div>
    </form>
  );
}
