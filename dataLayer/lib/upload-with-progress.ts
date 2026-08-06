/**
 * Upload one file and report real byte-level progress.
 *
 * `fetch` cannot do this: its request body is not observable, so a fetch-based uploader
 * can only show a spinner and hope. `XMLHttpRequest.upload.onprogress` fires as the bytes
 * actually leave the browser — that is the only way to draw a truthful progress bar.
 * (Streaming request bodies exist but need HTTP/2 + duplex and are not usable here.)
 */

export interface UploadProgress {
  /** 0–100, byte-level. Falls back to null while the length is still unknown. */
  percent: number | null;
  loaded: number;
  total: number;
}

export interface UploadOptions {
  endpoint: string;
  file: File;
  /** Extra form fields sent alongside the file (e.g. `{ folder: "reels" }`). */
  fields?: Record<string, string>;
  /** Form field name the server reads the file from. */
  fileField?: string;
  onProgress?: (p: UploadProgress) => void;
  /** Lets the caller cancel an in-flight upload. */
  signal?: AbortSignal;
}

export interface UploadResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T | null;
}

export function uploadWithProgress<T = unknown>(options: UploadOptions): Promise<UploadResponse<T>> {
  const { endpoint, file, fields, fileField = "file", onProgress, signal } = options;

  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append(fileField, file);
    for (const [key, value] of Object.entries(fields ?? {})) form.append(key, value);

    xhr.upload.onprogress = (e) => {
      onProgress?.({
        percent: e.lengthComputable ? Math.round((e.loaded / e.total) * 100) : null,
        loaded: e.loaded,
        total: e.lengthComputable ? e.total : file.size,
      });
    };

    xhr.onload = () => {
      let data: T | null = null;
      try {
        data = JSON.parse(xhr.responseText) as T;
      } catch {
        data = null;
      }
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data });
    };

    xhr.onerror = () => reject(new Error("network"));
    xhr.ontimeout = () => reject(new Error("timeout"));
    xhr.onabort = () => reject(new DOMException("Aborted", "AbortError"));

    signal?.addEventListener("abort", () => xhr.abort(), { once: true });

    xhr.open("POST", endpoint);
    xhr.send(form);
  });
}

/** Human file size, Latin digits — reads the same in an Arabic and an English UI. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
