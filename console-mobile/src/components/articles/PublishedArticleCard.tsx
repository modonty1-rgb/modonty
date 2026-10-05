import { Image } from 'expo-image';
import { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { GroupRow } from '@/src/components/ui/Nabd';
import type { ArticleListItem } from '@/src/services/articles-api';
import { control, fonts, media, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type PublishedArticleCardProps = {
  article: ArticleListItem;
  accessibilityLabel: string;
  openLabel: string;
  onOpen: (url: string) => void;
  /** موضعه في المجموعة المقطّعة — يحدّد زواياه (٢٤ للأطراف و٨ بينها). */
  position: 'only' | 'first' | 'middle' | 'last';
};

/**
 * مقال **منشور** — صفّ في مجموعة «نبض» المقطّعة: مصغّرة ٦٤ · العنوان · التاريخ والطول، ثم
 * سطرٌ يقول أين تذهب الضغطة **قبل** أن تُضغط (النطاق الفعلي `siteHost`) ومعه الفعل نفسه.
 * الصفّ كلّه رابط: كل فتحة زيارة حقيقية لموقع العميل.
 */
export const PublishedArticleCard = memo(function PublishedArticleCard({ article, accessibilityLabel, openLabel, onOpen, position }: PublishedArticleCardProps) {
  const { theme } = useAppTheme();
  const imageUri = article.featuredImage?.bunnyUrl ?? article.featuredImage?.url;
  const canOpen = typeof article.siteUrl === 'string' && article.siteUrl.length > 0;
  const handleOpen = useCallback(() => { if (article.siteUrl) onOpen(article.siteUrl); }, [article.siteUrl, onOpen]);

  return <GroupRow position={position} onPress={canOpen ? handleOpen : undefined} accessibilityRole="link" accessibilityLabel={accessibilityLabel} style={styles.row}>
    <View style={styles.top}>
      {imageUri ? <Image accessibilityLabel={article.featuredImage?.altText ?? article.title} cachePolicy="memory-disk" contentFit="cover" source={imageUri} style={[styles.thumbnail, { backgroundColor: theme.colors.surfaceRaised }]} transition={200} /> : null}
      <View style={styles.column}>
        <Text numberOfLines={2} style={[styles.title, { color: theme.colors.text }]}>{article.title}</Text>
        {article.metaLabel ? <Text numberOfLines={1} style={[styles.secondary, { color: theme.colors.muted }]}>{article.metaLabel}</Text> : null}
      </View>
    </View>
    {canOpen ? <View style={styles.footer}>
      {article.siteHost ? <Text numberOfLines={1} style={[styles.host, { color: theme.colors.muted }]}>{article.siteHost}</Text> : <View />}
      <View style={styles.link}>
        <ModontyIcon name="link" size={control.iconSizeInline} primary={theme.colors.textInteractive} accent={theme.colors.accent} />
        {/* سطر واحد: بلا حدّ أسطر يقيس أندرويد التسمية أضيق من رسمها فتسقط «الزائر» لسطر ثانٍ مقصوص (قِيس ٥ أكتوبر).  */}
        <Text numberOfLines={1} style={[styles.linkText, { color: theme.colors.textInteractive }]}>{openLabel}</Text>
      </View>
    </View> : null}
  </GroupRow>;
});

const styles = StyleSheet.create({
  row: { gap: spacing.xs },
  top: { flexDirection: 'row-reverse', gap: spacing.sm },
  thumbnail: { aspectRatio: 1, borderRadius: radii.field, flexShrink: 0, height: media.thumbnailSize, width: media.thumbnailSize },
  column: { flex: 1, gap: spacing.xxs, minWidth: 0 },
  title: { fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl' },
  secondary: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl' },
  footer: { alignItems: 'center', flexDirection: 'row-reverse', justifyContent: 'space-between', minHeight: spacing.xxl },
  // النطاق يُقرأ يساراً كأي عنوان شبكة، ولو كانت الشاشة عربية.
  host: { flexShrink: 1, fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, writingDirection: 'ltr' },
  link: { alignItems: 'center', flexDirection: 'row-reverse', gap: spacing.xxs },
  linkText: { fontFamily: fonts.medium, fontSize: typography.label, lineHeight: typography.lineHeightLabel, writingDirection: 'rtl' },
});
