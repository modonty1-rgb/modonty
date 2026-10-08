import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { NavGroup } from '@/components/ui/NavGroup';
import { Screen } from '@/components/ui/Screen';
import { Bone } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/StateView';
import { useResource } from '@/hooks/useResource';
import { compactNumber, fullDate, plainNumber } from '@/lib/format';
import { useAuth } from '@/providers/AuthProvider';
import { confirm } from '@/providers/confirm';
import { accountApi } from '@/services/api';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, radius, space } from '@/theme/tokens';

const page = (key: 'about' | 'privacy-policy' | 'terms' | 'user-agreement') => () => router.push({ pathname: '/pages/[key]', params: { key } });

function InfoGroup() {
  return (
    <NavGroup
      title="عن مدونتي"
      items={[
        { key: 'about', icon: 'info', label: 'عن مدونتي', onPress: page('about') },
        { key: 'help', icon: 'question', label: 'الأسئلة الشائعة', onPress: () => router.push('/help') },
        { key: 'contact', icon: 'email', label: 'تواصل معنا', onPress: () => router.push('/contact') },
        { key: 'newsletter', icon: 'email', label: 'النشرة البريدية', onPress: () => router.push('/newsletter') },
        { key: 'privacy', icon: 'trust', label: 'سياسة الخصوصية', onPress: page('privacy-policy') },
        { key: 'terms', icon: 'articles', label: 'الشروط والأحكام', onPress: page('terms') },
        { key: 'agreement', icon: 'articles', label: 'اتفاقية المستخدم', onPress: page('user-agreement') },
      ]}
    />
  );
}

/** S15 — حسابي (A8): الملف · الإحصاءات (getProfileStats) · قوائمي · الإعدادات · الخروج. */
export default function AccountScreen() {
  const { status, signOut, setUnread } = useAuth();
  const { colors } = useAppTheme();
  const me = useResource(async (signal) => (status === 'signedIn' ? accountApi.me(signal) : null), [status]);

  useFocusEffect(
    useCallback(() => {
      if (status === 'signedIn') void me.refresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]),
  );
  const d = me.data;
  useEffect(() => {
    if (d) setUnread(d.unreadNotifications);
  }, [d, setUnread]);

  const logout = async () => {
    if (await confirm('تسجيل الخروج', 'ستخرج من حسابك على هذا الجهاز، ولن تصلك إشعاراته هنا.', 'خروج')) await signOut();
  };

  if (status !== 'signedIn') {
    return (
      <Screen>
        <Header title="حسابي" />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.guest, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Icon name="profile" size={control.iconLarge} />
            <AppText variant="sectionTitle" align="center">
              {status === 'loading' ? 'جارٍ التحقّق من الجلسة…' : 'احفظ مقالاتك وتابع الشركاء'}
            </AppText>
            <AppText variant="body" tone="muted" align="center">
              حساب واحد على مدونتي — نفسه على الموقع والتطبيق.
            </AppText>
            <Button label="تسجيل الدخول" icon="login" onPress={() => router.push('/auth/login')} disabled={status === 'loading'} />
            <Button label="إنشاء حساب" kind="outlined" onPress={() => router.push('/auth/register')} disabled={status === 'loading'} />
          </View>
          <InfoGroup />
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="حسابي" />
      <ScrollView contentContainerStyle={styles.content}>
        {me.status === 'loading' && !d ? (
          <View style={styles.profile}>
            <Bone width={control.avatarLarge} height={control.avatarLarge} round />
            <View style={styles.flex}>
              <Bone height={18} width="50%" />
              <Bone height={12} width="70%" />
            </View>
          </View>
        ) : me.status === 'error' && !d ? (
          <ErrorState error={me.error} onRetry={me.reload} what="حسابك" />
        ) : d ? (
          <>
            <View style={styles.profile}>
              {d.user.image ? (
                <Image source={d.user.image} style={styles.avatar} contentFit="cover" accessibilityLabel={d.user.name ?? 'صورتك'} />
              ) : (
                <View style={[styles.avatar, styles.center, { backgroundColor: colors.primaryContainer }]}>
                  <Icon name="profile" tone="onPrimaryContainer" />
                </View>
              )}
              <View style={styles.flex}>
                {d.user.name ? <AppText variant="pageTitle">{d.user.name}</AppText> : null}
                {d.user.email ? (
                  <AppText variant="secondary" tone="muted" style={styles.ltr}>
                    {d.user.email}
                  </AppText>
                ) : null}
                <AppText variant="secondary" tone="muted">
                  {`عضو منذ ${fullDate(d.stats.joinedAt) ?? ''}`}
                </AppText>
              </View>
            </View>
            <View style={[styles.stats, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {[
                { label: 'محفوظ', value: d.stats.favoritesCount },
                { label: 'أتابع', value: d.stats.followingCount },
                { label: 'تعليق', value: d.stats.commentsCount },
                { label: 'إعجاب', value: d.stats.articleLikesCount },
              ].map((s) => (
                <View key={s.label} style={styles.stat} accessible accessibilityLabel={`${plainNumber(s.value)} ${s.label}`}>
                  <AppText variant="sectionTitle">{compactNumber(s.value)}</AppText>
                  <AppText variant="secondary" tone="muted">
                    {s.label}
                  </AppText>
                </View>
              ))}
            </View>
          </>
        ) : null}

        <NavGroup
          title="قوائمي"
          items={[
            { key: 'notifications', icon: 'notifications', label: 'الإشعارات', badge: d && d.unreadNotifications > 0 ? plainNumber(d.unreadNotifications) : null, onPress: () => router.push('/account/notifications') },
            { key: 'favorites', icon: 'bookmark', label: 'المقالات المحفوظة', onPress: () => router.push('/account/favorites') },
            { key: 'following', icon: 'partner', label: 'الشركاء الذين أتابعهم', onPress: () => router.push('/account/following') },
            { key: 'liked', icon: 'like', label: 'ما أعجبني', onPress: () => router.push('/account/liked') },
            { key: 'disliked', icon: 'dislike', label: 'ما لم يعجبني', onPress: () => router.push('/account/disliked') },
            { key: 'reels', icon: 'reels', label: 'ريلزي', onPress: () => router.push('/account/reels') },
            { key: 'comments', icon: 'comment', label: 'تعليقاتي', onPress: () => router.push('/account/comments') },
            { key: 'bookings', icon: 'booking', label: 'حجوزاتي', hint: d && d.stats.bookingsCount > 0 ? `${plainNumber(d.stats.bookingsCount)} طلب` : null, onPress: () => router.push('/account/bookings') },
            { key: 'activity', icon: 'clock', label: 'نشاطي', onPress: () => router.push('/account/activity') },
            { key: 'chat', icon: 'support', label: 'محادثاتي مع مودو', onPress: () => router.push('/chat') },
          ]}
        />
        <NavGroup
          title="الإعدادات"
          items={[
            { key: 'profile', icon: 'profile', label: 'الملف الشخصي', onPress: () => router.push('/account/profile') },
            { key: 'password', icon: 'login', label: d?.user.hasPassword ? 'تغيير كلمة المرور' : 'إنشاء كلمة مرور', onPress: () => router.push('/account/password') },
            { key: 'alerts', icon: 'notifications', label: 'التنبيهات والرسائل', onPress: () => router.push('/account/alerts') },
          ]}
        />
        <InfoGroup />
        <NavGroup
          items={[
            { key: 'logout', icon: 'logout', label: 'تسجيل الخروج', onPress: () => void logout() },
            { key: 'delete', icon: 'error', label: 'حذف الحساب', danger: true, onPress: () => router.push('/account/delete') },
          ]}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.screen, gap: space.section, paddingBottom: space.xxl },
  guest: { borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: space.xl, gap: space.sm, alignItems: 'center' },
  profile: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  avatar: { width: control.avatarLarge, height: control.avatarLarge, borderRadius: radius.pill },
  center: { alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, gap: space.xxs },
  ltr: { writingDirection: 'ltr' },
  stats: { flexDirection: 'row', borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, paddingVertical: space.sm },
  stat: { flex: 1, alignItems: 'center', gap: space.xxs },
});
