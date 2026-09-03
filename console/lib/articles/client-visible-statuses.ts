import { ArticleStatus } from "@prisma/client";

/**
 * الحالات التي يراها العميل — قائمةُ سماحٍ لا استثناء.
 *
 * بلّغ طارق (٣ سبتمبر ٢٠٢٦) أن العميل يرى مقالاً وهو `WRITING` أو `DRAFT`. والسبب أن
 * «كل المقالات» كانت تستثني حالةً واحدة (`status: { not: PUBLISHED_ON_CLIENT_SITE }`)،
 * فكلُّ حالةٍ تُضاف إلى `ArticleStatus` تصير مرئيّةً للعميل تلقائياً ما لم يتذكّر أحدٌ
 * استثناءها. مقيس على الإنتاج قبل الإصلاح: **١٦ مقالاً غير جاهز ظاهرٌ لثمانية عملاء**
 * (`WRITING 7 · ARCHIVED 4 · SCHEDULED 3 · DRAFT 2`).
 *
 * فالاتجاه انعكس: يُذكر ما يُعرض لا ما يُخفى. حالةٌ جديدة تبقى مخفيّةً حتى تُضاف هنا
 * عمداً — والسهو يميل إلى الكتمان لا إلى الكشف.
 *
 * ولماذا هذه الأربع تحديداً (قرار خالد ٣ سبتمبر):
 *  · `AWAITING_APPROVAL` و`NEEDS_REVISION` — بانتظار فعلٍ منه، فإخفاؤها يوقف العمل.
 *  · `SCHEDULED` — متّفقٌ عليه وله موعد؛ رؤيته تطمئنه أن شغله ماشٍ.
 *  · `PUBLISHED` — منشور على مدونتي.
 * وتبقى مخفيّة: `WRITING` و`DRAFT` (شغلٌ نصفه مكتوب) و`ARCHIVED` (خرج من الخطّة).
 *
 * وهذه القائمة نفسها كانت مكتوبةً ضمناً في `statusLabels` بمسار الجوّال — خمس حالات
 * لها نصٌّ عربي وما عداها بلا نصّ. كان التصميم يعرفها والاستعلام لا.
 *
 * تسكن في `lib` لا في مجلّد شاشة المقالات: يقرأها الكونسول ومسارُ الجوّال معاً، وهما
 * راوتان مختلفان — وبابٌ يُغلق في أحدهما ويُترك في الآخر ليس مُغلقاً.
 */
export const CLIENT_VISIBLE_STATUSES = [
  ArticleStatus.AWAITING_APPROVAL,
  ArticleStatus.NEEDS_REVISION,
  ArticleStatus.SCHEDULED,
  ArticleStatus.PUBLISHED,
] as const;

/**
 * ما يُسمح بفتحه بمعرّفٍ مباشر — أوسع بحالةٍ واحدة.
 *
 * `PUBLISHED_ON_CLIENT_SITE` مستثناةٌ من القائمة أعلاه لأن لها تبويبها الخاصّ بروابط
 * نطاق العميل، لا لأنها سرّ. فمنعُ فتحها بالمعرّف يكسر رابطاً مشروعاً.
 */
export const CLIENT_READABLE_STATUSES = [
  ...CLIENT_VISIBLE_STATUSES,
  ArticleStatus.PUBLISHED_ON_CLIENT_SITE,
] as const;
