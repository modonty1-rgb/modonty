"use client";

import { useState, useTransition } from "react";

import { ModontyBookmarkMark } from "@/components/icons/modonty-bookmark-mark";
import { AuthPromptLazy, warmAuthPrompt } from "@/components/shared/auth-prompt/AuthPromptLazy";
import { favoriteArticle } from "@/lib/articles/favorite-article";
import { cn } from "@/lib/utils";

interface SavePostButtonProps {
  articleId: string;
  articleSlug: string;
}

/**
 * The only client code in a feed card — a save control that turns a passing reader into
 * an account (Khalid, 22 Aug: «هذا كله عشان نحاول نحتفظ بالسبسكرايبر»).
 *
 * It never asks the browser who the reader is. `useSession` would suspend, which means a
 * <Suspense> boundary around every card in the feed and the session payload in the bundle
 * for a control most readers never touch. The server action already answers the question
 * — it returns `Unauthorized` for a signed-out reader — so the tap itself is the check,
 * and `warmAuthPrompt` on pointer-down fetches the dialog chunk while that round trip is
 * in flight, so the dialog opens on the answer instead of starting a download then.
 *
 * The icon does NOT fill optimistically. Nothing here knows whether the reader is signed
 * in, so filling on tap and emptying a moment later would read as the save being rejected.
 * It fills only on a `favorited: true` answer.
 *
 * Feed cards are a static shell shared by every reader, so the button always starts empty
 * — there is no per-reader state in the HTML. Tapping an already-saved article un-saves it
 * and the icon reflects that truthfully; the article page keeps the stateful, pre-filled
 * control.
 */
export function SavePostButton({ articleId, articleSlug }: SavePostButtonProps) {
  const [saved, setSaved] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSave(event: React.MouseEvent) {
    // The whole card is one link via `after:inset-0` on the title. Without this the tap
    // opens the article instead of saving it.
    event.preventDefault();
    event.stopPropagation();
    if (pending) return;

    startTransition(async () => {
      const result = await favoriteArticle(articleId, articleSlug);
      if (result.success) {
        setSaved(Boolean(result.data?.favorited));
        return;
      }
      if (result.error === "Unauthorized") setPromptOpen(true);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleSave}
        onPointerDown={warmAuthPrompt}
        aria-label={saved ? "إزالة من المحفوظات" : "احفظ المقال"}
        aria-pressed={saved}
        disabled={pending}
        // `relative z-10` lifts it above the card-wide link overlay; 32px clears WCAG 2.2
        // SC 2.5.8 (24×24 minimum) with room to spare on a 390px screen.
        // The VISIBLE control stays 32px (the footer row's fixed height); the invisible
        // `before:` pad extends the hit area by 6px on every side → 44×44, Apple's minimum
        // tap target. The row does not grow, the thumb does not land on «التاريخ».
        className={cn(
          "relative z-10 grid size-8 shrink-0 place-items-center rounded-lg transition-colors",
          "before:absolute before:-inset-1.5 before:content-['']",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          "motion-safe:active:scale-95",
          saved ? "text-link-accent" : "text-muted-foreground hover:text-foreground",
          pending && "opacity-50",
        )}
      >
        {/* Our ribbon, not lucide's.
            The diamond is NOT the saved/unsaved switch. It was, until 22 Aug: hidden while
            unsaved, shown once saved — which meant the brand signature disappeared from
            nine cards out of ten. Khalid's rule is absolute: «الماسة دائماً أعطها لون
            الأكسنت — في الدارك مود أو في اللايت مود». So the diamond is always there and
            always accent, and the RIBBON carries the state instead: a muted outline while
            unsaved, accent-coloured and tinted once saved. An empty shape becoming a full
            one is still the signal — it is just the ribbon doing it, not the signature. */}
        <ModontyBookmarkMark
          className={cn("size-5", saved && "[&>path]:fill-[hsl(var(--accent)/0.2)]")}
          aria-hidden
        />
      </button>
      {promptOpen && <AuthPromptLazy open={promptOpen} onOpenChange={setPromptOpen} action="save" />}
    </>
  );
}
