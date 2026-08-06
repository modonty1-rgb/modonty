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
    /** Blur placeholder built by the uploader from the same buffer — stored on Media. */
    blurDataURL?: string | null;
  };
}

export interface UploadZoneProps {
  onUploadComplete?: () => void;
  initialClientId?: string | null;
  /** Modonty Core (T2): the Client row that IS the platform. Default upload target. */
  coreClientId?: string | null;
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
}
