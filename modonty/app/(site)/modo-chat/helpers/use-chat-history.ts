import { useEffect, useState } from "react";

import type { WebSource } from "../data/save-chatbot-message";

export type HistoryItem = {
  id: string;
  conversationId: string | null;
  userQuery: string;
  assistantResponse: string;
  scopeType: string;
  scopeLabel: string | null;
  articleSlug: string | null;
  categorySlug: string | null;
  industrySlug: string | null;
  outcome: string;
  source?: string | null;
  webSources?: WebSource[] | null;
  createdAt: string;
};

/** The signed-in visitor's past turns, loaded once when the history tab first opens. */
export function useChatHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/modo-chat/api/history")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.messages) {
          setItems(data.messages);
        } else {
          setError(data.error ?? "حدث خطأ");
        }
      })
      .catch(() => setError("حدث خطأ"))
      .finally(() => setLoading(false));
  }, []);

  return { items, loading, error };
}
