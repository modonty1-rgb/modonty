import "server-only";

/**
 * سيرفر المصنع يتكلّم بنفس سرّ الرادار — الهيدر `x-radar-secret` = `RADAR_INGEST_SECRET`،
 * كما في `app/api/idea-bank/ingest/route.ts`. بلا سرّ مضبوط على الخادم يُرفض كل شيء.
 */
export function isFactoryAuthorized(request: Request): boolean {
  const secret = process.env.RADAR_INGEST_SECRET;
  return !!secret && request.headers.get("x-radar-secret") === secret;
}
