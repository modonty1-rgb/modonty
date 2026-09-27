import type { TopicAlert } from "./read-alert-preferences";

/**
 * A reader's consent to one topic, as registration and the page's «نبّهني» both record it. The
 * reader only agrees; which channel we send on is ours to decide (Khalid, 27 Sep 2026: «التنبيه احنا
 * اللي بنرسله») — email is the one every account has. WhatsApp is added from the profile.
 */
export function startTopicAlert() {
  // `satisfies`, not a return annotation: the interface has no index signature, so a value typed
  // as `TopicAlert` would not be accepted by Prisma's JSON input type.
  return { channels: ["email"], consentAt: new Date().toISOString() } satisfies TopicAlert;
}
