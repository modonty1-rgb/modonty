import { Image } from 'expo-image';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import type { ArticleListItem } from '@/src/services/articles-api';
import { control, darkColors, fonts, lightColors, media, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type ArticleCardProps = {
  article: ArticleListItem;
  variant: 'decision' | 'published';
  accessibilityLabel: string;
  onPress?: (id: string) => void;
  onOpenSite?: (url: string) => void;
  reviewActionLabel?: string;
  siteOpenLabel?: string;
  siteOpenAccessibilityLabel?: string;
};

/**
 * صفّ مضغوط، لا بطاقة بانر.
 *
 * ثلاثة أعطال قادت إلى هذه البنية، كلّها مقيسة على الجهاز:
 *  1. **الارتفاع:** صورة 16:9 بعرض 347dp = 195dp، فالبطاقة 403dp من 557dp مرئية (٧٢٪).
 *     طابور القرارات لا يُمسح بالعين. المصغّرة 80dp تُنزلها إلى ≈140dp — أربع بطاقات بدل ١٫٤.
 *  2. **الشارة فوق الصورة:** تباينها كان رهن صورة العميل لا رهن سطحٍ نعرفه — أي غير مضمون
 *     مع أي بانر فاتح. نزلت إلى سطح البطاقة، فصار الزوج مقيساً في الوضعين.
 *  3. **وعدان لفعل واحد:** البطاقة كلّها زرّ، وفي داخلها صفّ «مراجعة المقال» بسهم يبدو رابطاً
 *     مستقلاً. الصفّ حُذف وبقي السهم الكاشف على حافّة الصفّ — نمط صفّ القائمة القياسي.
 *     أمّا «عرض على موقعك» في S11 فهو **فعل خارجيّ حقيقي**، فيبقى ضاغطاً مستقلاً.
 */
export const ArticleCard = memo(function ArticleCard({ article, variant, accessibilityLabel, onPress, onOpenSite, reviewActionLabel, siteOpenLabel, siteOpenAccessibilityLabel }: ArticleCardProps) {
  const { mode } = useAppTheme();
  const styles = mode === 'dark' ? darkStyles : lightStyles;
  const palette = mode === 'dark' ? darkColors : lightColors;
  const imageUri = article.featuredImage?.bunnyUrl ?? article.featuredImage?.url;
  const isDecision = variant === 'decision';
  const handlePress = useCallback(() => onPress?.(article.id), [article.id, onPress]);
  const handleOpenSite = useCallback(() => { if (article.siteUrl) onOpenSite?.(article.siteUrl); }, [article.siteUrl, onOpenSite]);
  // سطر واحد يحمل ما يُبنى عليه القرار: متى · كم كلمة · كم سؤال ينتظر جواباً.
  const factsLabel = [article.metaLabel, article.questionsLabel, article.citationsLabel].filter(Boolean).join(' · ');

  const content = <>
    <View style={styles.row}>
      {imageUri ? <Image accessibilityLabel={article.featuredImage?.altText ?? article.title} cachePolicy="memory-disk" contentFit="cover" source={imageUri} style={styles.thumbnail} transition={200} /> : null}
      <View style={styles.column}>
        <View style={styles.topRow}>
          {article.statusLabel ? <View style={isDecision ? styles.decisionBadge : styles.publishedBadge}><Text maxFontSizeMultiplier={1} style={isDecision ? styles.decisionBadgeText : styles.publishedBadgeText}>{article.statusLabel}</Text></View> : null}
          {article.categoryLabel ? <Text numberOfLines={1} style={styles.category}>{article.categoryLabel}</Text> : null}
        </View>
        <Text numberOfLines={2} style={styles.title}>{article.title}</Text>
        {factsLabel ? <Text numberOfLines={1} style={styles.facts}>{factsLabel}</Text> : null}
      </View>
      {onPress && reviewActionLabel ? <ModontyIcon name="arrow-left" size={control.iconSize} primary={palette.muted} accent={palette.accent} /> : null}
    </View>
    {article.siteUrl && onOpenSite && siteOpenLabel && siteOpenAccessibilityLabel ? <Pressable accessibilityRole="button" accessibilityLabel={siteOpenAccessibilityLabel} onPress={handleOpenSite} style={({ pressed }) => [styles.siteAction, pressed && styles.pressed]}>
      <ModontyIcon name="arrow-left" size={control.iconSize} primary={styles.siteActionText.color as string} accent={palette.accent} />
      <Text style={styles.siteActionText}>{siteOpenLabel}</Text>
    </Pressable> : null}
  </>;

  return onPress
    // نصّ «مراجعة المقال» لم يعد صفّاً مرسوماً، لكنه لم يُهدَر: صار تلميح الزرّ لقارئ الشاشة،
    // فيسمع الأعمى ما الذي ستفعله الضغطة كما يراه المبصر في السهم الكاشف.
    ? <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} accessibilityHint={reviewActionLabel} onPress={handlePress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>{content}</Pressable>
    : <View style={styles.card}>{content}</View>;
});

const shared = {
  pressed: { opacity: 0.72 },
  card: { borderRadius: radii.card, borderWidth: StyleSheet.hairlineWidth, marginBottom: spacing.sm, minHeight: control.minTouchTarget, padding: spacing.md },
  row: { alignItems: 'center' as const, flexDirection: 'row-reverse' as const, gap: spacing.sm },
  // `flexShrink: 0` لأن الصورة مقاس ثابت لا يتفاوض: بدونها تنكمش أمام نصّ طويل فينزاح الصفّ.
  // و`aspectRatio: 1` يفرض المربّع مهما فعل الصفّ بالارتفاع — قِيس على الجهاز 81×66 قبله.
  thumbnail: { aspectRatio: 1, borderRadius: radii.field, flexShrink: 0, height: media.rowThumbnailSize, width: media.rowThumbnailSize },
  column: { flex: 1, gap: spacing.xxs, minWidth: 0 },
  topRow: { alignItems: 'center' as const, flexDirection: 'row-reverse' as const, gap: spacing.xs },
  badge: { borderRadius: radii.field, paddingHorizontal: spacing.xs, paddingVertical: spacing.xxs },
  badgeText: { fontFamily: fonts.medium, fontSize: typography.tabLabel, lineHeight: typography.lineHeightTabLabel, writingDirection: 'rtl' as const },
  category: { flexShrink: 1, fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  title: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  facts: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  // S11 draws «عرض على موقعك» as a plain teal link — فعل خارجيّ مستقلّ عن فتح البطاقة.
  siteAction: { alignItems: 'center' as const, flexDirection: 'row-reverse' as const, gap: spacing.xs, justifyContent: 'flex-start' as const, marginTop: spacing.xs, minHeight: control.minTouchTarget },
  siteActionText: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, writingDirection: 'rtl' as const },
};

function stylesFor(palette: typeof darkColors) {
  return StyleSheet.create({
    ...shared,
    card: { ...shared.card, backgroundColor: palette.surfaceRaised, borderColor: palette.border },
    // خلفية المصغّرة = حالة تحميل الصورة: كانت فجوة فارغة تُقرأ «البطاقة مكسورة» حتى تصل الصورة.
    thumbnail: { ...shared.thumbnail, backgroundColor: palette.surface },
    // «بانتظار قرارك» ممتلئة لأنها تطلب فعلاً؛ «منشور» محدَّدة لأنها تقرّر حالة مستقرّة.
    // والتعبئة التركوازية ترسب 1.58:1 على البطاقة الفاتحة، فتختفي الشارة تماماً.
    decisionBadge: { ...shared.badge, backgroundColor: palette.warning },
    decisionBadgeText: { ...shared.badgeText, color: palette.onWarning },
    publishedBadge: { ...shared.badge, borderColor: palette.textInteractive, borderWidth: control.inputBorderWidth },
    publishedBadgeText: { ...shared.badgeText, color: palette.textInteractive },
    category: { ...shared.category, color: palette.muted },
    title: { ...shared.title, color: palette.text },
    facts: { ...shared.facts, color: palette.muted },
    siteAction: shared.siteAction,
    siteActionText: { ...shared.siteActionText, color: palette.textInteractive },
  });
}

const darkStyles = stylesFor(darkColors);
const lightStyles = stylesFor(lightColors);
