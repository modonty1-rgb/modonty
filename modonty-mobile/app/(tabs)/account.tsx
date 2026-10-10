import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ModontyIconName } from '@/components/brand/ModontyIcon';
import { useTabBottomInset } from '@/components/navigation/NavScroll';
import { Icon } from '@/components/ui/Icon';
import { RowGroup } from '@/components/ui/RowGroup';
import { Screen } from '@/components/ui/Screen';
import { Bone } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/StateView';
import { Tap } from '@/components/ui/Tap';
import { useResource } from '@/hooks/useResource';
import { setAppearance, useAppearancePref, type AppearancePref } from '@/lib/appearance';
import { plainNumber } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { open } from '@/lib/nav';
import { setReadingPrefs, useReadingPrefs } from '@/lib/reading-prefs';
import { useAuth } from '@/providers/AuthProvider';
import { confirm } from '@/providers/confirm';
import { accountApi } from '@/services/api';
import { meApi } from '@/services/api-actions';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds, dsFontScale, type AppColors } from '@/theme/tokens';

const JOINED = new Intl.DateTimeFormat('ar-SA-u-ca-gregory', { month: 'long', year: 'numeric', timeZone: 'Asia/Riyadh' });

/**
 * الحساب — Screens B · 11. الرأس: الصورة (أو أوّل حرف) · الاسم · «عضو منذ …» · تعديل الملف.
 * أربع مربّعات لما يرجع له القارئ: المحفوظة · أتابعهم · حجوزاتي (وما ينتظر التواصل) · الإشعارات الجديدة.
 * «محفوظة للقراءة» بطاقات · «شركاء تتابعهم» شعارات + «اكتشف» · «نشاطي» ٤ صفوف + سجلّ النشاط ·
 * الإعدادات: المظهر وحجم خطّ القراءة يتغيّران في مكانهما · كلمة المرور والتنبيهات · «عن مدونتي والسياسات» صفّ واحد ·
 * الخروج · حذف الحساب.
 */
export default function AccountScreen() {
  const tabInset = useTabBottomInset();
  const insets = useSafeAreaInsets();
  const { status, signOut, setUnread } = useAuth();
  const { colors } = useAppTheme();
  const signedIn = status === 'signedIn';
  const me = useResource(async (signal) => (signedIn ? accountApi.me(signal) : null), [signedIn]);
  // المحفوظة والمتابَعون والحجوزات: لعرض البطاقات والشعارات وما ينتظر التواصل — طلب واحد لكلٍّ عند الفتح.
  const lists = useResource(
    async (signal) => {
      if (!signedIn) return null;
      const [fav, fol, book] = await Promise.allSettled([accountApi.favorites(signal), accountApi.following(signal), meApi.bookings(signal)]);
      return {
        saved: fav.status === 'fulfilled' ? fav.value.items.slice(0, 10) : [],
        following: fol.status === 'fulfilled' ? fol.value.items.slice(0, 6) : [],
        waiting: book.status === 'fulfilled' ? book.value.items.filter((b) => !b.status || b.status === 'new').length : 0,
      };
    },
    [signedIn],
  );

  useFocusEffect(
    useCallback(() => {
      if (signedIn) {
        void me.refresh();
        void lists.refresh();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signedIn]),
  );
  const d = me.data;
  const l = lists.data;
  useEffect(() => {
    if (d) setUnread(d.unreadNotifications);
  }, [d, setUnread]);

  const logout = async () => {
    if (await confirm('تسجيل الخروج', 'ستخرج من حسابك على هذا الجهاز، ولن تصلك إشعاراته هنا.', 'خروج')) await signOut();
  };

  return (
    <Screen>
      {/* شجرة جديدة عند تبدّل الدخول/الخروج: أندرويد يُبقي قياسات النصوص القديمة فتظهر بطاقة الزائر بفراغات
          ونصوص مزاحة حتى إعادة الفتح (مقيس ١٠ أكتوبر بعد «تسجيل الخروج»). */}
      <ScrollView key={signedIn ? 'in' : 'out'} contentContainerStyle={{ paddingTop: insets.top + ds.space.s3, paddingBottom: tabInset + ds.space.s4 }}>
        {!signedIn ? (
          <Guest loading={status === 'loading'} />
        ) : me.status === 'loading' && !d ? (
          <View style={styles.head}>
            <Bone width={64} height={64} />
            <View style={styles.flex}>
              <Bone height={24} width="50%" />
              <Bone height={14} width="40%" />
            </View>
          </View>
        ) : me.status === 'error' && !d ? (
          <ErrorState error={me.error} onRetry={me.reload} what="حسابك" />
        ) : d ? (
          <>
            <View style={styles.head}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                {d.user.image ? (
                  <Image cachePolicy="memory-disk" source={d.user.image} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel={d.user.name ?? 'صورتك'} />
                ) : (
                  <Text style={styles.initial} maxFontSizeMultiplier={1}>
                    {d.user.name?.trim().charAt(0) ?? '؟'}
                  </Text>
                )}
              </View>
              <View style={styles.flex}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={2} accessibilityRole="header" maxFontSizeMultiplier={1.2}>
                  {d.user.name || 'حسابك'}
                </Text>
                <Text style={[styles.since, { color: colors.muted }]} maxFontSizeMultiplier={1.2}>
                  {`عضو منذ ${JOINED.format(new Date(d.stats.joinedAt))}`}
                </Text>
              </View>
              <Tap label="تعديل الملف" onPress={() => router.push('/account/profile')} style={[styles.circle, { backgroundColor: colors.sunken }]}>
                <Icon name="settings" size={20} tone="text" monochrome />
              </Tap>
            </View>

            <View style={styles.tiles}>
              <Tile tint="primaryContainer" fg="primaryText" icon="bookmark" n={d.stats.favoritesCount} label="المحفوظة" onPress={() => router.push('/account/favorites')} />
              <Tile tint="accentContainer" fg="interactive" icon="partner" n={d.stats.followingCount} label="أتابعهم" onPress={() => router.push('/account/following')} />
              <Tile
                tint="warningContainer"
                fg="onWarningContainer"
                icon="booking"
                n={d.stats.bookingsCount}
                label="حجوزاتي"
                note={l && l.waiting > 0 ? `${plainNumber(l.waiting)} بانتظار التواصل` : null}
                onPress={() => router.push('/account/bookings')}
              />
              <Tile
                tint="surfaceHigh"
                fg="textSecondary"
                icon="notifications"
                n={d.unreadNotifications}
                label={d.unreadNotifications > 0 ? 'إشعارات جديدة' : 'الإشعارات'}
                dot={d.unreadNotifications > 0}
                onPress={() => router.push('/account/notifications')}
              />
            </View>

            {l?.saved.length ? (
              <>
                <Title text="محفوظة للقراءة" more={() => router.push('/account/favorites')} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.saved}>
                  {l.saved.map((a) => (
                    <Tap key={a.id} label={a.title} role="link" scale={0.97} onPress={() => open.article(a.slug)} style={[styles.savedCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <View style={[styles.savedImg, { backgroundColor: colors.skeleton }]}>
                        {a.featuredImage ? <Image cachePolicy="memory-disk" source={a.featuredImage.url} style={StyleSheet.absoluteFill} contentFit="cover" recyclingKey={a.id} /> : null}
                      </View>
                      <Text style={[styles.savedTitle, { color: colors.text }]} numberOfLines={2} maxFontSizeMultiplier={1.2}>
                        {a.title}
                      </Text>
                    </Tap>
                  ))}
                </ScrollView>
              </>
            ) : null}

            {l?.following.length ? (
              <>
                <Title text="شركاء تتابعهم" more={() => router.push('/account/following')} />
                <View style={styles.logos}>
                  {l.following.map((c) => (
                    <Tap key={c.id} label={c.name} role="link" scale={0.94} onPress={() => open.partner(c.slug)} style={[styles.logo, { borderColor: colors.border, backgroundColor: '#FFFFFF' }]}>
                      {c.logo ? <Image cachePolicy="memory-disk" source={c.logo} style={StyleSheet.absoluteFill} contentFit="cover" /> : <Icon name="company" size={24} tone="muted" />}
                    </Tap>
                  ))}
                  <Tap label="اكتشف شركاء" role="link" scale={0.94} onPress={() => router.navigate('/industries-tab')} style={[styles.logo, styles.discover, { borderColor: colors.borderStrong }]}>
                    <Icon name="add" size={22} tone="text" monochrome />
                  </Tap>
                </View>
              </>
            ) : null}

            <Title text="نشاطي" />
            <RowGroup
              rows={[
                { key: 'liked', icon: 'like', label: 'أعجبني', onPress: () => router.push('/account/liked') },
                { key: 'comments', icon: 'comment', label: 'تعليقاتي', onPress: () => router.push('/account/comments') },
                { key: 'reels', icon: 'reels', label: 'طلّاتي', onPress: () => router.push('/account/reels') },
                { key: 'modo', icon: 'ai', label: 'محادثاتي مع مودو', onPress: () => router.push('/chat') },
                { key: 'activity', icon: 'clock', label: 'سجلّ النشاط', onPress: () => router.push('/account/activity') },
              ]}
            />
          </>
        ) : null}

        <Title text="الإعدادات" />
        <Settings />
        {signedIn ? (
          <View style={styles.gap}>
            <RowGroup
              rows={[
                { key: 'password', icon: 'lock', label: d?.user.hasPassword ? 'تغيير كلمة المرور' : 'إنشاء كلمة مرور', onPress: () => router.push('/account/password') },
                { key: 'alerts', icon: 'notifications', label: 'التنبيهات والرسائل', onPress: () => router.push('/account/alerts') },
              ]}
            />
          </View>
        ) : null}
        <View style={styles.gap}>
          <RowGroup
            rows={[
              { key: 'about', icon: 'info', label: 'عن مدونتي والسياسات', onPress: () => router.push('/about') },
              ...(signedIn ? [{ key: 'logout', icon: 'logout' as const, label: 'تسجيل الخروج', chevron: false, onPress: () => void logout() }] : []),
            ]}
          />
        </View>
        {signedIn ? (
          <View style={styles.gap}>
            <RowGroup danger rows={[{ key: 'delete', icon: 'delete', label: 'حذف الحساب', onPress: () => router.push('/account/delete') }]} />
          </View>
        ) : null}
      </ScrollView>
      {/* سطح تحت شريط الحالة: المحتوى لا يمرّ خلف الساعة (edge-to-edge) — كرؤوس التابات الأخرى. */}
      <View pointerEvents="none" style={[styles.statusFill, { height: insets.top, backgroundColor: colors.page }]} />
    </Screen>
  );
}

function Guest({ loading }: { loading: boolean }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.guest, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.guestIcon, { backgroundColor: colors.primaryContainer }]}>
        <Icon name="profile" size={32} tone="primaryText" monochrome />
      </View>
      <Text style={[styles.guestTitle, { color: colors.text }]} accessibilityRole="header" maxFontSizeMultiplier={1.2}>
        {loading ? 'جارٍ التحقّق من الجلسة…' : 'احفظ مقالاتك وتابع الشركاء'}
      </Text>
      <Text style={[styles.guestBody, { color: colors.textSecondary }]} maxFontSizeMultiplier={dsFontScale.max}>
        حساب واحد على مدونتي — نفسه على الموقع والتطبيق.
      </Text>
      <Tap label="تسجيل الدخول" scale={0.97} disabled={loading} onPress={() => router.push('/auth/login')} style={[styles.btn, { backgroundColor: colors.primary }]}>
        <Text style={[styles.btnText, { color: colors.onPrimary }]} maxFontSizeMultiplier={1.2}>
          تسجيل الدخول
        </Text>
      </Tap>
      <Tap label="إنشاء حساب" scale={0.97} disabled={loading} onPress={() => router.push('/auth/register')} style={[styles.btn, styles.btnOutline, { borderColor: colors.borderStrong }]}>
        <Text style={[styles.btnText, { color: colors.text }]} maxFontSizeMultiplier={1.2}>
          إنشاء حساب
        </Text>
      </Tap>
    </View>
  );
}

function Title({ text, more }: { text: string; more?: () => void }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.titleRow}>
      <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header" maxFontSizeMultiplier={1.2}>
        {text}
      </Text>
      {more ? (
        <Tap label={`كل ${text}`} role="link" onPress={more} style={styles.more}>
          <Text style={[styles.moreText, { color: colors.primaryText }]} maxFontSizeMultiplier={1.2}>
            الكل
          </Text>
          <Icon name="chevron" size={18} tone="primaryText" monochrome />
        </Tap>
      ) : null}
    </View>
  );
}

function Tile({
  tint,
  fg,
  icon,
  n,
  label,
  note,
  dot,
  onPress,
}: {
  tint: keyof AppColors;
  fg: keyof AppColors;
  icon: ModontyIconName;
  n: number;
  label: string;
  note?: string | null;
  dot?: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <Tap label={[`${label}، ${plainNumber(n)}`, note].filter(Boolean).join('، ')} role="link" scale={0.97} onPress={onPress} style={[styles.tile, { backgroundColor: colors[tint] }]}>
      <View>
        <Icon name={icon} size={22} tone={fg} monochrome />
        {dot ? <View style={[styles.dot, { backgroundColor: colors.danger }]} /> : null}
      </View>
      <View>
        <View style={styles.tileNumRow}>
          <Text style={[styles.tileNum, { color: colors.text }]} maxFontSizeMultiplier={1.2}>
            {plainNumber(n)}
          </Text>
          {note ? (
            <Text style={[styles.tileNote, { color: colors[fg] }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
              {note}
            </Text>
          ) : null}
        </View>
        <Text style={[styles.tileLabel, { color: colors[fg] }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
          {label}
        </Text>
      </View>
    </Tap>
  );
}

/** المظهر وحجم خطّ القراءة — مقطعان ٤٨ يتغيّران في مكانهما. الحجم نفسه في «Aa» داخل المقال (١٦/١٨/٢٠). */
function Settings() {
  const { colors } = useAppTheme();
  const pref = useAppearancePref();
  const { size } = useReadingPrefs();
  const sizeKey = size <= 17 ? 'small' : size <= 19 ? 'medium' : 'large';
  return (
    <View style={[styles.settings, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.setLabel, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
        المظهر
      </Text>
      <Segmented<AppearancePref>
        value={pref}
        onChange={(v) => setAppearance(v)}
        options={[
          { value: 'light', label: 'فاتح', icon: 'sun' },
          { value: 'dark', label: 'داكن', icon: 'moon' },
          { value: 'auto', label: 'تلقائي', icon: 'device' },
        ]}
      />
      <Text style={[styles.setLabel, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
        حجم خطّ القراءة
      </Text>
      <Segmented<'small' | 'medium' | 'large'>
        value={sizeKey}
        onChange={(v) => setReadingPrefs({ size: v === 'small' ? 16 : v === 'medium' ? 18 : 20 })}
        options={[
          { value: 'small', label: 'صغير', fontSize: 14 },
          { value: 'medium', label: 'متوسط', fontSize: 16 },
          { value: 'large', label: 'كبير', fontSize: 18 },
        ]}
      />
    </View>
  );
}

function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; icon?: ModontyIconName; fontSize?: number }[] }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.seg, { backgroundColor: colors.sunken }]} accessibilityRole="radiogroup">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Tap
            key={o.value}
            label={o.label}
            role="radio"
            accessibilityState={{ checked: on }}
            minTarget={false}
            onPress={() => {
              if (on) return;
              haptic.selection();
              onChange(o.value);
            }}
            style={[styles.segItem, on && [styles.segOn, { backgroundColor: colors.surface }]]}
          >
            {o.icon ? <Icon name={o.icon} size={18} tone={on ? 'text' : 'textSecondary'} monochrome /> : null}
            <Text style={[styles.segText, { color: on ? colors.text : colors.textSecondary }, o.fontSize ? { fontSize: o.fontSize } : null]} maxFontSizeMultiplier={1.2}>
              {o.label}
            </Text>
          </Tap>
        );
      })}
    </View>
  );
}

const XB = 'Tajawal_800ExtraBold';
const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  statusFill: { position: 'absolute', top: 0, start: 0, end: 0 },
  gap: { marginTop: ds.space.s3 },
  head: { paddingStart: ds.layout.gutter, paddingEnd: ds.space.s2, paddingBottom: ds.space.s2, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 64, height: 64, borderRadius: 20, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  initial: { color: '#FFFFFF', fontFamily: 'Tajawal_900Black', fontSize: 28, lineHeight: 36 },
  name: { fontFamily: 'Tajawal_900Black', fontSize: 24, lineHeight: 34 },
  since: { fontFamily: 'Tajawal_500Medium', fontSize: 14, lineHeight: 20 },
  circle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  tiles: { paddingHorizontal: ds.layout.gutter, paddingTop: ds.space.s3, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { flexGrow: 1, flexBasis: '45%', minHeight: 116, borderRadius: 20, padding: 14, justifyContent: 'space-between' },
  dot: { position: 'absolute', top: 0, end: -2, width: 9, height: 9, borderRadius: 5 },
  tileNumRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  tileNum: { fontFamily: 'Tajawal_900Black', fontSize: 24, lineHeight: 30 },
  tileNote: { flexShrink: 1, fontFamily: 'Tajawal_700Bold', fontSize: 12, lineHeight: 18 },
  tileLabel: { fontFamily: 'Tajawal_700Bold', fontSize: 14, lineHeight: 20 },
  titleRow: { paddingHorizontal: ds.layout.gutter, paddingTop: ds.space.s6, paddingBottom: ds.space.s2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 },
  title: { fontFamily: XB, fontSize: 20, lineHeight: 28 },
  more: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 2 },
  moreText: { fontFamily: 'Tajawal_700Bold', fontSize: 14, lineHeight: 20 },
  saved: { gap: 12, paddingHorizontal: ds.layout.gutter },
  savedCard: { width: 220, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  savedImg: { width: '100%', height: 110 },
  savedTitle: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12, minHeight: 66, fontFamily: 'Tajawal_700Bold', fontSize: 15, lineHeight: 22 },
  logos: { paddingHorizontal: ds.layout.gutter, flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  logo: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  discover: { borderStyle: 'dashed' },
  settings: { marginHorizontal: ds.layout.gutter, borderRadius: 20, borderWidth: 1, padding: 14, gap: 14 },
  setLabel: { fontFamily: 'Tajawal_700Bold', fontSize: 14, lineHeight: 20 },
  seg: { height: 48, padding: 4, borderRadius: 24, flexDirection: 'row' },
  segItem: { flex: 1, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  segOn: { shadowColor: '#0E065A', shadowOpacity: 0.06, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  segText: { fontFamily: 'Tajawal_700Bold', fontSize: 14, lineHeight: 20 },
  guest: { marginHorizontal: ds.layout.gutter, borderRadius: 24, borderWidth: 1, padding: 20, alignItems: 'center', gap: 10 },
  guestIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  guestTitle: { fontFamily: XB, fontSize: 20, lineHeight: 28, textAlign: 'center' },
  guestBody: { fontFamily: 'Tajawal_400Regular', fontSize: 15, lineHeight: 24, textAlign: 'center' },
  btn: { alignSelf: 'stretch', minHeight: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  btnOutline: { borderWidth: 1 },
  btnText: { fontFamily: XB, fontSize: 16, lineHeight: 24 },
});
