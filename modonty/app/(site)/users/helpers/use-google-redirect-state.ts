"use client";

import { useCallback, useEffect, useState } from "react";

/** Long enough for a slow phone to reach Google; short enough that nobody rage-clicks a dead button. */
const STUCK_AFTER_MS = 15_000;

/**
 * The «redirecting to Google» state of a sign-in button — shared by /users/login and
 * /users/register so the button can never stay locked.
 *
 * Seen in Clarity (24 Sep 2026, plan item ب١): after pressing Google, both buttons sat on
 * «جاري تسجيل الدخول...» for 70+ seconds and the visitor rage-clicked a disabled button. Two
 * ways it got stuck, two fixes:
 *  - Back from Google: the browser restores the page from bfcache with the old React state.
 *    web.dev: «always update the page after a `pageshow` event if `event.persisted` is true».
 *  - The redirect never starts (slow network, blocked popup): after STUCK_AFTER_MS the button
 *    unlocks and the form says so.
 * It locks the Google button only — the email form stays usable while Google is loading.
 */
export function useGoogleRedirectState() {
  const [pending, setPending] = useState(false);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setPending(false);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => {
      setPending(false);
      setStuck(true);
    }, STUCK_AFTER_MS);
    return () => clearTimeout(timer);
  }, [pending]);

  const start = useCallback(() => {
    setStuck(false);
    setPending(true);
  }, []);
  const stop = useCallback(() => setPending(false), []);

  return { pending, stuck, start, stop };
}
