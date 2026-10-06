import { Image } from 'expo-image';
import { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { GroupRow } from '@/src/components/ui/Nabd';
import type { ArticleListItem } from '@/src/services/articles-api';
import { fonts, media, radii, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type PublishedArticleCardProps = {
  article: ArticleListItem;
  accessibilityLabel: string;
  onOpen: (url: string) => void;
  /** موضعه في المجموعة المقطّعة — يحدّد زواياه (٢٤ للأطراف و٨ بينها). */
  position: 'only' | 'first' | 'middle' | 'last';
};

/**
 * مقال **منشور** — صفّ في مجموعة «نبض» المقطّعة: مصغّرة ٦٤ · العنوان · التاريخ والطول.
 * الصفّ كلّه رابط: كل فتحة زيارة حقيقية لموقع العميل.
 *
 * سطر «اقرأه كما يراه الزائر + modonty.com» سقط من كل بطاقة (خالد ٥ أكتوبر ٢٠٢٦: نفس الجملة
 * ونفس النطاق تحت كل مقال = ضجيج). أين تذهب الضغطة يُقال **مرّة** في سطر العنوان الفرعي من
 * الخادم، والقارئ الصوتي يسمعه في `accessibilityLabel` لكل صفّ.
 */
export const PublishedArticleCard = memo(function PublishedArticleCard({ article, accessibilityLabel, onOpen, position }: PublishedArticleCardProps) {
  const { theme } = useAppTheme();
  const imageUri = article.featuredImage?.bunnyUrl ?? article.featuredImage?.url;
  const canOpen = typeof article.siteUrl === 'string' && article.siteUrl.length > 0;
  const handleOpen = useCallback(() => { if (article.siteUrl) onOpen(article.siteUrl); }, [article.siteUrl, onOpen]);

  return <GroupRow position={position} onPress={canOpen ? handleOpen : undefined} accessibilityRole="link" accessibilityLabel={accessibilityLabel}>
    <View style={styles.top}>
      {imageUri ? <Image accessibilityLabel={article.featuredImage?.altText ?? article.title} cachePolicy="memory-disk" contentFit="cover" source={imageUri} style={[styles.thumbnail, { backgroundColor: theme.colors.surfaceRaised }]} transition={200} /> : null}
      <View style={styles.column}>
        <Text numberOfLines={2} style={[styles.title, { color: theme.colors.text }]}>{article.title}</Text>
        {article.metaLabel ? <Text numberOfLines={1} style={[styles.secondary, { color: theme.colors.muted }]}>{article.metaLabel}</Text> : null}
      </View>
    </View>
  </GroupRow>;
});

const styles = StyleSheet.create({
  top: { flexDirection: 'row-reverse', gap: spacing.sm },
  thumbnail: { aspectRatio: 1, borderRadius: radii.field, flexShrink: 0, height: media.thumbnailSize, width: media.thumbnailSize },
  column: { flex: 1, gap: spacing.xxs, minWidth: 0 },
  title: { fontFamily: fonts.medium, fontSize: typography.body, lineHeight: typography.lineHeightBody, textAlign: 'right', writingDirection: 'rtl' },
  secondary: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl' },
});
