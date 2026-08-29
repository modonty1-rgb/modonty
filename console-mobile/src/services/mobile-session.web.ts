const accessTokenKey = 'modonty.console.mobile.access-token';

/**
 * نسخة الويب من تخزين التوكن — **للتطوير على الديسك توب وحده**.
 *
 * `expo-secure-store` على الويب قشرة فارغة حرفياً: `ExpoSecureStore.web.js` محتواه
 * `export default {}`، فلا خزنة مفاتيح في المتصفّح أصلاً. والباندلر يختار هذا الملفّ
 * تلقائياً على الويب ويتجاهله على أندرويد وiOS (امتدادات المنصّة الرسمية)، فالجوّال
 * يبقى على الخزنة المشفّرة كما هو — **ولا سطر من هذا الملفّ يصل إلى حزمة الإنتاج النيتف**.
 *
 * `localStorage` غير مشفّر ومقروء من أي سكربت في الصفحة، وهو مقبول هنا لأن هذه الواجهة
 * لا تُنشر للعملاء: الويب أداة تطوير لإغلاق الواجهة والوظائف على الديسك توب. لو تقرّر
 * يوماً نشر نسخة ويب حقيقية، هذا الملفّ يُستبدل بكوكي `HttpOnly` من الخادم.
 */
export async function readMobileAccessToken(): Promise<string | null> {
  try {
    return globalThis.localStorage?.getItem(accessTokenKey) ?? null;
  } catch (reason) {
    // خصوصية المتصفّح قد تمنع التخزين كلياً؛ الجلسة تسقط إلى «غير مسجَّل» لا إلى انهيار.
    console.warn('[mobile-session.web] تعذّرت قراءة التوكن من التخزين المحلي', reason);
    return null;
  }
}

export async function saveMobileAccessToken(accessToken: string): Promise<void> {
  try {
    globalThis.localStorage?.setItem(accessTokenKey, accessToken);
  } catch (reason) {
    console.warn('[mobile-session.web] تعذّر حفظ التوكن في التخزين المحلي', reason);
  }
}

export async function clearMobileAccessToken(): Promise<void> {
  try {
    globalThis.localStorage?.removeItem(accessTokenKey);
  } catch (reason) {
    console.warn('[mobile-session.web] تعذّر حذف التوكن من التخزين المحلي', reason);
  }
}
