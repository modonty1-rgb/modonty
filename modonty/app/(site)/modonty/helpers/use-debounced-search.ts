"use client";

import { useEffect, useState } from "react";

type SearchState<T> = { kind: "idle" } | { kind: "loading" } | { kind: "error" } | { kind: "done"; data: T };

const DEBOUNCE_MS = 300;
const MIN_LENGTH = 2;

/**
 * A sector page's search box against its own endpoint (`?q=`): waits for the reader to pause, drops
 * an answer that arrives after a newer query, and stays idle under two letters. The sector pages
 * search on the server so their thousands of rows never ship to the phone.
 */
export function useDebouncedSearch<T>(endpoint: string, query: string): SearchState<T> {
  const [state, setState] = useState<SearchState<T>>({ kind: "idle" });

  useEffect(() => {
    const q = query.trim();
    if (q.length < MIN_LENGTH) {
      setState({ kind: "idle" });
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setState({ kind: "loading" });
      try {
        const res = await fetch(`${endpoint}?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        if (!res.ok) throw new Error(String(res.status));
        setState({ kind: "done", data: (await res.json()) as T });
      } catch {
        if (!controller.signal.aborted) setState({ kind: "error" });
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [endpoint, query]);

  return state;
}
