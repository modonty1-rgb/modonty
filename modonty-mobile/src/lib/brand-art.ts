import { Image } from 'expo-image';

/**
 * صور الهويّة المحلّية (داخل التطبيق، لا من الشبكة) — مصدر واحد تقرؤه الشاشات وشاشة البداية.
 * كل صورة محلّية جديدة تُضاف هنا فتُحمَّل مع شاشة البداية تلقائياً (قرار خالد ٩ أكتوبر).
 * صور المقالات والطلّات من الشبكة وتتغيّر يومياً — لا تُحمَّل هنا؛ يخزّنها expo-image عند أوّل عرض.
 */
export const brandArt = {
  toolWheel: require('../../assets/brand/tools/wheel.webp'),
  toolLink: require('../../assets/brand/tools/link.webp'),
  toolQuran: require('../../assets/brand/tools/quran.webp'),
  // عالم مدونتي — رسوم بيضاء شفّافة فوق لون القطاع من الكود (لون مطابق في الفاتح والداكن).
  sectorFootball: require('../../assets/brand/sectors/football.webp'),
  sectorAi: require('../../assets/brand/sectors/ai.webp'),
  sectorEntrepreneurship: require('../../assets/brand/sectors/entrepreneurship.webp'),
  sectorEntertainment: require('../../assets/brand/sectors/entertainment.webp'),
  sectorEducation: require('../../assets/brand/sectors/education.webp'),
  sectorHealth: require('../../assets/brand/sectors/health.webp'),
} as const;

/** أقصى انتظار لشاشة البداية — لا تُعلَّق الشاشة أبداً بسبب صورة. */
const SPLASH_BUDGET_MS = 1500;

/** يجهّز كل صور الهويّة في الذاكرة أثناء شاشة البداية. لا يرمي خطأ: الفشل يعني تحميلاً عادياً لاحقاً. */
export async function preloadBrandArt(): Promise<void> {
  // واحدة بعد واحدة لا دفعةً واحدة: في التطوير تأتي الصور من Metro عبر الشبكة، والطلبات المتزامنة
  // كانت تنتهي بـ SocketTimeout (مقيس ٩ أكتوبر). في نسخة المتجر هي داخل التطبيق، والتسلسل لا يكلّف شيئاً.
  const sequential = (async () => {
    for (const src of Object.values(brandArt)) await Image.loadAsync(src).catch(() => undefined);
  })();
  await Promise.race([sequential, new Promise((resolve) => setTimeout(resolve, SPLASH_BUDGET_MS))]);
}
