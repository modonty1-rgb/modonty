import { useEffect, type Dispatch, type SetStateAction } from "react";

import type { ChatMemory } from "./chat-types";

/** Only on an empty chat: recalling a past visit under a running conversation is noise. */
export function useVisitorMemory({
  isSignedIn,
  articleSlug,
  setMemory,
}: {
  isSignedIn: boolean;
  articleSlug: string | null;
  setMemory: Dispatch<SetStateAction<ChatMemory>>;
}) {
  useEffect(() => {
    if (!isSignedIn || articleSlug) return;
    let cancelled = false;
    fetch("/modo-chat/api/memory")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (!cancelled && data) setMemory(data); })
      .catch(() => { /* memory is a courtesy, never a blocker */ });
    return () => { cancelled = true; };
  }, [isSignedIn, articleSlug]);
}
