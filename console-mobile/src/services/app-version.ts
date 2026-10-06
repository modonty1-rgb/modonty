import * as Updates from 'expo-updates';
import { arabicDigitsText } from '@/src/services/engagement-api';
import { APP_RELEASE } from '@/src/services/app-release';

const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

/**
 * سطر الإصدار في «حسابي»: رقم النسخة المثبّتة + تاريخ آخر تحديث صامت ورمزه القصير.
 *
 * خالد (٥ أكتوبر ٢٠٢٦): العميل وفريق الدعم لازم يعرفون أيّ نسخة على الجوال وهل وصلها آخر تحديث —
 * رقم ١٫٠٫٠ وحده لا يكفي لأن التحديث الصامت يغيّر الشاشات دون أن يغيّر الرقم.
 */
export function getAppVersionLine(): string {
  // رقم الإصدار بأرقام لاتينية (1.0.0) كما يُكتب في كل متجر: «١٫٠٫٠» قُرئ صفّ نقاط لأن الصفر العربي نقطة
  // (جوال خالد ٦ أكتوبر ٢٠٢٦). وهو الرقم نفسه الذي يُقرأ لفريق الدعم.
  const parts = [`الإصدار ${APP_RELEASE}`];
  const created = Updates.isEmbeddedLaunch ? null : Updates.createdAt;
  if (created) parts.push(`تحديث ${arabicDigitsText(String(created.getDate()))} ${MONTHS[created.getMonth()]}`);
  if (Updates.updateId) parts.push(Updates.updateId.slice(0, 8));
  return parts.join(' · ');
}
