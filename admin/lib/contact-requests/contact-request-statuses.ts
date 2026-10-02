/**
 * The four states a reader's contact request (`BookingRequest.status`) moves through.
 * The SAME values the client edits from the console (`console/.../booking-actions.ts`) —
 * one field, two screens; the admin only labels them for the sales rep.
 *
 * Khalid (2 Oct 2026, plan item ج٨): 50 of 52 requests were still «new», so nobody could say
 * which article brought the client a customer. The rep follows up with the client and moves it.
 */
export const CONTACT_REQUEST_STATUSES = ["new", "contacted", "done", "archived"] as const;

export type ContactRequestStatus = (typeof CONTACT_REQUEST_STATUSES)[number];

export const CONTACT_REQUEST_STATUS_LABEL: Record<ContactRequestStatus, string> = {
  new: "جديد",
  contacted: "تواصلوا معه",
  done: "صار زبون",
  archived: "ما صار زبون",
};
