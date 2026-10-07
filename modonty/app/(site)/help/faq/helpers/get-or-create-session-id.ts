"use server";

import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "faq_session_id";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Get or create a session ID for anonymous user tracking
 * Uses cookies to persist session across requests
 */
export async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    // Generate a unique session ID
    sessionId = `faq-session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    // Set cookie with 1 year expiry
    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
      maxAge: SESSION_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  return sessionId;
}
