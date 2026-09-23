import { auth } from "@/lib/auth";
import { staffChannel } from "@/lib/realtime/channels";
import { getRealtimeServer } from "@/lib/realtime/publish";

/**
 * **مسارُ التصديق على القنوات الخاصّة.**
 *
 * Pusher لا يُدخل أحداً قناةً بادئتُها `private-` حتى يوقّع خادمُنا على الاشتراك
 * (`pusher.com/docs/channels/server_api/authorizing-users`). فهذه هي النقطةُ التي
 * تقرّر: هل لصاحب هذه الجلسة أن يسمع هذه القناة؟
 *
 * ── والجواب يُبنى من الجلسة لا من الطلب ──
 * اسمُ القناة يأتي من المتصفّح، فهو **مدّعىً** لا دليل. والقاعدةُ هنا: نبني اسمَ القناة
 * المسموحةَ من `session.user.id` ثمّ نقارن. ولو قبلنا ما أرسله المتصفّح لصار كلُّ موظّفٍ
 * قادراً على سماع جرس زميله بتغيير حرفٍ في الطلب — وفي الجرس عناوينُ مهامَّ وأسماءُ مَن
 * أسندها.
 */

export async function POST(request: Request): Promise<Response> {
  const session = await auth();
  const staffId = (session?.user as { id?: string } | undefined)?.id;
  if (!staffId) return new Response("Unauthorised", { status: 401 });

  const pusher = getRealtimeServer();
  if (!pusher) return new Response("Realtime is not configured", { status: 503 });

  // Pusher يرسلها `application/x-www-form-urlencoded`، لا JSON.
  const form = await request.formData();
  const socketId = String(form.get("socket_id") ?? "");
  const channel = String(form.get("channel_name") ?? "");
  if (!socketId || !channel) return new Response("Missing socket_id or channel_name", { status: 400 });

  // المقارنةُ مع المبنيّ من الجلسة — لا فكَّ لاسم القناة الواصل ولا ثقةَ به.
  if (channel !== staffChannel(staffId)) {
    return new Response("Forbidden", { status: 403 });
  }

  const authResponse = pusher.authorizeChannel(socketId, channel);
  return Response.json(authResponse);
}
