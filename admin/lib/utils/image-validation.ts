import { generateSEOFileName, generateCloudinaryPublicId, isValidCloudinaryPublicId, optimizeCloudinaryUrl } from "./image-seo";

/**
 * Validate image URL by checking HTTP status
 * Uses HEAD method to avoid downloading full image
 * 
 * @param url - Image URL to validate
 * @param timeout - Timeout in milliseconds (default: 10000)
 * @returns Validation result with status code
 */
export async function validateImageUrl(
  url: string,
  timeout: number = 10000
): Promise<{ valid: boolean; statusCode?: number; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    clearTimeout(timeoutId);

    if (response.ok && response.status === 200) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.startsWith("image/")) {
        return { valid: true, statusCode: response.status };
      }
      return { valid: false, statusCode: response.status, error: "Not an image content type" };
    }

    return { valid: false, statusCode: response.status, error: `HTTP ${response.status}` };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { valid: false, error: "Request timeout" };
    }
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Download image from URL as Buffer
 * 
 * @param url - Image URL to download
 * @param timeout - Timeout in milliseconds (default: 30000)
 * @returns Download result with buffer and mime type
 */
export async function downloadImageFromUrl(
  url: string,
  timeout: number = 30000
): Promise<{ success: boolean; buffer?: Buffer; mimeType?: string; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.startsWith("image/")) {
      return { success: false, error: "Not an image content type" };
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return { success: true, buffer, mimeType: contentType };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { success: false, error: "Download timeout" };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Upload image to Cloudinary from URL (recommended) or buffer
 * Uses Cloudinary's direct URL upload when sourceUrl is provided (more reliable)
 * Falls back to buffer upload if sourceUrl is not available
 * 
 * @param params - Upload parameters
 * @returns Upload result with Cloudinary URL and public ID
 */
export async function uploadImageBufferToCloudinary(params: {
  buffer?: Buffer;
  sourceUrl?: string;
  publicId: string;
  altText: string;
  folder?: string;
  mimeType: string;
}): Promise<{ success: boolean; url?: string; cloudinaryPublicId?: string; cloudinaryVersion?: string; error?: string }> {
  const { buffer, sourceUrl, publicId, altText, folder, mimeType } = params;

  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return {
        success: false,
        error: "Cloudinary configuration missing. Please check your environment variables.",
      };
    }

    // Generate SEO-friendly public_id
    const seoFileName = generateSEOFileName(altText, "", "", undefined, true);
    const cloudinaryPublicId = folder
      ? generateCloudinaryPublicId(seoFileName, folder)
      : seoFileName;

    if (!isValidCloudinaryPublicId(cloudinaryPublicId)) {
      return {
        success: false,
        error: "Generated public_id is invalid.",
      };
    }

    const formData = new FormData();
    
    // Method 1: Direct URL upload (recommended by Cloudinary for server-side)
    if (sourceUrl) {
      formData.append("file", sourceUrl);
    } 
    // Method 2: Buffer upload (fallback)
    else if (buffer) {
      // Convert buffer to base64 data URL for Cloudinary
      const base64Data = buffer.toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64Data}`;
      formData.append("file", dataUrl);
    } else {
      return {
        success: false,
        error: "Either sourceUrl or buffer must be provided.",
      };
    }

    formData.append("upload_preset", uploadPreset);
    formData.append("public_id", cloudinaryPublicId);
    if (folder) {
      formData.append("asset_folder", folder);
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `Upload failed with status ${response.status}`;
      return {
        success: false,
        error: errorMessage,
      };
    }

    const result = await response.json();
    const cloudinaryUrl = result.secure_url || result.url;
    const optimizedUrl = optimizeCloudinaryUrl(
      cloudinaryUrl,
      cloudinaryPublicId,
      result.format || "jpg",
      "image"
    );

    return {
      success: true,
      url: optimizedUrl,
      cloudinaryPublicId: result.public_id || cloudinaryPublicId, // Use Cloudinary's returned public_id
      cloudinaryVersion: result.version?.toString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Search Unsplash for alternative image
 * 
 * @param searchTerm - Search term for image query
 * @returns Search result with image URL
 */
export async function searchUnsplashAlternative(
  searchTerm: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return { success: false, error: "UNSPLASH_ACCESS_KEY not configured" };
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=1`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      }
    );

    if (!response.ok) {
      return { success: false, error: `Unsplash API error: ${response.status}` };
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const photo = data.results[0];
      // Use regular size (1080px on longest side) for better quality
      const imageUrl = photo.urls?.regular || photo.urls?.raw;
      if (imageUrl) {
        return { success: true, url: imageUrl };
      }
    }

    return { success: false, error: "No results found" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
