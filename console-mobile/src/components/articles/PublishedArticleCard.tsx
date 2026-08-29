import { Image } from 'expo-image';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import type { ArticleListItem } from '@/src/services/articles-api';
import { control, darkColors, fonts, lightColors, media, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type PublishedArticleCardProps = {
  article: ArticleListItem;
  accessibilityLabel: string;
  openLabel: string;
  onOpen: (url: string) => void;
};

/**
 * بطاقة مقال **منشور** — عرضٌ يقود إلى الموقع، لا صفّ فرز.
 *
 * وهي عمداً **ليست** بطاقة S05: هناك طابور قرارات يُمسح بالعين، فالمصغّرة ٨٠dp والعنوان
 * سطران. وهنا المقال **خرج للناس**، ووظيفة البطاقة أن تُظهر عمل العميل كما يراه زائره وأن
 * تدفعه لفتحه — وكل فتحة زيارة حقيقية لموقعه. فالصورة كاملة، والعنوان كامل بلا قصّ،
 * والنبذة حاضرة. وظيفتان مختلفتان فبطاقتان، لا واحدة بمفاتيح.
 *
 * **الثقة تُبنى بأن تقول أين تذهب قبل الضغط:** البطاقة تعرض النطاق الفعلي (`siteHost`)
 * وسهماً خارجياً، فلا يُفاجأ العميل بمغادرة التطبيق. وهذا هو الفرق بين رابط محترف ورابط
 * يُخشى منه — والمستخدم لا يثق بما لا يعرف وجهته.
 */
export const PublishedArticleCard = memo(function PublishedArticleCard({ article, accessibilityLabel, openLabel, onOpen }: PublishedArticleCardProps) {
  const { mode } = useAppTheme();
  const styles = mode === 'dark' ? darkStyles : lightStyles;
  const palette = mode === 'dark' ? darkColors : lightColors;
  const imageUri = article.featuredImage?.bunnyUrl ?? article.featuredImage?.url;
  const canOpen = typeof article.siteUrl === 'string' && article.siteUrl.length > 0;
  const handleOpen = useCallback(() => { if (article.siteUrl) onOpen(article.siteUrl); }, [article.siteUrl, onOpen]);

  const content = <>
    {imageUri ? <Image
      accessibilityLabel={article.featuredImage?.altText ?? article.title}
      cachePolicy="memory-disk"
      contentFit="cover"
      source={imageUri}
      style={styles.hero}
      transition={200}
    /> : null}

    <View style={styles.body}>
      <View style={styles.topRow}>
        <View style={styles.badge}><Text maxFontSizeMultiplier={1} style={styles.badgeText}>{article.statusLabel}</Text></View>
        {article.categoryLabel ? <Text numberOfLines={1} style={styles.category}>{article.categoryLabel}</Text> : null}
      </View>

      {/* بلا `numberOfLines`: المقال منشور والعنوان هو واجهته — يُقرأ كاملاً كما يقرأه الزائر. */}
      <Text style={styles.title}>{article.title}</Text>
      {article.excerpt ? <Text numberOfLines={3} style={styles.excerpt}>{article.excerpt}</Text> : null}
      {article.metaLabel ? <Text numberOfLines={1} style={styles.meta}>{article.metaLabel}</Text> : null}

      {canOpen ? <View style={styles.openRow}>
        <ModontyIcon name="arrow-left" size={control.iconSize} primary={styles.openText.color as string} accent={palette.accent} />
        <View style={styles.openTextGroup}>
          <Text style={styles.openText}>{openLabel}</Text>
          {/* النطاق تحت الفعل: يقول أين تذهب الضغطة قبل أن تُضغَط. */}
          {article.siteHost ? <Text style={styles.host}>{article.siteHost}</Text> : null}
        </View>
      </View> : null}
    </View>
  </>;

  return canOpen
    ? <Pressable accessibilityRole="link" accessibilityLabel={accessibilityLabel} onPress={handleOpen} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>{content}</Pressable>
    : <View style={styles.card}>{content}</View>;
});

const shared = {
  pressed: { opacity: 0.72 },
  card: { borderRadius: radii.card, borderWidth: StyleSheet.hairlineWidth, marginBottom: spacing.md, overflow: 'hidden' as const },
  // الصورة تملأ عرض البطاقة بلا حشو: هي واجهة المقال كما تظهر على الموقع.
  hero: { aspectRatio: media.cardImageAspectRatio, width: '100%' as const },
  body: { gap: spacing.xs, padding: spacing.md },
  topRow: { alignItems: 'center' as const, flexDirection: 'row-reverse' as const, gap: spacing.xs },
  badge: { borderRadius: radii.field, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: spacing.xs, paddingVertical: spacing.xxs },
  badgeText: { fontFamily: fonts.medium, fontSize: typography.tabLabel, lineHeight: typography.lineHeightTabLabel, writingDirection: 'rtl' as const },
  category: { flexShrink: 1, fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  title: { fontFamily: fonts.bold, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  excerpt: { fontFamily: fonts.regular, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  meta: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  openRow: { alignItems: 'center' as const, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row-reverse' as const, justifyContent: 'space-between' as const, marginTop: spacing.xs, minHeight: control.minTouchTarget, paddingTop: spacing.xs },
  openTextGroup: { alignItems: 'flex-end' as const },
  openText: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, writingDirection: 'rtl' as const },
  // النطاق يُقرأ يساراً كأي عنوان شبكة، ولو كانت الشاشة عربية.
  host: { fontFamily: fonts.regular, fontSize: typography.tabLabel, lineHeight: typography.lineHeightTabLabel, writingDirection: 'ltr' as const },
};

function stylesFor(palette: typeof darkColors) {
  return StyleSheet.create({
    ...shared,
    card: { ...shared.card, backgroundColor: palette.surfaceRaised, borderColor: palette.border },
    hero: { ...shared.hero, backgroundColor: palette.surface },
    badge: { ...shared.badge, borderColor: palette.textInteractive },
    badgeText: { ...shared.badgeText, color: palette.textInteractive },
    category: { ...shared.category, color: palette.muted },
    title: { ...shared.title, color: palette.text },
    excerpt: { ...shared.excerpt, color: palette.muted },
    meta: { ...shared.meta, color: palette.muted },
    openRow: { ...shared.openRow, borderTopColor: palette.border },
    openText: { ...shared.openText, color: palette.textInteractive },
    host: { ...shared.host, color: palette.muted },
  });
}

const darkStyles = stylesFor(darkColors);
const lightStyles = stylesFor(lightColors);
