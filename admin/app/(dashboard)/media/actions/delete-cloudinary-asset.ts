"use server";

async function generateDeleteSignature(
  publicId: string,
  timestamp: number,
  apiSecret: string
): Promise<string> {
  // Cloudinary Admin API signature generation for delete
  // Note: resource_type is NOT included in the signature for destroy endpoint
  // Only public_id and timestamp are used for signature
  const signatureParams: Record<string, string> = {
    public_id: publicId,
    timestamp: timestamp.toString(),
  };

  // Sort parameters alphabetically and build signature string
  const sortedKeys = Object.keys(signatureParams).sort();
  const paramString = sortedKeys
    .map((key) => `${key}=${signatureParams[key]}`)
    .join("&");
  const signatureString = paramString + apiSecret;

  // Generate signature (SHA-1 hash)
  const crypto = await import("crypto");
  return crypto
    .createHash("sha1")
    .update(signatureString)
    .digest("hex");
}

/**
 * Delete Cloudinary asset using Admin API
 *
 * @param publicId - Cloudinary public_id of the asset
 * @param resourceType - Resource type (default: "image")
 * @returns Result with success status
 */
export async function deleteCloudinaryAsset(
  publicId: string,
  resourceType: string = "image"
) {
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
    const signature = await generateDeleteSignature(publicId, timestamp, apiSecret);

    // Build params for the request
    const params = new URLSearchParams({
      public_id: publicId,
      resource_type: resourceType,
      timestamp: timestamp.toString(),
      api_key: apiKey,
      signature: signature,
    });

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`,
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
      console.error("Cloudinary delete API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        publicId,
      });
      return {
        success: false,
        error: errorData.error?.message || `Failed to delete asset: ${response.statusText}`,
      };
    }

    const result = await response.json();
    console.log("Cloudinary delete success:", { publicId, result });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred while deleting asset",
    };
  }
}
