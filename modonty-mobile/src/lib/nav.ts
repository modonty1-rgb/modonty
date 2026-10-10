import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';

/**
 * التنقّل الموحّد — كل شاشة تفتح غيرها من هنا، فيبقى شكل المسارات في مكان واحد.
 * الدوالّ ثابتة المرجع (خارج المكوّنات) فتُمرَّر للبطاقات بنمط الموزِّع.
 */
export const open = {
  article: (slug: string) => router.push({ pathname: '/articles/[slug]', params: { slug } }),
  partner: (slug: string) => router.push({ pathname: '/partners/[slug]', params: { slug } }),
  reel: (slug: string) => router.push({ pathname: '/reels/[slug]', params: { slug } }),
  category: (slug: string) => router.push({ pathname: '/categories/[slug]', params: { slug } }),
  tag: (slug: string) => router.push({ pathname: '/tags/[slug]', params: { slug } }),
  // صفحة المجال = دليل الشركاء ورقاقة المجال مختارة (هرم «اكتشف» المعتمد ٩ أكتوبر).
  industry: (slug: string) => router.push({ pathname: '/partners', params: { industry: slug } }),
  author: (slug: string) => router.push({ pathname: '/authors/[slug]', params: { slug } }),
  user: (id: string) => router.push({ pathname: '/users/[id]', params: { id } }),
};

/**
 * روابط الويب التي يرجعها الخادم داخل البيانات (`/articles/x` · `/reels/x` · `/clients/x`) تُفتح شاشةً
 * في التطبيق؛ وما لا يقابله شاشة يُفتح في المتصفّح الداخلي إن كان رابطاً كاملاً.
 */
export function openHref(href: string): void {
  const path = href.replace(/^https?:\/\/[^/]+/, '').split('#')[0]?.split('?')[0] ?? '';
  const [, first, second, third] = path.split('/');
  const slug = second ? decodeURIComponent(second) : null;
  if (first === 'articles' && slug) return void open.article(slug);
  if (first === 'reels' && slug) return void open.reel(slug);
  if (first === 'clients' && slug && !third) return void open.partner(slug);
  if (first === 'categories' && slug) return void open.category(slug);
  if (first === 'tags' && slug) return void open.tag(slug);
  if (first === 'industries' && slug) return void open.industry(slug);
  if (first === 'authors' && slug) return void open.author(slug);
  if (/^https?:\/\//.test(href)) void openExternal(href);
}

export async function openExternal(url: string): Promise<void> {
  if (/^(tel|mailto|https:\/\/wa\.me|whatsapp):/.test(url) || url.startsWith('https://wa.me')) {
    await Linking.openURL(url);
    return;
  }
  await WebBrowser.openBrowserAsync(url);
}
