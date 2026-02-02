"use server";

async function generateCloudinarySignature(
  params: Record<string, string>,
  apiSecret: string
): Promise<string> {
  // Sort parameters alphabetically and build signature string (plain, not URL-encoded)
  const sortedKeys = Object.keys(params).sort();
  const paramString = sortedKeys
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  const signatureString = paramString + apiSecret;

  // Generate signature (SHA-1 hash of sorted params + secret)
  const crypto = await import("crypto");
  return crypto
    .createHash("sha1")
    .update(signatureString)
    .digest("hex");
}

function buildCloudinaryUrl(
  cloudName: string,
  resourceType: string,
  publicId: string,
  format: string,
  version: string | null
): string {
  // Format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/v{version}/{public_id}.{format}
  // Note: public_id from Cloudinary doesn't include the extension, so we add it
  return version
    ? `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/v${version}/${publicId}.${format}`
    : `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${publicId}.${format}`;
}

/**
 * Rename Cloudinary asset using Admin API
 *
 * This function renames a Cloudinary asset by changing its public_id.
 * Requires Admin API credentials (CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).
 *
 * @param oldPublicId - Current public_id
 * @param newPublicId - New public_id
 * @param resourceType - Resource type (default: "image")
 * @returns Result with success status and new public_id/URL
 */
export async function renameCloudinaryAsset(
  oldPublicId: string,
  newPublicId: string,
  resourceType: string = "image"
) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  let apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return {
      success: false,
      error: "Cloudinary Admin API credentials are missing. Please check your environment variables (CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).",
    };
  }

  // Trim whitespace from API secret (common issue with .env files)
  apiSecret = apiSecret.trim();

  // Verify API secret is not empty and has reasonable length (Cloudinary secrets are typically 20+ chars)
  if (!apiSecret || apiSecret.length < 10) {
    return {
      success: false,
      error: `CLOUDINARY_API_SECRET appears to be invalid (length: ${apiSecret?.length || 0}). Please verify your API secret in the Cloudinary dashboard (Settings → Security).`,
    };
  }

  try {
    // Cloudinary Admin API rename endpoint
    // Documentation: https://cloudinary.com/documentation/admin_api#rename_resources
    const timestamp = Math.round(Date.now() / 1000);

    // Cloudinary Admin API signature generation
    // According to Cloudinary docs, signature should include: from_public_id, timestamp, to_public_id
    // Parameters must be sorted alphabetically (NOT URL-encoded in signature string)
    // Note: resource_type is NOT included in the signature for rename endpoint
    const signatureParams: Record<string, string> = {
      from_public_id: oldPublicId,
      timestamp: timestamp.toString(),
      to_public_id: newPublicId,
    };

    const signature = await generateCloudinarySignature(signatureParams, apiSecret);

    // Build final params for the request (api_key and signature are added after)
    const params = new URLSearchParams({
      from_public_id: oldPublicId,
      to_public_id: newPublicId,
      resource_type: resourceType,
      timestamp: timestamp.toString(),
      api_key: apiKey,
      signature: signature,
    });

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/rename`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: { message: errorText || response.statusText } };
      }
      console.error("Cloudinary rename API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        oldPublicId,
        newPublicId,
      });
      return {
        success: false,
        error: errorData.error?.message || `Failed to rename asset: ${response.statusText}`,
      };
    }

    const result = await response.json();
    console.log("Cloudinary rename success:", {
      oldPublicId,
      newPublicId: result.public_id,
      result,
    });

    // Extract format from result or from old public_id
    // Cloudinary rename API returns the resource with format
    const format = result.format || oldPublicId.split('.').pop() || "png";
    // Use version from result, or extract from old URL if available
    const version = result.version || null;

    // Construct new URL with version and format
    const newUrl = buildCloudinaryUrl(cloudName, resourceType, result.public_id, format, version);

    return {
      success: true,
      newPublicId: result.public_id,
      newUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred while renaming asset",
    };
  }
}
