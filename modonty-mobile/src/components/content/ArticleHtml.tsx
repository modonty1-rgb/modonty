import RenderHtml, { defaultSystemFonts, type CustomBlockRenderer, type RenderersProps } from '@native-html/render';
import { Image } from 'expo-image';
import { memo, useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';

import { openHref } from '@/lib/nav';
import { miscApi } from '@/services/api-actions';
import { toApiError } from '@/services/errors';
import { useAppTheme } from '@/theme/ThemeProvider';
import { fonts, media, radius, space, typography, type AppColors } from '@/theme/tokens';

/** «Any fontFamily used must be registered with systemFonts» — وإلا يسقط Tajawal صامتاً (نفس درس الكونسول). */
const SYSTEM_FONTS = [...defaultSystemFonts, fonts.regular, fonts.medium, fonts.bold];

const HtmlImage: CustomBlockRenderer = ({ tnode }) => {
  const uri = tnode.attributes.src;
  if (!uri) return null;
  return <Image accessibilityLabel={tnode.attributes.alt ?? ''} contentFit="cover" source={uri} style={imageStyles.image} transition={200} />;
};
const imageStyles = StyleSheet.create({
  image: { width: '100%', aspectRatio: media.articleAspect, borderRadius: radius.image, marginTop: space.md },
});
const RENDERERS = { img: HtmlImage };


/**
 * أنماط المتن كائنات صريحة (لا StyleSheet) بأمر توثيق المكتبة. الاتجاه RTL صريح على كل كتلة،
 * والرابط مسطَّر لا ملوَّن فقط (WCAG 1.4.1).
 */
function htmlStyles(c: AppColors) {
  // نفس AppText: 'auto' يتبع I18nManager. التطبيق يفرض RTL، وReact Native يعكس left/right في Text
  // عندها — فـ'right' كانت تُرسم يساراً (مقيس على الجوال ٨ أكتوبر).
  const rtl = { textAlign: 'auto' as const, writingDirection: 'auto' as const };
  return {
    base: { color: c.text, fontFamily: fonts.regular, fontSize: typography.reading.fontSize, lineHeight: typography.reading.lineHeight, ...rtl },
    tags: {
      p: { marginTop: space.sm, marginBottom: 0, ...rtl },
      h2: { fontFamily: fonts.medium, fontSize: typography.pageTitle.fontSize, lineHeight: typography.pageTitle.lineHeight, marginTop: space.xl, marginBottom: 0, fontWeight: '500' as const, ...rtl },
      h3: { fontFamily: fonts.medium, fontSize: typography.sectionTitle.fontSize, lineHeight: typography.sectionTitle.lineHeight, marginTop: space.md, marginBottom: 0, fontWeight: '500' as const, ...rtl },
      h4: { fontFamily: fonts.medium, fontSize: typography.body.fontSize, marginTop: space.md, marginBottom: 0, fontWeight: '500' as const, ...rtl },
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
export const ArticleHtml = memo(function ArticleHtml({ html, articleId }: { html: string; articleId?: string }) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => htmlStyles(colors), [colors]);
  const source = useMemo(() => ({ html }), [html]);
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
      systemFonts={SYSTEM_FONTS}
      renderers={RENDERERS}
      renderersProps={renderersProps}
      ignoredDomTags={['script', 'style', 'iframe', 'form', 'input', 'button']}
    />
  );
});
