"use server";

import { auth } from "@/lib/auth";
import {
  submitClientPageQuestionAs,
  type ClientQuestionFormData,
} from "@/lib/clients/submit-client-page-question-as";

export type { ClientQuestionFormData };

/** Web door: identity from the session cookie, logic in `submitClientPageQuestionAs` (shared with the mobile API). */
export async function submitClientPageQuestion(
  data: ClientQuestionFormData,
  clientSlug: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "يجب تسجيل الدخول لطرح سؤال" };
  }

  const result = await submitClientPageQuestionAs(
    { id: session.user.id, name: session.user.name ?? null, email: session.user.email ?? null },
    data,
    clientSlug
  );
  return result.success ? { success: true } : { success: false, error: result.error };
}
