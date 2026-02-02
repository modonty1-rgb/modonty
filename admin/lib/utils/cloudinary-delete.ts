"use server";

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
    const signature = crypto
      .createHash("sha1")
      .update(signatureString)
      .digest("hex");

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

    const result = await response.json();

    if (result.result === "ok" || result.result === "not found") {
      // "not found" is also OK - image might already be deleted
      return { success: true };
    } else {
      return {
        success: false,
        error: result.error?.message || "Failed to delete asset from Cloudinary",
      };
    }
  } catch (error) {
    console.error("Error deleting Cloudinary asset:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
