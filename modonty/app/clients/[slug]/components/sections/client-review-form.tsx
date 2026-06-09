"use client";

import { useActionState, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { IconLoading, IconSend, IconSuccess } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  postClientReviewAction,
  type ClientReviewFormState,
} from "@/app/clients/[slug]/actions/client-review-actions";

interface ClientReviewFormProps {
  slug: string;
  isLoggedIn: boolean;
}

const INITIAL_STATE: ClientReviewFormState = { ok: false, message: "" };
// The server action returns this exact text when the session is missing.
const LOGIN_REQUIRED = "يجب تسجيل الدخول لإضافة تقييم.";

/**
 * «اكتب تقييمك» island for the client reviews section. Logged-out visitors are
 * routed to login on click (the action re-gates auth server-side anyway).
 * Logged-in visitors get a star picker + comment; the review lands PENDING and
 * shows once the partner approves it in the console.
 */
export function ClientReviewForm({ slug, isLoggedIn }: ClientReviewFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  // Return the visitor to the page they were on after login (not the homepage).
  const loginHref = `/users/login?callbackUrl=${encodeURIComponent(pathname)}`;
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [state, formAction, isPending] = useActionState(postClientReviewAction, INITIAL_STATE);

  // Logged-out → ask to register/login the moment they click.
  if (!isLoggedIn) {
    return (
      <Button
        type="button"
        onClick={() => router.push(loginHref)}
        className="mt-3 w-full sm:w-auto"
      >
        اكتب تقييمك
      </Button>
    );
  }

  if (state.ok) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-4 py-3 text-[12.5px] font-bold text-success">
        <IconSuccess className="h-4 w-4 shrink-0" aria-hidden />
        {state.message || "تم إرسال تقييمك. سيظهر بعد موافقة الشركة."}
      </div>
    );
  }

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)} className="mt-3 w-full sm:w-auto">
        اكتب تقييمك
      </Button>
    );
  }

  const stars = hover || rating;
  const needsLogin = !state.ok && state.message === LOGIN_REQUIRED;

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-2.5 border-t pt-4">
      <input type="hidden" name="clientSlug" value={slug} />
      <input type="hidden" name="rating" value={rating} />

      <p className="text-[12.5px] font-extrabold text-foreground">اكتب تقييمك</p>

      <div className="flex items-center gap-1" role="radiogroup" aria-label="تقييمك بالنجوم">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} من 5 نجوم`}
            aria-pressed={rating === n}
            disabled={isPending}
            className="text-[22px] leading-none transition-transform hover:scale-110"
          >
            <span className={n <= stars ? "text-star" : "text-muted-foreground/40"}>★</span>
          </button>
        ))}
      </div>

      <Textarea
        name="comment"
        rows={3}
        placeholder="شاركنا تجربتك مع هذه الشركة..."
        className="resize-none text-[13px]"
        disabled={isPending}
        required
      />

      {state.message && !state.ok && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
          <p>{state.message}</p>
          {needsLogin && (
            <Button
              type="button"
              size="sm"
              className="mt-2"
              onClick={() => router.push(loginHref)}
            >
              تسجيل الدخول
            </Button>
          )}
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending || rating === 0}
        className="inline-flex items-center gap-2 self-start"
      >
        {isPending ? (
          <IconLoading className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <IconSend className="h-4 w-4" aria-hidden />
        )}
        {isPending ? "جارٍ الإرسال..." : "إرسال التقييم"}
      </Button>
    </form>
  );
}
