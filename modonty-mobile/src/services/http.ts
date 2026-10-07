import type { ApiErrorBody, ApiErrorCode, ReaderTokens } from './api-types';
import { config } from './config';
import { getDeviceId } from './device-id';
import { ApiError, CLIENT_MESSAGES } from './errors';
import { clearSession, loadSession, saveTokens } from './session';

export type AuthMode = 'none' | 'optional' | 'required';

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  /** `optional`: يُرسل التوكن إن وُجد · `required`: بلا جلسة يرمي UNAUTHORIZED قبل الطلب. */
  auth?: AuthMode;
  /** نقاط التتبّع والمشاركة تطلب `X-Device-Id`. */
  device?: boolean;
  signal?: AbortSignal;
};

const SKEW_MS = 30_000;

function buildUrl(path: string, query: RequestOptions['query']): string {
  if (!config.apiUrl) throw new ApiError('config', CLIENT_MESSAGES.config);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '' || value === false) continue;
    params.set(key, value === true ? '1' : String(value));
  }
  const qs = params.toString();
  return `${config.apiUrl}/api/mobile/v1${path}${qs ? `?${qs}` : ''}`;
}

function isErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === 'object' && value !== null && 'error' in value;
}

async function rawFetch(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (error) {
    if (init.signal?.aborted) throw error;
    throw new ApiError('network', CLIENT_MESSAGES.network);
  }
}

/** يقرأ `response.ok` قبل الجسم (ENGINEERING §٥)، ويحوّل غلاف الخطأ إلى ApiError برسالة الخادم العربية. */
async function unwrap<T>(response: Response): Promise<T> {
  let json: unknown;
  try {
    const text = await response.text();
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new ApiError('parse', CLIENT_MESSAGES.parse, null, response.status);
  }
  if (!response.ok) {
    if (isErrorBody(json)) {
      throw new ApiError('http', json.error.message, json.error.code as ApiErrorCode, response.status, json.error.details);
    }
    throw new ApiError('parse', CLIENT_MESSAGES.parse, null, response.status);
  }
  if (typeof json !== 'object' || json === null || !('data' in json)) {
    throw new ApiError('parse', CLIENT_MESSAGES.parse, null, response.status);
  }
  return (json as { data: T }).data;
}

let refreshing: Promise<string | null> | null = null;

/** تجديد واحد في الطيران مهما تعدّدت الطلبات المنتهية — التوكن يُدوَّر، وطلبان متوازيان يُلغي أحدهما الآخر. */
async function refreshAccessToken(): Promise<string | null> {
  if (!refreshing) {
    refreshing = (async () => {
      const session = await loadSession();
      if (!session) return null;
      const response = await rawFetch(buildUrl('/auth/refresh', undefined), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });
      try {
        const tokens = await unwrap<ReaderTokens>(response);
        await saveTokens(tokens);
        return tokens.accessToken;
      } catch (error) {
        if (error instanceof ApiError && error.code === 'UNAUTHORIZED') {
          await clearSession();
          return null;
        }
        throw error;
      }
    })().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

async function accessToken(): Promise<string | null> {
  const session = await loadSession();
  if (!session) return null;
  if (session.accessExpiresAt - SKEW_MS > Date.now()) return session.accessToken;
  return refreshAccessToken();
}

async function headersFor(options: RequestOptions, token: string | null): Promise<Record<string, string>> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined && !(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.device) headers['X-Device-Id'] = await getDeviceId();
  if (config.appVersion) headers['X-App-Version'] = config.appVersion;
  return headers;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = buildUrl(path, options.query);
  const auth = options.auth ?? 'none';
  let token = auth === 'none' ? null : await accessToken();
  if (auth === 'required' && !token) throw new ApiError('http', 'يجب تسجيل الدخول.', 'UNAUTHORIZED', 401);

  const send = async (bearer: string | null) =>
    rawFetch(url, {
      method: options.method ?? 'GET',
      headers: await headersFor(options, bearer),
      body:
        options.body === undefined
          ? undefined
          : options.body instanceof FormData
            ? options.body
            : JSON.stringify(options.body),
      signal: options.signal,
    });

  let response = await send(token);
  // توكن وصول رُفض قبل موعده (أُلغيت الجلسة أو انحرفت الساعة) → تجديد واحد ثم إعادة واحدة.
  if (response.status === 401 && token) {
    token = await refreshAccessToken();
    if (token) response = await send(token);
    else if (auth === 'optional') response = await send(null);
  }
  return unwrap<T>(response);
}
