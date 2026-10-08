import type { ApiErrorCode } from './api-types';

export type ApiFailureKind = 'config' | 'network' | 'http' | 'parse';

/**
 * كل فشل شبكة يصل الشاشة بهذا الشكل — لا شيء يُبتلع. `kind` يفصل «لا اتصال» عن «الخادم رفض»
 * (UIUX §٨: حالة بلا شبكة مستقلّة عن الخطأ).
 */
export class ApiError extends Error {
  constructor(
    readonly kind: ApiFailureKind,
    message: string,
    readonly code: ApiErrorCode | null = null,
    readonly status: number | null = null,
    readonly details: unknown = undefined,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isOffline(): boolean {
    return this.kind === 'network';
  }

  get isUnauthorized(): boolean {
    return this.code === 'UNAUTHORIZED';
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  return new ApiError('parse', error instanceof Error ? error.message : String(error));
}

/** رسائل الواجهة التي لا يملكها الخادم — فشل قبل أن يصل الطلب إليه. */
export const CLIENT_MESSAGES = {
  config: 'عنوان الخادم غير مضبوط في هذا البناء (EXPO_PUBLIC_API_URL).',
  network: 'ما في اتصال بالإنترنت.',
  parse: 'وصل ردّ غير مفهوم من الخادم.',
} as const;
