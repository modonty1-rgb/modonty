"use server";

// Track if Cloudinary SDK is already configured to avoid re-configuring
let cloudinaryConfigured = false;

/**
 * Get Cloudinary account usage information including storage quota
 * Uses Cloudinary SDK for proper authentication
 */
export async function getCloudinaryUsage(): Promise<{
  success: boolean;
  usedStorage?: number; // bytes
  totalStorage?: number; // bytes
  remainingStorage?: number; // bytes
  error?: string;
  details?: {
    plan?: string;
    credits?: {
      usage?: number;
      limit?: number;
      used_percent?: number;
    };
    storage?: {
      usage?: number;
      limit?: number;
      credits_usage?: number;
    };
    bandwidth?: {
      usage?: number;
      credits_usage?: number;
    };
    resources?: number;
  };
}> {
  const debugMode = process.env.CLOUDINARY_DEBUG === "true" || process.env.NODE_ENV === "development";

  // Try to extract from CLOUDINARY_URL first, then fallback to individual env vars
  let cloudName: string | undefined;
  let apiKey: string | undefined;
  let apiSecret: string | undefined;

  // Parse CLOUDINARY_URL if available: cloudinary://api_key:api_secret@cloud_name
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (cloudinaryUrl && cloudinaryUrl.startsWith('cloudinary://')) {
    try {
      // Manual parsing to handle special characters in secret
      // Format: cloudinary://api_key:api_secret@cloud_name
      const match = cloudinaryUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
      if (match) {
        apiKey = match[1];
        apiSecret = match[2];
        cloudName = match[3];
      }
    } catch (e) {
      // If parsing fails, fall back to individual env vars
      if (debugMode) {
        console.error("Failed to parse CLOUDINARY_URL:", e);
      }
    }
  }

  // Fallback to individual environment variables
  cloudName = cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  apiKey = apiKey || process.env.CLOUDINARY_API_KEY;
  apiSecret = apiSecret || process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    const error = "Cloudinary Admin API credentials are missing. Please check your environment variables (CLOUDINARY_URL or individual CLOUDINARY_* vars).";
    if (debugMode) {
      console.error("Cloudinary credentials missing:", {
        hasCloudName: !!cloudName,
        hasApiKey: !!apiKey,
        hasApiSecret: !!apiSecret,
      });
    }
    return {
      success: false,
      error,
    };
  }

  // Trim and verify credentials are not empty
  apiKey = apiKey.trim();
  apiSecret = apiSecret.trim();
  cloudName = cloudName.trim();

  if (!apiKey || !apiSecret || !cloudName) {
    const error = "Cloudinary Admin API credentials are empty after trimming.";
    if (debugMode) {
      console.error("Cloudinary credentials empty after trimming");
    }
    return {
      success: false,
      error,
    };
  }

  try {
    // Use Cloudinary SDK for proper authentication
    const cloudinary = (await import("cloudinary")).v2;
    
    // Only configure if not already configured
    // Note: cloudinary.config() can be called multiple times safely, but we track it to avoid unnecessary calls
    if (!cloudinaryConfigured) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      cloudinaryConfigured = true;
      
      if (debugMode) {
        console.log("Cloudinary SDK configured successfully");
      }
    } else {
      // Re-configure if credentials might have changed (safe to call multiple times)
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      
      if (debugMode) {
        console.log("Cloudinary SDK re-configured with current credentials");
      }
    }

    // Use SDK's usage method which handles authentication automatically
    const result = await cloudinary.api.usage();

    if (debugMode) {
      console.log("Cloudinary API usage response:", {
        plan: result.plan,
        credits: result.credits,
        credits_limit: result.credits_limit,
        storage_type: typeof result.storage,
        storage: result.storage,
        storage_limit: result.storage_limit,
        bandwidth: result.bandwidth,
        resources: result.resources,
      });
    }

    // Cloudinary returns:
    // - plan: plan name
    // - credits: credits used
    // - credits_limit: credits limit
    // - storage: { usage: bytes, limit: bytes } OR storage: bytes (legacy format)
    // - bandwidth: bandwidth used in bytes
    // - resources: number of resources
    // - derived_resources: number of derived resources
    
    // Handle multiple response formats
    let usedStorage = 0;
    let totalStorage: number | null = null;
    
    if (result.storage && typeof result.storage === 'object' && 'usage' in result.storage) {
      // New format: { storage: { usage: X, limit: Y } }
      usedStorage = result.storage.usage || 0;
      totalStorage = result.storage.limit || null;
    } else if (typeof result.storage === 'number') {
      // Legacy format: { storage: X, storage_limit: Y }
      usedStorage = result.storage || 0;
      totalStorage = result.storage_limit || null;
    } else if (result.storage && typeof result.storage === 'object') {
      // Alternative format: check for different property names
      const storageObj = result.storage as any;
      usedStorage = storageObj.used || storageObj.usage || 0;
      totalStorage = storageObj.limit || storageObj.total || null;
    }

    // For Free plan, storage_limit might not be provided (unlimited or credit-based)
    // Check if storage_limit exists at root level as well
    if (totalStorage === null && result.storage_limit) {
      totalStorage = result.storage_limit;
    }

    // If no storage data found, log warning
    if (usedStorage === 0 && totalStorage === null && debugMode) {
      console.warn("Cloudinary usage response did not contain expected storage format:", result);
    }

    // For Free plan without storage limit, we can still show used storage
    // remainingStorage will be undefined if no limit is set
    const remaining = totalStorage ? totalStorage - usedStorage : undefined;

    if (debugMode) {
      console.log("Parsed Cloudinary storage:", {
        usedStorage,
        totalStorage,
        remainingStorage: remaining,
      });
    }

    // Extract detailed information for hover card
    const details = {
      plan: result.plan,
      credits: result.credits && typeof result.credits === 'object' 
        ? {
            usage: result.credits.usage,
            limit: result.credits.limit,
            used_percent: result.credits.used_percent,
          }
        : undefined,
      storage: result.storage && typeof result.storage === 'object'
        ? {
            usage: usedStorage,
            limit: totalStorage || undefined,
            credits_usage: (result.storage as any).credits_usage,
          }
        : undefined,
      bandwidth: result.bandwidth && typeof result.bandwidth === 'object'
        ? {
            usage: (result.bandwidth as any).usage,
            credits_usage: (result.bandwidth as any).credits_usage,
          }
        : undefined,
      resources: result.resources,
    };

    return {
      success: true,
      usedStorage,
      totalStorage: totalStorage || undefined,
      remainingStorage: remaining,
      details,
    };
  } catch (error: any) {
    // Log comprehensive error details for debugging
    const errorDetails = {
      message: error?.message,
      http_code: error?.http_code,
      name: error?.name,
      stack: error?.stack,
      response: error?.response,
      error: error?.error,
    };

    if (debugMode) {
      console.error("Cloudinary usage API error:", errorDetails);
    }
    
    // Extract meaningful error message
    let errorMessage = "Unknown error occurred while fetching Cloudinary usage.";
    if (error?.message) {
      errorMessage = error.message;
    } else if (error?.http_code === 401) {
      errorMessage = "Invalid Cloudinary credentials. Please verify your API_KEY and API_SECRET in Cloudinary Dashboard → Settings → Security.";
    } else if (error?.http_code) {
      errorMessage = `Cloudinary API error (HTTP ${error.http_code}): ${error.message || "Please check your credentials and plan limits."}`;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}
