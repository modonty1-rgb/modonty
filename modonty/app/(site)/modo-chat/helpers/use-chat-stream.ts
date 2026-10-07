import { useCallback, type Dispatch, type RefObject, type SetStateAction } from "react";

import type { SuggestedPartner } from "../components/partner-cards/PartnerCards";
import type { WebSource } from "../data/save-chatbot-message";
import type { Msg, Redirect, SuggestedArticle } from "./chat-types";

/**
 * Silence budget, not a total budget. A stream still delivering tokens is healthy however long
 * it runs — measured live on 2026-08-18, a grounded answer took 45s and a flat total timeout
 * cut it off mid-sentence after the visitor had already read three paragraphs. The timer is
 * therefore reset on every chunk, and only a genuinely stalled upstream trips it.
 */
const STALL_TIMEOUT_MS = 25_000;

/**
 * `doChat`: one question to the server and its answer back into the transcript — the JSON
 * branches (out of scope · redirect · no sources · plain text) and the NDJSON stream.
 */
export function useChatStream({
  messages,
  setMessages,
  setError,
  setRedirects,
  setSuggestedArticle,
  setLoading,
  setTrialEnded,
  lastAttemptRef,
  abortRef,
  conversationIdRef,
  inputRef,
}: {
  messages: Msg[];
  setMessages: Dispatch<SetStateAction<Msg[]>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setRedirects: Dispatch<SetStateAction<Redirect[] | null>>;
  setSuggestedArticle: Dispatch<SetStateAction<SuggestedArticle | null>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setTrialEnded: Dispatch<SetStateAction<boolean>>;
  lastAttemptRef: RefObject<{ text: string; industrySlug: string | null; artSlug: string | null } | null>;
  abortRef: RefObject<AbortController | null>;
  conversationIdRef: RefObject<string | null>;
  inputRef: RefObject<HTMLTextAreaElement | null>;
}) {
  const doChat = useCallback(
    async (text: string, industrySlug: string | null, artSlug: string | null) => {
      // Remembered so «إعادة المحاولة» can re-send it — the composer was already cleared.
      lastAttemptRef.current = { text, industrySlug, artSlug };
      setError(null);
      setRedirects(null);
      setSuggestedArticle(null);
      setLoading(true);

      /**
       * `submit` calls this before its own `setMessages` has landed, so the question is NOT yet
       * in `messages` and must be appended. `confirmCategorySuggestion` calls it after the
       * question was already pushed — appending again sent the model two identical user turns.
       * Dropping a trailing duplicate covers both callers.
       */
      const prior = messages.filter((m) => m.content.trim().length > 0);
      const last = prior[prior.length - 1];
      const withoutDuplicate =
        last?.role === "user" && last.content === text ? prior.slice(0, -1) : prior;
      const history = [...withoutDuplicate, { role: "user" as const, content: text }];
      const isIndustry = !artSlug && !!industrySlug;
      const chatUrl = isIndustry ? "/modo-chat/api/chat" : `/modo-chat/api/article/${artSlug}`;
      const conversationId = conversationIdRef.current ?? undefined;
      const chatBody = isIndustry
        ? { messages: history, industrySlug, stream: true, conversationId }
        : { messages: history, stream: true, conversationId };

      // Without a deadline a hung upstream leaves the composer disabled and the dots
      // spinning forever, with reload as the only way out.
      const controller = new AbortController();
      abortRef.current = controller;
      let timeoutId = setTimeout(() => controller.abort(), STALL_TIMEOUT_MS);
      /** Called on every received chunk — progress means the upstream is alive. */
      const keepAlive = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => controller.abort(), STALL_TIMEOUT_MS);
      };

      try {
        const res = await fetch(chatUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(chatBody),
          signal: controller.signal,
        });

        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          if (res.status === 401 && d.needsSignIn) {
            setTrialEnded(true);
            return;
          }
          throw new Error(d.error || `HTTP ${res.status}`);
        }

        const ct = res.headers.get("content-type") ?? "";
        if (ct.includes("application/json")) {
          const d = await res.json();
          if (d.conversationId) conversationIdRef.current = d.conversationId;
          if (d.type === "outOfScope") {
            setMessages((p) => [...p, { role: "assistant", content: d.message ?? "سؤالك خارج نطاق هذا الموضوع." }]);
            return;
          }
          if (d.type === "redirect") {
            setRedirects(d.articles ?? []);
            return;
          }
          if (d.type === "noSources") {
            // Partners ride along on this branch too: a price or appointment question has no
            // answer in our content by definition, and the partner who sets it is the whole point.
            setMessages((p) => [...p, {
              role: "assistant",
              content: d.message ?? "ما لقيت جواباً أضمنه لسؤالك، وما أبغى أخمّن عليك.",
              noSources: true,
              ...(d.partners?.length && { partners: d.partners }),
            }]);
            return;
          }
          if (d.text) {
            // The partners must ride with the message. Dropping them here turned the
            // partner-first fallback — «عندي شركاء يقدرون يخدمونك» — into a promise with
            // nothing under it, in exactly the case where we have no article but 21 partners.
            setMessages((p) => [
              ...p,
              {
                role: "assistant",
                content: d.text,
                ...(d.partners?.length && { partners: d.partners as SuggestedPartner[] }),
              },
            ]);
            if (d.suggestedArticle) setSuggestedArticle(d.suggestedArticle as SuggestedArticle);
          }
          return;
        }

        // Streaming
        const reader = res.body?.getReader();
        const dec = new TextDecoder();
        let buf = "";
        let assistantText = "";
        setMessages((p) => [...p, { role: "assistant", content: "" }]);

        if (reader) {
          let lastMessageId: string | undefined;
          let lastSource: "web" | undefined;
          let lastSources: WebSource[] | undefined;
          let lastSuggestedArticle: SuggestedArticle | undefined;
          let lastPartners: SuggestedPartner[] | undefined;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            keepAlive();
            buf += dec.decode(value, { stream: true });
            const lines = buf.split("\n");
            buf = lines.pop() ?? "";
            for (const line of lines) {
              try {
                const p = JSON.parse(line);
                if (p.type === "delta" && p.text) {
                  assistantText += p.text;
                  setMessages((prev) => {
                    const n = [...prev];
                    const last = n[n.length - 1];
                    if (last?.role === "assistant") n[n.length - 1] = { ...last, content: assistantText };
                    return n;
                  });
                }
                if (p.type === "done") {
                  if (p.conversationId) conversationIdRef.current = p.conversationId;
                  if (p.messageId) lastMessageId = p.messageId;
                  if (p.source === "web") lastSource = "web";
                  if (p.sources?.length) lastSources = p.sources;
                  if (p.suggestedArticle) lastSuggestedArticle = p.suggestedArticle as SuggestedArticle;
                  if (p.partners?.length) lastPartners = p.partners as SuggestedPartner[];
                }
                if (p.type === "error") setError(p.error ?? "حدث خطأ. حاول مرة أخرى.");
              } catch {}
            }
          }

          if (lastMessageId) {
            setMessages((prev) => {
              const n = [...prev];
              const last = n[n.length - 1];
              if (last?.role === "assistant") n[n.length - 1] = { ...last, messageId: lastMessageId };
              return n;
            });
          }
          if (lastPartners?.length) {
            setMessages((prev) => {
              const n = [...prev];
              const last = n[n.length - 1];
              if (last?.role === "assistant") n[n.length - 1] = { ...last, partners: lastPartners };
              return n;
            });
          }
          if (lastSource) {
            setMessages((prev) => {
              const n = [...prev];
              const last = n[n.length - 1];
              if (last?.role === "assistant") n[n.length - 1] = { ...last, source: lastSource, sources: lastSources };
              return n;
            });
          }
          if (lastSuggestedArticle) setSuggestedArticle(lastSuggestedArticle);
        }
      } catch (err) {
        const aborted = err instanceof DOMException && err.name === "AbortError";
        setError(
          aborted
            ? "الرد تأخّر أكثر من اللازم. جرّب مرة ثانية."
            : err instanceof Error
              ? err.message
              : "صار خطأ. جرّب مرة ثانية."
        );
      } finally {
        clearTimeout(timeoutId);
        abortRef.current = null;
        // A stream that died before its first token leaves an empty assistant bubble
        // behind — drop it, or the transcript keeps a blank reply forever.
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.content === "" && !last.industrySuggestion) {
            return prev.slice(0, -1);
          }
          return prev;
        });
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [messages]
  );

  return doChat;
}
