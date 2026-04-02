"use server";

export async function uploadAvatar(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get("file") as File | null;
    const name = (formData.get("name") as string) || "admin";

    if (!file) {
      return { success: false, error: "No file provided." };
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return { success: false, error: "Image service is not configured." };
    }

    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 30);

    const publicId = `admins/${slug}-${Date.now()}`;

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("upload_preset", uploadPreset);
    uploadData.append("public_id", publicId);
    uploadData.append("asset_folder", "admins");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: uploadData }
    );

    if (!response.ok) {
      return { success: false, error: "Could not upload the image. Please try again." };
    }

    const result = await response.json();
    const url = result.secure_url || result.url;

    return { success: true, url };
  } catch {
    return { success: false, error: "Something went wrong during upload." };
  }
}
