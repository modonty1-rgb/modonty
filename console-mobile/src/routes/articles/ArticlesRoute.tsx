import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fixtureArticles } from '@/src/data/client-fixtures';
import { Card, Screen, SectionTitle, StatusPill } from '@/src/components/ui/MobileUI';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { fonts } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

const labels = { AWAITING_APPROVAL: 'بانتظار اعتمادك', NEEDS_REVISION: 'يحتاج تعديل', PUBLISHED: 'منشور', DRAFT: 'مسودة', WRITING: 'قيد الكتابة', SCHEDULED: 'مجدول', PUBLISHED_ON_CLIENT_SITE: 'منشور', ARCHIVED: 'مؤرشف' };

export function ArticlesRoute({ onReview }: { onReview: () => void }) {
  const { theme } = useAppTheme();
  return <Screen title="المقالات" icon="articles">
    <Card style={styles.summary}><View><Text style={[styles.summaryValue, { color: theme.colors.text }]}>1</Text><Text style={[styles.summaryLabel, { color: theme.colors.muted }]}>يحتاج قرارك</Text></View><View style={[styles.summaryIcon, { borderColor: theme.colors.border }]}><ModontyIcon name="articles" size={29} primary={theme.colors.text} accent={theme.colors.primary}/></View></Card>
    <SectionTitle>تحتاج مراجعتك</SectionTitle>
    {fixtureArticles.map((article) => <Pressable key={article.id} onPress={onReview} accessibilityRole="button" accessibilityLabel={`مراجعة ${article.title}`}><Card style={styles.articleCard}><View style={styles.cardTop}><StatusPill tone={article.status === 'AWAITING_APPROVAL' ? 'primary' : 'warning'}>{labels[article.status]}</StatusPill><Text style={[styles.date, { color: theme.colors.muted }]}>آخر تعديل اليوم</Text></View><Text style={[styles.articleTitle, { color: theme.colors.text }]}>{article.title}</Text><Text numberOfLines={2} style={[styles.excerpt, { color: theme.colors.muted }]}>{article.excerpt}</Text><View style={[styles.cardFooter, { borderTopColor: theme.colors.border }]}><Text style={[styles.reviewLink, { color: theme.colors.primary }]}>{article.status === 'AWAITING_APPROVAL' ? 'مراجعة واتخاذ قرار' : 'عرض الملاحظات'}</Text><ModontyIcon name="articles" size={18} primary={theme.colors.muted} accent={theme.colors.primary}/></View></Card></Pressable>)}
  </Screen>;
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18 },
  summaryValue: { fontFamily: fonts.medium, fontSize: 25, lineHeight: 32, textAlign: 'right' },
  summaryLabel: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, writingDirection: 'rtl' },
  summaryIcon: { width: 52, height: 52, borderRadius: 26, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  articleCard: { marginBottom: 12 }, cardTop: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 16, writingDirection: 'rtl' },
  articleTitle: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 24, textAlign: 'right', writingDirection: 'rtl', marginTop: 14 },
  excerpt: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 21, textAlign: 'right', writingDirection: 'rtl', marginTop: 5 },
  cardFooter: { marginTop: 14, paddingTop: 13, borderTopWidth: 1, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  reviewLink: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 20, writingDirection: 'rtl' },
});
