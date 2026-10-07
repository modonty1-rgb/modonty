import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { ACTION_MESSAGES } from "@/lib/mobile-api/messages-actions";
import { uploadUserAvatar } from "@/lib/users/upload-user-avatar";

// Same as the web route: Bunny upload needs the Node runtime (the default) and time.
export const maxDuration = 60;

/**
 * A10 — POST /api/mobile/v1/me/avatar · Bearer · multipart/form-data, field `file`.
 * `uploadUserAvatar` — the web avatar route's logic: ≤4 MB, JPG/PNG/WebP judged by the bytes (not
 * the declared type), stored on Bunny under `avatars/users/<userId>-<ts>`. Returns the URL only;
 * save it with `PATCH /me { image: url }`, as the web settings form does.
 * → `{ url }`
 */
export const POST = handle("me-avatar", async (request: Request) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);

  let form: FormData;
  try {
    form = await request.formData();
  } catch (error) {
    return fail("VALIDATION_ERROR", ACTION_MESSAGES.avatarMissing, error instanceof Error ? error.message : undefined);
  }

  const result = await uploadUserAvatar(reader.id, form.get("file"));
  if (!result.ok) return fail("VALIDATION_ERROR", result.error, { reason: result.reason });
  return ok({ url: result.url }, undefined, { status: 201 });
});
