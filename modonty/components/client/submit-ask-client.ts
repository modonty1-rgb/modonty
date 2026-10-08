"use server";

import { auth } from "@/lib/auth";
import { submitAskClientAs } from "@/lib/articles/submit-ask-client-as";
import type { AskClientFormData } from "./ask-client-schema";

/**
 * A signed-in reader asks the article's client a question — lands PENDING in their console inbox.
 * Web door: identity from the session cookie, logic in `submitAskClientAs` (shared with the mobile API).
 */
export async function submitAskClient(
  data: AskClientFormData,
  articleId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "يجب تسجيل الدخول لطرح سؤال" };
  }

  const result = await submitAskClientAs(
    { id: session.user.id, name: session.user.name ?? null, email: session.user.email ?? null },
    data,
    articleId
  );
  return result.success ? { success: true } : { success: false, error: result.error };
}
