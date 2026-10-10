import RenderHtml, { defaultSystemFonts, type CustomBlockRenderer, type RenderersProps } from '@native-html/render';
import { Image } from 'expo-image';
import { memo, useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';

import { openHref } from '@/lib/nav';
import { miscApi } from '@/services/api-actions';
import { toApiError } from '@/services/errors';
import { useAppTheme } from '@/theme/ThemeProvider';
import { dsFonts, dsType, fonts, media, radius, space, typography, type AppColors } from '@/theme/tokens';

/** «Any fontFamily used must be registered with systemFonts» — وإلا يسقط Tajawal صامتاً (نفس درس الكونسول). */
const SYSTEM_FONTS = [...defaultSystemFonts, fonts.regular, fonts.medium, fonts.bold, dsFonts.w800];

const HtmlImage: CustomBlockRenderer = ({ tnode }) => {
  const uri = tnode.attributes.src;
  if (!uri) return null;
  return <Image cachePolicy="memory-disk" accessibilityLabel={tnode.attributes.alt ?? ''} contentFit="cover" source={uri} style={imageStyles.image} transition={200} />;
};
const imageStyles = StyleSheet.create({
  image: { width: '100%', aspectRatio: media.articleAspect, borderRadius: radius.image, marginTop: space.md },
});
const RENDERERS = { img: HtmlImage };

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const arabicNumber = (n: number) => String(n).replace(/\d/g, (d) => AR_DIGITS[Number(d)] ?? d);

/**
 * القوائم فقرات عربية: مُرسِم HTML يقلب علامة القائمة إلى الطرف الأيسر بعيداً عن النصّ حين يكون التطبيق RTL
 * (مقيس ١٠ أكتوبر، وenableExperimentalRtl لا يصلحه). فتصير كل <li> فقرة تبدأ بـ«•» أو «١.» — تقع يميناً
 * ملاصقة للسطر الأوّل كما في الويب.
 */
function flattenLists(html: string): string {
  // محتوى البند يُفكّ من <p> الداخلية — وإلا انفصلت العلامة في سطر وحدها (مقيس ١٠ أكتوبر).
  const item = (marker: string) => (_m: string, body: string) => `<p class="li"><span class="mk">${marker}</span> ${body.replace(/<\/?p[^>]*>/gi, ' ').trim()}</p>`;
  const withOl = html.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_m, inner: string) => {
    let i = 0;
    return inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (m, body: string) => item(`${arabicNumber(++i)}.`)(m, body));
  });
  return withOl
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_m, inner: string) => inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, item('●')))
    .replace(/<\/?(ul|ol)[^>]*>/gi, '');
}


/**
 * أنماط المتن كائنات صريحة (لا StyleSheet) بأمر توثيق المكتبة. الاتجاه RTL صريح على كل كتلة،
 * والرابط مسطَّر لا ملوَّن فقط (WCAG 1.4.1).
 */
function htmlStyles(c: AppColors, size: number) {
  // نفس AppText: 'auto' يتبع I18nManager. التطبيق يفرض RTL، وReact Native يعكس left/right في Text
  // عندها — فـ'right' كانت تُرسم يساراً (مقيس على الجوال ٨ أكتوبر).
  const rtl = { textAlign: 'auto' as const, writingDirection: 'auto' as const };
  return {
    // نصّ القراءة ١٨/٣٦ افتراضاً (dsType.reader — Screens A · 04) وبحجم القارئ ١٦–٢٢ بسطر ضعف الحجم (04ب: ٢٠/٤٠).
    // العناوين +٣ فوق المتن (٢١/٣٢ عند ١٨) w800.
    base: { color: c.text, fontFamily: dsType.reader.fontFamily, fontSize: size, lineHeight: size * 2, ...rtl },
    classes: {
      // بنود القوائم: أقرب لبعض من الفقرات، وبمسافة بداية خفيفة.
      li: { marginTop: 10 },
      // «•» في تجوال صغيرة كنقطة — تُكبَّر وتُلوَّن بلون العلامة كي تُقرأ علامةَ بند.
      mk: { color: c.primary, fontFamily: 'Tajawal_800ExtraBold' },
    },
    tags: {
      p: { marginTop: 18, marginBottom: 0, ...rtl },
      h2: { fontFamily: dsFonts.w800, fontSize: size + 3, lineHeight: Math.round((size + 3) * 1.5), marginTop: 28, marginBottom: 0, fontWeight: '800' as const, ...rtl },
      h3: { fontFamily: fonts.bold, fontSize: typography.sectionTitle.fontSize, lineHeight: typography.sectionTitle.lineHeight, marginTop: space.md, marginBottom: 0, fontWeight: '700' as const, ...rtl },
      h4: { fontFamily: fonts.bold, fontSize: typography.body.fontSize, marginTop: space.md, marginBottom: 0, fontWeight: '700' as const, ...rtl },
      strong: { fontFamily: fonts.bold, fontWeight: '700' as const },
      b: { fontFamily: fonts.bold, fontWeight: '700' as const },
      a: { color: c.interactive, textDecorationLine: 'underline' as const },
      blockquote: { borderRightColor: c.interactive, borderRightWidth: 3, color: c.muted, paddingRight: space.md, marginTop: space.md, marginHorizontal: 0, ...rtl },
      ul: { marginTop: space.sm, paddingRight: space.md, ...rtl },
      ol: { marginTop: space.sm, paddingRight: space.md, ...rtl },
      li: { marginBottom: space.xxs, ...rtl },
      figcaption: { color: c.muted, fontSize: typography.secondary.fontSize, marginTop: space.xxs, ...rtl },
      table: { borderColor: c.border, borderWidth: 1, marginTop: space.md },
      td: { borderColor: c.border, borderWidth: 1, padding: space.xxs },
      th: { borderColor: c.border, borderWidth: 1, padding: space.xxs, fontFamily: fonts.medium },
      code: { fontFamily: 'monospace', writingDirection: 'ltr' as const },
    },
  };
}

/**
 * متن المقال: `html` المنقّى نفسه الذي ترسمه صفحة الويب (`safeHtml` — article-detail-shape.ts).
 * مع `articleId` يُسجَّل نقر الرابط (T2 — نفس article-link-click في الويب) قبل فتحه.
 */
export const ArticleHtml = memo(function ArticleHtml({ html, articleId, size = dsType.reader.fontSize }: { html: string; articleId?: string; size?: number }) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => htmlStyles(colors, size), [colors, size]);
  const source = useMemo(() => ({ html: flattenLists(html) }), [html]);
  const renderersProps = useMemo<Partial<RenderersProps>>(
    () => ({
      a: {
        onPress: (_event: unknown, href: string) => {
          if (articleId) miscApi.linkClick(articleId, href).catch((error: unknown) => console.warn('[article] link click', toApiError(error).message));
          openHref(href);
        },
      },
    }),
    [articleId],
  );
  return (
    <RenderHtml
      source={source}
      contentWidth={width - space.screen * 2}
      baseStyle={styles.base}
      tagsStyles={styles.tags}
      classesStyles={styles.classes}
      systemFonts={SYSTEM_FONTS}
      // سقف التطبيق (tokens fontScale) — كان المتن بلا سقف: ١٨ يصير ٢٧ على جوال مضبوط ١٫٥. حجم القراءة من «Aa».
      defaultTextProps={{ maxFontSizeMultiplier: 1.2 }}
      renderers={RENDERERS}
      renderersProps={renderersProps}
      ignoredDomTags={['script', 'style', 'iframe', 'form', 'input', 'button']}
      // «justify» المكتوب في HTML الويب يفتح فجوات بين الكلمات العربية على الجوال (مقيس ٩ أكتوبر) —
      // المحاذاة من اتجاه الكتابة وحده.
      ignoredStyles={['textAlign']}
    />
  );
});
