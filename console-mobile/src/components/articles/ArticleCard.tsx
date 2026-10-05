import { Image } from 'expo-image';
import { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { PillButton, StatusBadge, TonalCard } from '@/src/components/ui/Nabd';
import type { ArticleListItem } from '@/src/services/articles-api';
import { fonts, media, radii, spacing, typography } from '@/src/theme/tokens';
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
 * بطاقة مقال **ينتظر قرارك** — «نبض»: سطح نغمي بلا حدّ، مصغّرة ٨٠، شارة الحالة (نصّ + ساعة +
 * لون)، ثم شارات ما يُبنى عليه القرار (كم سؤالاً · كم استشهاداً)، ثم زرّ «مراجعة المقال» صريح.
 *
 * الزرّ هو الفعل الوحيد: البطاقة نفسها لا تُضغط، فلا وعدان لفعل واحد (كان السهم الكاشف على
 * حافّة الصفّ وعداً ثانياً). والمصغّرة ٨٠ لا بانر ١٦:٩ — الطابور يُمسح بالعين (مقيس سابقاً:
 * البانر أكل ٧٢٪ من الشاشة فلم يظهر المقال الثاني).
 */
export const ArticleCard = memo(function ArticleCard({ article, accessibilityLabel, onPress, reviewActionLabel }: ArticleCardProps) {
  const { theme } = useAppTheme();
  const imageUri = article.featuredImage?.bunnyUrl ?? article.featuredImage?.url;
  const handlePress = useCallback(() => onPress?.(article.id), [article.id, onPress]);

  return <TonalCard style={styles.card}>
    <View style={styles.row}>
      {imageUri ? <Image accessibilityLabel={article.featuredImage?.altText ?? article.title} cachePolicy="memory-disk" contentFit="cover" source={imageUri} style={[styles.thumbnail, { backgroundColor: theme.colors.surfaceRaised }]} transition={200} /> : null}
      <View style={styles.column}>
        {article.statusLabel ? <StatusBadge label={article.statusLabel} tone="warning" /> : null}
        <Text numberOfLines={2} style={[styles.title, { color: theme.colors.text }]}>{article.title}</Text>
        {article.metaLabel ? <Text numberOfLines={1} style={[styles.secondary, { color: theme.colors.muted }]}>{article.metaLabel}</Text> : null}
      </View>
    </View>
    {article.questionsLabel || article.citationsLabel || article.categoryLabel ? <View style={styles.chips}>
      {article.questionsLabel ? <StatusBadge label={article.questionsLabel} tone="neutral" icon="question" /> : null}
      {article.citationsLabel ? <StatusBadge label={article.citationsLabel} tone="neutral" icon="link" /> : null}
      {article.categoryLabel ? <Text numberOfLines={1} style={[styles.secondary, styles.category, { color: theme.colors.muted }]}>{article.categoryLabel}</Text> : null}
    </View> : null}
    {onPress && reviewActionLabel ? <PillButton label={reviewActionLabel} icon="arrow-left" size="medium" glow={false} haptic="light" onPress={handlePress} accessibilityLabel={accessibilityLabel} /> : null}
  </TonalCard>;
});

const styles = StyleSheet.create({
  card: { gap: spacing.sm, marginBottom: spacing.sm },
  row: { flexDirection: 'row-reverse', gap: spacing.sm },
  // `flexShrink: 0` و`aspectRatio: 1`: مقاس ثابت لا يتفاوض مع نصّ طويل (قِيس 81×66 قبلهما).
  thumbnail: { aspectRatio: 1, borderRadius: radii.field, flexShrink: 0, height: media.rowThumbnailSize, width: media.rowThumbnailSize },
  column: { flex: 1, gap: spacing.xs, minWidth: 0 },
  title: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right', writingDirection: 'rtl' },
  secondary: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl' },
  chips: { alignItems: 'center', flexDirection: 'row-reverse', flexWrap: 'wrap', gap: spacing.xs },
  category: { flexShrink: 1 },
});
