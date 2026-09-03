"use server";

/**
 * Delete a Cloudinary asset through the Admin API.
 *
 * ONE implementation, in lib, because two different routes call it:
 * `(dashboard)/actions/delete-image.ts` and `(dashboard)/media/actions/*`.
 * There used to be a second copy at `media/actions/delete-cloudinary-asset.ts`,
 * and the two disagreed about what "deleted" means — merged here 2026-09-03:
 *
 *   • that copy checked `response.ok` and returned success for ANY 200, so a
 *     body of `{result:"error"}` was reported as a successful delete;
 *   • this one checked `result.result` but never `response.ok`, so a 4xx whose
 *     body failed to parse surfaced as an opaque error.
 *
 * Both gates are kept below: the transport must succeed AND Cloudinary must say
 * it deleted the object.
 *
 * @param publicId - Cloudinary public_id of the asset
 * @param resourceType - Resource type (default: "image")
 */
export async function deleteCloudinaryAsset(
  publicId: string,
  resourceType: string = "image"
): Promise<{
  success: boolean;
  error?: string;
}> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  let apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return {
      success: false,
      error: "Cloudinary Admin API credentials are missing.",
    };
  }

  apiSecret = apiSecret.trim();

  try {
    const timestamp = Math.round(Date.now() / 1000);

    // Cloudinary Admin API signature for destroy: `resource_type` is NOT part of
    // the signature — only public_id and timestamp are signed.
    const signatureParams: Record<string, string> = {
      public_id: publicId,
      timestamp: timestamp.toString(),
    };
    const signatureString =
      Object.keys(signatureParams)
        .sort()
        .map((key) => `${key}=${signatureParams[key]}`)
        .join("&") + apiSecret;

    const crypto = await import("crypto");
    const signature = crypto.createHash("sha1").update(signatureString).digest("hex");

    const params = new URLSearchParams({
      public_id: publicId,
      resource_type: resourceType,
      timestamp: timestamp.toString(),
      api_key: apiKey,
      signature,
    });

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      }
    );

    // Gate 1 — transport. Read the body as text first: an error page is not JSON,
    // and `.json()` on it throws away the status we needed to report.
    if (!response.ok) {
      const errorText = await response.text();
      let message = errorText || response.statusText;
      try {
        message = JSON.parse(errorText)?.error?.message ?? message;
      } catch {
        // keep the raw text
      }
      console.error("Cloudinary delete failed", {
        status: response.status,
        statusText: response.statusText,
        publicId,
        message,
      });
      return { success: false, error: message };
    }

    // Gate 2 — Cloudinary's own verdict. A 200 does not mean the object is gone;
    // the body carries `result`, and anything other than the two values below is
    // a failure that the transport check cannot see.
    const result = await response.json();
    if (result?.result === "ok" || result?.result === "not found") {
      // "not found" counts as success — the object is already absent, which is
      // the state the caller asked for.
      return { success: true };
    }

    return {
      success: false,
      error: result?.error?.message || `Cloudinary returned "${result?.result}"`,
    };
  } catch (error) {
    console.error("Error deleting Cloudinary asset:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
