"use server";

import { getOrCreateSessionId } from "@/lib/analytics/conversion-tracking";
import { saveContactMessage, type ContactMessageData } from "@/lib/contact/save-contact-message";

/**
 * Web door kept for its existing callers: the conversion is keyed on the visit cookie, the logic
 * lives in `saveContactMessage` (shared with the mobile API). `/contact/api` now goes through
 * `acceptContactMessage`, which calls the same function.
 */
export async function submitContactMessage(data: ContactMessageData) {
  return saveContactMessage(data, getOrCreateSessionId);
}
