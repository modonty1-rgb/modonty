import { useEffect, type Dispatch, type RefObject, type SetStateAction } from "react";

import type { Msg, ResumedTurn } from "./chat-types";

/**
 * Rebuild the last conversation after a reload. Only when the visitor arrived with no
 * article and no draft — those mean they came to start something specific, not to resume.
 */
export function useResumeConversation({
  startFresh,
  isSignedIn,
  resumeConversationId,
  articleSlug,
  initialInput,
  conversationIdRef,
  setMessages,
}: {
  startFresh: boolean;
  isSignedIn: boolean;
  resumeConversationId: string | null;
  articleSlug: string | null;
  initialInput: string;
  conversationIdRef: RefObject<string | null>;
  setMessages: Dispatch<SetStateAction<Msg[]>>;
}) {
  useEffect(() => {
    if (startFresh || !isSignedIn) return;
    if (!resumeConversationId && (articleSlug || initialInput)) return;
    let cancelled = false;

    const url = resumeConversationId
      ? `/modo-chat/api/conversation?id=${encodeURIComponent(resumeConversationId)}`
      : "/modo-chat/api/conversation";
    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.conversationId || !data.turns?.length) return;
        conversationIdRef.current = data.conversationId;

        const restored: Msg[] = [];
        for (const turn of data.turns as ResumedTurn[]) {
          restored.push({ role: "user", content: turn.userQuery });
          if (turn.assistantResponse) {
            restored.push({
              role: "assistant",
              content: turn.assistantResponse,
              ...(turn.source === "web" && { source: "web" as const }),
              ...(turn.webSources?.length && { sources: turn.webSources }),
            });
          }
        }
        if (restored.length) setMessages(restored);
      })
      .catch(() => {
        /* resuming is a convenience — failing to resume must never block a new conversation */
      });

    return () => {
      cancelled = true;
    };
  }, [articleSlug, initialInput, resumeConversationId, startFresh, isSignedIn]);
}
