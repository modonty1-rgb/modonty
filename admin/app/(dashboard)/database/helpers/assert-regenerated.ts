/**
 * Turn a generator's `{ success, error }` answer into a thrown failure.
 *
 * The SEO generators never throw — they catch internally and report in the return value. Every
 * caller that simply awaited one therefore counted a failed rebuild as a success. This is the
 * same swallow that `SEOADM-UPDATE-SILENT` closed across the twelve write paths.
 *
 * It lives here, outside the `actions/` folder, because every file in there carries
 * `"use server"` — and an export from such a file becomes a callable server action. This is a
 * plain helper shared by the sanitizers, not an endpoint.
 */
export async function assertRegenerated(
  work: Promise<{ success: boolean; error?: string } | unknown>,
  label: string,
): Promise<void> {
  const result = (await work) as { success?: boolean; error?: string } | undefined;
  if (result && result.success === false) {
    throw new Error(`${label}: ${result.error || "سبب غير معروف"}`);
  }
}
