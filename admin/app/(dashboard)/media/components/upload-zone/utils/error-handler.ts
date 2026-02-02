/**
 * Get user-friendly error message from Cloudinary API response
 * @param response - Fetch response object
 * @returns Error message string
 */
export async function getCloudinaryErrorMessage(response: Response): Promise<string> {
  try {
    const errorData = await response.json();

    // Cloudinary API errors
    if (errorData.error?.message) {
      return errorData.error.message;
    }
    if (errorData.error) {
      return typeof errorData.error === "string"
        ? errorData.error
        : JSON.stringify(errorData.error);
    }

    // HTTP status code errors
    switch (response.status) {
      case 400:
        return "Invalid request. Please check your upload settings and try again.";
      case 401:
        return "Authentication failed. Please check your Cloudinary configuration.";
      case 403:
        return "Upload forbidden. Please check your upload preset permissions.";
      case 404:
        return "Cloudinary account not found. Please verify your cloud name configuration.";
      case 413:
        return "File too large for Cloudinary upload.";
      case 500:
        return "Cloudinary server error. Please try again in a moment.";
      case 503:
        return "Cloudinary service unavailable. Please try again later.";
      default:
        return `Upload failed with status ${response.status}. Please try again.`;
    }
  } catch {
    // If we can't parse the error response
    return response.status === 0
      ? "Network error. Please check your internet connection."
      : `Upload failed with status ${response.status}. Please try again.`;
  }
}
