"use server";

import { auth } from "@/lib/auth";
import { postClientReviewAs } from "@/lib/clients/post-client-review-as";

export interface ClientReviewFormState {
  ok: boolean;
  message: string;
  /** Increments on every submit so the client can react to repeat successes/errors */
  attempt?: number;
}

/** Web door: identity from the session cookie, logic in `postClientReviewAs` (shared with the mobile API). */
export async function postClientReviewAction(
  prevState: ClientReviewFormState,
  formData: FormData,
): Promise<ClientReviewFormState> {
  const attempt = (prevState.attempt ?? 0) + 1;

  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول لإضافة تقييم.", attempt };
  }

  const rawSlug = formData.get("clientSlug");
  if (typeof rawSlug !== "string" || !rawSlug) {
    return { ok: false, message: "طلب غير صالح.", attempt };
  }

  const result = await postClientReviewAs(session.user.id, decodeURIComponent(rawSlug), {
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });
  return { ok: result.ok, message: result.message, attempt };
}
