/**
 * `X-Device-Id` — معرّف ثابت يولّده التطبيق مرّة ويخزّنه. يحلّ محلّ كوكي `modonty_view_sid`
 * في **نفس** منطق منع التكرار والحدّ (الويب يضع الكوكي، التطبيق يرسل الرأس).
 *
 * يُخزَّن بالبادئة `app:` في عمود `sessionId` نفسه، فيبقى منطق «آخر مشاهدة لهذه الجلسة»
 * كما هو، وتتميّز زيارات التطبيق عن المتصفّح في الجداول.
 */
const DEVICE_ID = /^[A-Za-z0-9-]{8,64}$/;

export function readDeviceId(request: Request): string | null {
  const raw = request.headers.get("x-device-id")?.trim();
  return raw && DEVICE_ID.test(raw) ? raw : null;
}

export function deviceSessionId(deviceId: string): string {
  return `app:${deviceId}`;
}
