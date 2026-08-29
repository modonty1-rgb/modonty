import type { NextRequest } from "next/server";
import { ReelStatus, ReelUploader } from "@prisma/client";
import { db } from "@/lib/db";
import { arabicDayLabel, arabicMetaLine, arabicNumber } from "@/lib/mobile-api/arabic-format";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";

/**
 * S09 «الطلّات» + the copy S10 «رفع طلّة» renders.
 *
 * `upload.available` is the honest half. There is no write path yet — no upload endpoint,
 * no Bunny Stream ingest for client uploads, and neither `expo-image-picker` nor
 * `expo-camera` is installed in the app. So the two source buttons are DECLARED unavailable
 * rather than drawn dead: a button that does nothing teaches the client the app is broken.
 * When the write path lands, this flips to `true` and S10 draws exactly the approved image
 * with no screen change.
 */

const STATUS_LABELS: Record<ReelStatus, string> = {
  [ReelStatus.DRAFT]: "مسودة",
  [ReelStatus.PENDING_APPROVAL]: "قيد المراجعة",
  [ReelStatus.APPROVED]: "معتمد",
  [ReelStatus.PUBLISHED]: "منشور",
  [ReelStatus.REJECTED]: "مرفوض",
  [ReelStatus.ARCHIVED]: "مؤرشف",
};

/** Warning = still waiting on us · accent = done · danger = the client must act. */
const STATUS_TONES: Record<ReelStatus, "primary" | "warning" | "danger" | "muted"> = {
  [ReelStatus.DRAFT]: "muted",
  [ReelStatus.PENDING_APPROVAL]: "warning",
  [ReelStatus.APPROVED]: "primary",
  [ReelStatus.PUBLISHED]: "primary",
  [ReelStatus.REJECTED]: "danger",
  [ReelStatus.ARCHIVED]: "muted",
};

function typeLabel(mimeType: string | null): string {
  return mimeType?.startsWith("video/") ? "فيديو" : "صورة";
}

function durationLabel(seconds: number | null): string | null {
  return seconds === null ? null : `${arabicNumber(seconds)} ثانية`;
}

function uploaderLabel(uploader: ReelUploader | null): string | null {
  if (uploader === ReelUploader.CLIENT) return "رفعته أنت";
  if (uploader === ReelUploader.ADMIN) return "رفعه فريق مودونتي";
  return null;
}

export async function GET(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const now = new Date();
  const rows = await db.media.findMany({
    where: { clientId: session.clientId, inReels: true },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, filename: true, mimeType: true, reelStatus: true, reelUploadedBy: true, reelRejectionReason: true, thumbnailUrl: true, durationSec: true, createdAt: true },
  });

  const videos = rows.map((row) => ({
    id: row.id,
    filename: row.filename,
    statusLabel: row.reelStatus === null ? null : STATUS_LABELS[row.reelStatus],
    statusTone: row.reelStatus === null ? null : STATUS_TONES[row.reelStatus],
    /**
     * سطر بيانات **واحد** يحمل النوع واليوم والمدّة والرافع.
     *
     * كان اليوم سطراً والباقي سطراً، فصارت البطاقة أربعة أسطر بينما ثلاثة تكفي — والفائض
     * ترك **فراغاً ميّتاً تحت المصغّرة** لأنّ عمود النصّ أطول من الصورة. وكلّها بيانات وصفية
     * من رتبة واحدة، فلا سبب لتفريقها إلّا أنّها جاءت من حقول.
     *
     * والنوع هنا **كلمة، لا رمز تشغيل فوق المصغّرة**: الرمز يُقرأ وعداً بالتشغيل والتطبيق
     * لا يشغّل شيئاً (الاعتماد عند الفريق لا عند العميل، فلا مشغّل)، فتذهب الضغطة سدى ثم
     * يتّصل يسأل «ليش ما يشتغل؟». إشارةٌ تعد بما لا يقع أسوأ من غياب الإشارة (خالد، ٢٩ أغسطس).
     *
     * والكلمة تؤدّي غرض الرمز كاملاً: القائمة تحمل صوراً وفيديوهات معاً (مقيس: صفّ `03.png`
     * بـ`image/jpeg` تحت `inReels: true`) وكانت تُعرض متطابقة. و`durationSec` ليس بديلاً —
     * فيديوهات حقيقية على القاعدة مدّتها `null`. المصدر الصادق هو نوع الملفّ.
     */
    metaLine: arabicMetaLine([typeLabel(row.mimeType), arabicDayLabel(row.createdAt, now), durationLabel(row.durationSec), uploaderLabel(row.reelUploadedBy)]),
    rejectionReason: row.reelRejectionReason,
    thumbnailUrl: row.thumbnailUrl,
  }));

  return ok({
    videos,
    review: {
      title: "الطلّات",
      uploadActionLabel: "رفع طلّة",
      latestSectionTitle: "آخر الطلّات",
      uploadHintLabel: "تقدر تصوّر الطلّة أو تختارها من الاستديو",
      retryLabel: "إعادة المحاولة",
      emptyTitle: "ما رفعت أي طلّة بعد",
      emptyDescription: "أول طلّة ترفعها تظهر هنا وحالتها «قيد المراجعة».",
      errorTitle: "ما قدرنا نحمّل الطلّات",
      offlineTitle: "ما في اتصال",
      offlineDescription: "تأكد من الإنترنت وجرّب مرة ثانية.",
    },
    upload: {
      available: false,
      title: "أضف طلّة من نشاطك",
      description: "بعد الرفع تظهر الطلّة في الكونسول لمراجعتها وإدارتها.",
      statusBadgeLabel: "تُحفظ الطلّة بانتظار المراجعة",
      cameraLabel: "تصوير الآن",
      libraryLabel: "اختيار من الاستديو",
      noteTitle: "الرفع ما ينشر الطلّة مباشرة.",
      noteBody: "تبدأ حالتها «بانتظار المراجعة» ثم تظهر لفريق مودونتي.",
      backLabel: "العودة للطلّات",
      /**
       * العنوان مكتوب، لا «الكونسول على المتصفح».
       *
       * الجملة كانت تقول له **افعل** ولا تقول **أين** — فيبقى عليه أن يبحث أو يسأل، وهذا
       * هو الفرق بين إرشادٍ يُنهي المهمّة وإرشادٍ يؤجّلها. أمر خالد (٢٩ أغسطس).
       */
      unavailableLabel: "الرفع من الجوال لسه ما فُتح. ارفع طلّتك من الكونسول على المتصفح: console.modonty.com",
      screenTitle: "رفع طلّة",
    },
  });
}
