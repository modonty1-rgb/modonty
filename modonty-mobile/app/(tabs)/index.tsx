import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FeedCard } from '@/components/content/FeedCard';
import { FollowButton } from '@/components/content/FollowButton';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { PagedList } from '@/components/ui/PagedList';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Tap } from '@/components/ui/Tap';
import { Screen } from '@/components/ui/Screen';
import { usePagedList } from '@/hooks/usePagedList';
import { toArticleCard, type ArticleCardModel } from '@/lib/models';
import { open } from '@/lib/nav';
import { useAuth } from '@/providers/AuthProvider';
import { contentApi } from '@/services/api';
import type { HomeData } from '@/services/api-types';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, radius, space } from '@/theme/tokens';

type Sections = Omit<HomeData, 'articles' | 'hasMore'>;

/** نفس بطاقات وقت القراءة في الموقع (ArticlesList · ReadingTimeBucket). */
const READING_TIMES = [
  { key: 'short', title: 'على الماشي', hint: '٣ دقائق أو أقل' },
  { key: 'medium', title: 'فنجان قهوة', hint: '٤ إلى ٧ دقائق' },
  { key: 'long', title: 'جلسة روقان', hint: '٨ دقائق فأكثر' },
] as const;

/** S01 — الرئيسية: نفس قراءات صفحة الويب الأولى (`GET /home`)، ثم صفحات الفيد (`GET /articles?page`). */
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { unreadNotifications, requireAuth } = useAuth();
  const sections = useRef<Sections | null>(null);
  // من يتابع مدونتي لا يُطلب منه المتابعة (ملاحظة خالد ٨ أكتوبر) — يختفي البانر لحظة ثبوت المتابعة.
  const [followsModonty, setFollowsModonty] = useState(false);

  const list = usePagedList<ArticleCardModel, number>(async (page, signal) => {
    if (page === null) {
      const home = await contentApi.home(signal);
      const { articles, hasMore, ...rest } = home;
      sections.current = rest;
      return { items: articles.map(toArticleCard), next: hasMore ? 2 : null };
    }
    const next = await contentApi.articles({ page }, signal);
    return { items: next.items.map(toArticleCard), next: next.hasMore ? page + 1 : null };
  }, []);

  // تصميم الموقع: الأولى واجهة، والبقيّة مدمجة (MobilePostCard).
  const renderItem = useCallback(
    ({ item, index }: { item: ArticleCardModel; index: number }) => <FeedCard item={item} onOpen={open.article} hero={index === 0} />,
    [],
  );
  const s = list.status === 'success' ? sections.current : null;

  // ترتيب الموقع على الجوال (جرد الجوّال ٣ أكتوبر، لقطة ١): «أحدث المقالات» ثم وقت القراءة ثم الفيد.
  // الطلّات والمجالات والشركاء لها تبويباتها وصفحاتها — الرئيسية للقراءة.
  const header = (
    <View style={styles.sections}>
      {s?.coreClientSlug && !followsModonty ? (
        <View style={[styles.follow, { backgroundColor: colors.primaryContainer }]}>
          <AppText variant="label" tone="onPrimaryContainer" style={styles.flex}>
            تابع مدونتي ليصلك كل جديد
          </AppText>
          <FollowButton slug={s.coreClientSlug} compact onFollowingChange={setFollowsModonty} />
        </View>
      ) : null}
      <SectionHeader title="أحدث المقالات" onMore={() => router.push('/articles')} moreLabel="الأرشيف" />
      <View style={styles.times}>
        {READING_TIMES.map((t) => (
          <Tap
            key={t.key}
            label={`${t.title} — ${t.hint}`}
            role="link"
            onPress={() => router.push({ pathname: '/articles', params: { time: t.key, title: t.title } })}
            style={[styles.time, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Icon name="clock" size={control.iconSmall} tone="interactive" />
            <AppText variant="label" numberOfLines={1}>
              {t.title}
            </AppText>
            <AppText variant="secondary" tone="muted" numberOfLines={1}>
              {t.hint}
            </AppText>
          </Tap>
        ))}
      </View>
    </View>
  );

  return (
    <Screen>
      <View style={[styles.top, { paddingTop: insets.top, backgroundColor: colors.page, borderBottomColor: colors.border }]}>
        {/* مثل رأس الموقع على الجوال (TopNav.tsx): الشعار · خانة بحث عريضة · الحساب — الخانة تبدو «اكتب هنا» من أوّل نظرة. */}
        <View style={styles.topRow}>
          <Image source={require('../../assets/brand/modonty-mark.png')} style={styles.mark} contentFit="contain" accessibilityLabel="مدونتي" />
          <Tap
            label="ابحث في المقالات والشركاء"
            onPress={() => router.navigate('/search')}
            style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Icon name="search" size={control.iconSmall} tone="muted" />
            <AppText variant="secondary" tone="muted" numberOfLines={1} style={styles.flex}>
              بحث متقدم
            </AppText>
          </Tap>
          <IconButton
            icon="notifications"
            label={unreadNotifications > 0 ? 'الإشعارات — غير مقروءة' : 'الإشعارات'}
            onPress={() => requireAuth(() => router.push('/account/notifications'))}
          />
          {/* «حسابي» خرج من الشريط السفلي (تابات الموقع السبع) — مكانه رأس الرئيسية كما في رأس الموقع. */}
          <IconButton icon="profile" label="حسابي" onPress={() => router.navigate('/account')} />

        </View>
      </View>
      <PagedList
        list={list}
        renderItem={renderItem}
        keyOf={(a) => a.key}
        what="الرئيسية"
        header={header}
        inTabs
        empty={{ icon: 'articles', title: 'لا توجد مقالات منشورة بعد', body: 'عُد لاحقاً — المقالات تُنشر هنا فور اعتمادها.', actionLabel: 'تحديث', onAction: list.reload }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { borderBottomWidth: StyleSheet.hairlineWidth },
  topRow: { height: control.header, flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingStart: space.screen, paddingEnd: space.xxs },
  mark: { width: 36, height: 36 },
  searchBox: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.sm,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  flex: { flex: 1 },
  times: { flexDirection: 'row', gap: space.xs, paddingHorizontal: space.screen },
  time: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: space.sm, paddingHorizontal: space.xxs, borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth },
  sections: { gap: space.section, paddingTop: space.md },
  block: { gap: space.sm },
  hList: { paddingHorizontal: space.screen, gap: space.xs },
  follow: {
    marginHorizontal: space.screen,
    borderRadius: radius.card,
    padding: space.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  pill: {
    minHeight: control.touch,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
  },
  partners: { paddingHorizontal: space.screen, gap: space.xs },
  partner: {
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: space.card,
    paddingVertical: space.sm,
    gap: space.xxs,
    justifyContent: 'center',
  },
});
