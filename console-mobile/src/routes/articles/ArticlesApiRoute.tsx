import { FlashList } from '@shopify/flash-list';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { EmptyState } from '@/src/components/ui/MobileUI';
import { MobileArticle } from '@/src/services/mobile-api';
import { fonts } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type ArticlesApiRouteProps = { articles: MobileArticle[] | null; error: string | null; onRetry: () => void; onReview: (id: string) => void };
const labels: Record<string, string> = { AWAITING_APPROVAL: 'بانتظار اعتمادك', NEEDS_REVISION: 'يحتاج تعديل', PUBLISHED: 'منشور', DRAFT: 'مسودة', WRITING: 'قيد الكتابة', SCHEDULED: 'مجدول', PUBLISHED_ON_CLIENT_SITE: 'منشور', ARCHIVED: 'مؤرشف' };

export function ArticlesApiRoute({ articles, error, onRetry, onReview }: ArticlesApiRouteProps) {
  const { theme } = useAppTheme();
  const renderItem = useCallback(({ item }: { item: MobileArticle }) => <ArticleItem article={item} onReview={onReview} />, [onReview]);
  if (error) return <View style={styles.state}><EmptyState icon="articles" title="تعذّر تحميل المقالات" copy={error} actionLabel="إعادة المحاولة" onAction={onRetry} /></View>;
  if (articles === null) return <View style={styles.state}><View style={[styles.skeleton, { backgroundColor: theme.colors.surfaceRaised }]} /><View style={[styles.skeleton, { backgroundColor: theme.colors.surfaceRaised }]} /><View style={[styles.skeleton, { backgroundColor: theme.colors.surfaceRaised }]} /></View>;
  if (articles.length === 0) return <View style={styles.state}><EmptyState icon="articles" title="لا توجد مقالات الآن" copy="سنظهر المقالات هنا عند توفرها." actionLabel="إعادة التحميل" onAction={onRetry} /></View>;
  return <FlashList data={articles} renderItem={renderItem} keyExtractor={keyOf} contentContainerStyle={styles.list} ListHeaderComponent={<View style={styles.header}><ModontyIcon name="articles" size={22} primary={theme.colors.text} accent={theme.colors.primary}/><Text style={[styles.title, { color: theme.colors.text }]}>المقالات</Text></View>} />;
}

const keyOf = (article: MobileArticle) => article.id;
const ArticleItem = memo(function ArticleItem({ article, onReview }: { article: MobileArticle; onReview: (id: string) => void }) { const { theme } = useAppTheme(); return <Pressable accessibilityRole="button" accessibilityLabel={`مراجعة ${article.title}`} onPress={() => onReview(article.id)} style={[styles.item, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}><View style={styles.itemTop}><Text style={[styles.status, { color: theme.colors.primary }]}>{labels[article.status] ?? article.status}</Text><ModontyIcon name="articles" size={20} primary={theme.colors.muted} accent={theme.colors.primary}/></View><Text numberOfLines={2} style={[styles.articleTitle, { color: theme.colors.text }]}>{article.title}</Text>{article.excerpt ? <Text numberOfLines={2} style={[styles.excerpt, { color: theme.colors.muted }]}>{article.excerpt}</Text> : null}</Pressable>; });

const styles = StyleSheet.create({ state: { flex: 1, paddingHorizontal: 18, paddingTop: 18 }, skeleton: { height: 136, borderRadius: 20, marginBottom: 12 }, list: { paddingHorizontal: 18, paddingBottom: 96 }, header: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginTop: 18, marginBottom: 22 }, title: { fontFamily: fonts.medium, fontSize: 18, lineHeight: 26, writingDirection: 'rtl' }, item: { borderWidth: 1, borderRadius: 20, padding: 16, marginBottom: 12 }, itemTop: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }, status: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 18, writingDirection: 'rtl' }, articleTitle: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 24, textAlign: 'right', writingDirection: 'rtl', marginTop: 12 }, excerpt: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, textAlign: 'right', writingDirection: 'rtl', marginTop: 8 } });
