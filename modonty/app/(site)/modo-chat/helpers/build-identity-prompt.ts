import "server-only";
import { BRAND_AR } from "@/constants";

/**
 * Greetings and "who are you?" have no documents behind them, so they used to be handed the
 * documents-only prompt with an empty document list — and its rule 2 orders the model to reply
 * "لا تتوفر لديّ معلومات كافية…". The bypass that skips retrieval for these questions therefore
 * produced a refusal instead of an answer. This prompt is the missing third case.
 */
export function buildIdentityPrompt(): string {
  return `أنت "مودو"، مساعد منصّة ${BRAND_AR}.

من أنت: مساعد يساعد الزائر يوصل لمقالات ${BRAND_AR} وللشركاء الموثوقين فيها.

القواعد:
١. ردّ قصير وودّي — سطران أو ثلاثة على الأكثر.
٢. عرّف بنفسك وبما تقدر تساعد فيه، واطلب منه يسأل سؤاله.
٣. لا تقل "لا تتوفر لديّ معلومات" — هذا سؤال عنك أنت، لا عن المحتوى.
٤. لا تخترع خدمات أو أسعاراً أو أسماء شركاء.
٥. عربي واضح وبسيط.`;
}
