export interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error" | "saved";
  error?: string;
  mediaId?: string;
  previewUrl?: string; // Local preview URL (URL.createObjectURL)
  uploadResult?: {
    url: string;
    secure_url: string;
    public_id: string;
    version: string;
    width: number;
    height: number;
    format: string;
    signature?: string;
  };
}

export interface UploadZoneProps {
  onUploadComplete?: () => void;
  initialClientId?: string | null;
}

export interface Client {
  id: string;
  name: string;
  slug: string;
}

export interface SEOFormData {
  altText: string;
  title: string;
  description: string;
  dateCreated: string;
}
