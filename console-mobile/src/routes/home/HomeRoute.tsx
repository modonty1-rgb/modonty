import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { MobileDashboard } from '@/src/services/mobile-api';
import { fonts } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type HomeRouteProps = {
  clientName?: string;
  dashboard: MobileDashboard | null;
  onOpenArticles: () => void;
  onOpenAudience: () => void;
  onOpenSubscription: () => void;
};

const statusLabels: Record<string, string> = {
  WRITING: 'قيد الكتابة', DRAFT: 'مسودة', AWAITING_APPROVAL: 'بانتظار الموافقة', NEEDS_REVISION: 'يحتاج تعديل', SCHEDULED: 'مجدول', PUBLISHED: 'منشور', PUBLISHED_ON_CLIENT_SITE: 'منشور على موقعك', ARCHIVED: 'مؤرشف',
};

export function HomeRoute({ clientName, dashboard, onOpenArticles, onOpenAudience, onOpenSubscription }: HomeRouteProps) {
  const { theme } = useAppTheme();
  const summary = dashboard?.summary;
  const pendingTotal = summary ? summary.pendingApproval + summary.pendingQuestions + summary.pendingComments + summary.pendingVideos : 0;
  const cards = [
    { key: 'approval', value: summary?.pendingApproval ?? 0, label: 'مقال يحتاج قرارك', icon: 'articles' as const, onPress: onOpenArticles },
    { key: 'questions', value: summary?.pendingQuestions ?? 0, label: 'سؤال جديد', icon: 'question' as const, onPress: onOpenAudience },
    { key: 'comments', value: summary?.pendingComments ?? 0, label: 'تعليق للمراجعة', icon: 'comment' as const, onPress: onOpenAudience },
    { key: 'videos', value: summary?.pendingVideos ?? 0, label: 'فيديو للمراجعة', icon: 'reels' as const, onPress: onOpenArticles },
  ];
  return <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.pageTitle}><ModontyIcon name="home" size={22} primary={theme.colors.text} accent={theme.colors.primary} /><Text maxFontSizeMultiplier={1} style={[styles.pageTitleText, { color: theme.colors.text }]}>الرئيسية</Text></View>
    <Text maxFontSizeMultiplier={1} style={[styles.greeting, { color: theme.colors.text }]}>مرحبًا، {clientName ?? 'بك'}</Text>
    <Text maxFontSizeMultiplier={1} style={[styles.subtitle, { color: theme.colors.muted }]}>متابعة نشاطك اليوم</Text>
    <View style={[styles.summary, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}><View><Text style={[styles.summaryKicker, { color: theme.colors.muted }]}>يحتاج متابعة</Text><Text style={[styles.summaryValue, { color: theme.colors.text }]}>{pendingTotal}</Text><Text style={[styles.summaryCopy, { color: theme.colors.muted }]}>{pendingTotal === 0 ? 'كل الأمور محدثة' : 'عناصر تحتاج اهتمامك'}</Text></View><View style={[styles.summaryIcon, { borderColor: theme.colors.primary }]}><ModontyIcon name="notifications" size={29} primary={theme.colors.text} accent={theme.colors.primary} /></View></View>
    {dashboard?.subscription ? <Pressable accessibilityRole="button" accessibilityLabel="عرض تفاصيل الاشتراك" onPress={onOpenSubscription} style={[styles.subscription, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}><ModontyIcon name="toc" size={24} primary={theme.colors.text} accent={theme.colors.primary}/><View style={styles.subscriptionCopy}><Text style={[styles.subscriptionTitle, { color: theme.colors.text }]}>اشتراكك {dashboard.subscription.statusLabel}</Text><Text style={[styles.subscriptionMeta, { color: theme.colors.muted }]}>{dashboard.subscription.tierName}</Text>{dashboard.subscription.daysRemaining !== null ? <Text style={[styles.subscriptionMeta, { color: theme.colors.muted }]}>{dashboard.subscription.daysRemaining} يومًا متبقيًا</Text> : null}</View><Text style={[styles.all, { color: theme.colors.primary }]}>التفاصيل</Text></Pressable> : null}
    <Text maxFontSizeMultiplier={1} style={[styles.sectionTitle, { color: theme.colors.text }]}>ما يحتاج إجراء</Text>
    <View style={styles.grid}>{cards.map((card) => <Pressable key={card.key} onPress={card.onPress} style={[styles.metric, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}><ModontyIcon name={card.icon} size={20} primary={theme.colors.text} accent={theme.colors.primary}/><Text style={[styles.metricValue, { color: theme.colors.text }]}>{card.value}</Text><Text style={[styles.metricLabel, { color: theme.colors.muted }]}>{card.label}</Text></Pressable>)}</View>
    <View style={styles.sectionHeading}><Pressable onPress={onOpenArticles}><Text style={[styles.all, { color: theme.colors.primary }]}>عرض المقالات</Text></Pressable><Text maxFontSizeMultiplier={1} style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 0 }]}>آخر المقالات</Text></View>
    <View style={[styles.articleList, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>{dashboard?.recentArticles.length ? dashboard.recentArticles.map((article, index) => <Pressable key={article.id} onPress={onOpenArticles} style={[styles.articleRow, index > 0 && { borderTopColor: theme.colors.border, borderTopWidth: 1 }]}><ModontyIcon name="articles" size={20} primary={theme.colors.muted} accent={theme.colors.primary}/><View style={styles.articleCopy}><Text numberOfLines={2} style={[styles.articleTitle, { color: theme.colors.text }]}>{article.title}</Text><Text style={[styles.articleStatus, { color: theme.colors.muted }]}>{statusLabels[article.status] ?? article.status}</Text></View></Pressable>) : <Text style={[styles.empty, { color: theme.colors.muted }]}>لا توجد مقالات لعرضها الآن.</Text>}</View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingBottom: 22 }, pageTitle: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginTop: 18 }, pageTitleText: { fontFamily: fonts.medium, fontSize: 18, writingDirection: 'rtl' }, greeting: { fontFamily: fonts.medium, fontSize: 19, textAlign: 'right', writingDirection: 'rtl', marginTop: 26 }, subtitle: { fontFamily: fonts.regular, fontSize: 13, textAlign: 'right', writingDirection: 'rtl', marginTop: 4 }, summary: { marginTop: 22, padding: 18, borderWidth: 1, borderRadius: 20, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' }, summaryKicker: { fontFamily: fonts.regular, fontSize: 12, writingDirection: 'rtl' }, summaryValue: { fontFamily: fonts.medium, fontSize: 31, lineHeight: 39, marginTop: 2 }, summaryCopy: { fontFamily: fonts.regular, fontSize: 12, writingDirection: 'rtl' }, summaryIcon: { width: 54, height: 54, borderRadius: 27, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, sectionTitle: { fontFamily: fonts.medium, fontSize: 16, textAlign: 'right', writingDirection: 'rtl', marginTop: 25, marginBottom: 12 }, grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 10 }, metric: { width: '48.5%', minHeight: 112, borderWidth: 1, borderRadius: 16, padding: 13, alignItems: 'flex-end' }, metricValue: { fontFamily: fonts.medium, fontSize: 23, lineHeight: 29, marginTop: 9 }, metricLabel: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 17, textAlign: 'right', writingDirection: 'rtl', marginTop: 2 }, sectionHeading: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'baseline' }, all: { fontFamily: fonts.medium, fontSize: 12, writingDirection: 'rtl' }, articleList: { borderWidth: 1, borderRadius: 18, overflow: 'hidden' }, articleRow: { minHeight: 72, paddingHorizontal: 14, flexDirection: 'row-reverse', alignItems: 'center', gap: 12 }, articleCopy: { flex: 1, alignItems: 'flex-end' }, articleTitle: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 20, textAlign: 'right', writingDirection: 'rtl' }, articleStatus: { fontFamily: fonts.regular, fontSize: 11, marginTop: 3, writingDirection: 'rtl' }, empty: { fontFamily: fonts.regular, fontSize: 13, textAlign: 'center', writingDirection: 'rtl', padding: 24 },
  subscription: { minHeight: 88, marginTop: 12, padding: 16, borderWidth: 1, borderRadius: 20, flexDirection: 'row-reverse', alignItems: 'center', gap: 12 }, subscriptionCopy: { flex: 1, alignItems: 'flex-end' }, subscriptionTitle: { fontFamily: fonts.medium, fontSize: 14, writingDirection: 'rtl' }, subscriptionMeta: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, writingDirection: 'rtl', marginTop: 2 },
});
