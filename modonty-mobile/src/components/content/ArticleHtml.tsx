import RenderHtml, { defaultSystemFonts, type CustomBlockRenderer, type RenderersProps } from '@native-html/render';
import { Image } from 'expo-image';
import { memo, useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';

import { openHref } from '@/lib/nav';
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

const RENDERERS_PROPS: Partial<RenderersProps> = {
  a: { onPress: (_event: unknown, href: string) => openHref(href) },
};

/**
 * أنماط المتن كائنات صريحة (لا StyleSheet) بأمر توثيق المكتبة. الاتجاه RTL صريح على كل كتلة،
 * والرابط مسطَّر لا ملوَّن فقط (WCAG 1.4.1).
 */
function htmlStyles(c: AppColors) {
  const rtl = { textAlign: 'right' as const, writingDirection: 'rtl' as const };
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

/** متن المقال: `html` المنقّى نفسه الذي ترسمه صفحة الويب (`safeHtml` — article-detail-shape.ts). */
export const ArticleHtml = memo(function ArticleHtml({ html }: { html: string }) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => htmlStyles(colors), [colors]);
  const source = useMemo(() => ({ html }), [html]);
  return (
    <RenderHtml
      source={source}
      contentWidth={width - space.screen * 2}
      baseStyle={styles.base}
      tagsStyles={styles.tags}
      systemFonts={SYSTEM_FONTS}
      renderers={RENDERERS}
      renderersProps={RENDERERS_PROPS}
      ignoredDomTags={['script', 'style', 'iframe', 'form', 'input', 'button']}
    />
  );
});
