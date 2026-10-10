import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ModontyIconName } from '@/components/brand/ModontyIcon';
import { FormField, FormSection } from '@/components/form/Form';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { Tap } from '@/components/ui/Tap';
import { useResource } from '@/hooks/useResource';
import { plainNumber } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { openExternal } from '@/lib/nav';
import { COUNTRIES, defaultCountry, isValidNational, nationalDigits, toE164, type Country } from '@/lib/phone';
import { whatsappHref } from '@/lib/whatsapp';
import { useAuth } from '@/providers/AuthProvider';
import { actionsApi, contentApi } from '@/services/api';
import { partnerActionsApi } from '@/services/api-actions';
import type { BookingSource } from '@/services/api-types';
import { toApiError } from '@/services/errors';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds, dsFontScale } from '@/theme/tokens';

const DAY_NAME = new Intl.DateTimeFormat('ar-SA-u-ca-gregory', { weekday: 'long' });
const DAY_NUM = new Intl.DateTimeFormat('ar-SA-u-ca-gregory', { day: 'numeric' });

type Slot = { key: 'morning' | 'noon' | 'evening'; label: string; hour: number; icon: ModontyIconName };
const SLOTS: Slot[] = [
  { key: 'morning', label: 'الصباح', hour: 10, icon: 'coffee' },
  { key: 'noon', label: 'الظهر', hour: 13, icon: 'sun' },
  { key: 'evening', label: 'المساء', hour: 19, icon: 'moon' },
];

/** «أي وقت» ثم ٧ أيام من اليوم: «اليوم · بكرة · ثم اسم اليوم» ورقم اليوم. */
function nextDays(now = new Date()) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    return { date: d, top: i === 0 ? 'اليوم' : i === 1 ? 'بكرة' : DAY_NAME.format(d), num: DAY_NUM.format(d) };
  });
}

/**
 * طلب حجز — Screens B · 09/09ب/10، على `submitBookingRequest` نفسها (E14). بلا دخول:
 * الرقم وحده مطلوب بمفتاح دولة جاهز (قائمة الويب وأطوالها) · «متى يناسبك؟» يوم وفترة اختياريان —
 * اليوم والفترة معاً = `preferredAt` (موعد في المستقبل كما يشترط الخادم)، وأيّهما وحده يُكتب في الرسالة ·
 * الاسم معبّأ · البريد والتفاصيل مطويّة · الإرسال موافقة على الشروط والخصوصية (`disclaimerAccepted`).
 * بعد الإرسال: «وصل طلبك» + ملخّص + واتساب بديل.
 */
export default function BookScreen() {
  const params = useLocalSearchParams<{ slug: string; partnerId?: string; name?: string; articleId?: string; source?: BookingSource }>();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const partner = useResource((signal) => contentApi.partner(params.slug, signal), [params.slug]);
  const p = partner.data?.partner ?? null;
  // مودو يعطي الشريك بالـslug فقط — المعرّف من صفحة الشريك نفسها.
  const partnerId = params.partnerId ?? p?.id ?? null;
  const services = partner.data?.home?.services.map((s) => s.title).filter(Boolean) ?? [];

  const [country, setCountry] = useState<Country>(defaultCountry);
  const [picker, setPicker] = useState(false);
  const [phone, setPhone] = useState('');
  const [focused, setFocused] = useState(false);
  const [day, setDay] = useState<number | null>(null);
  const [slot, setSlot] = useState<Slot['key'] | null>(null);
  const [name, setName] = useState(user?.name ?? '');
  const [more, setMore] = useState(false);
  const [email, setEmail] = useState(user?.email ?? '');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ when: string | null } | null>(null);
  const phoneRef = useRef<TextInput>(null);
  // الحساب يُحمَّل بعد فتح الشاشة أحياناً — يُعبّأ الاسم والبريد حين يصل، ما لم يكتب القارئ شيئاً.
  useEffect(() => {
    if (!user) return;
    setName((v) => v || user.name || '');
    setEmail((v) => v || user.email || '');
  }, [user]);

  const days = useMemo(() => nextDays(), []);
  const digits = nationalDigits(phone);
  const valid = isValidNational(digits, country);
  const tooLong = digits.length > country.max;
  const showError = !valid && !focused && digits.length > 0;
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  // فترات اليوم التي فاتت (مع نصف ساعة هامش) لا تُختار — الخادم يرفض موعداً في الماضي.
  const slotPast = (s: Slot) => day === 0 && s.hour * 60 <= nowMin + 30;
  const partnerName = p?.name ?? params.name ?? 'المزوّد';

  const whenLabel = (() => {
    const picked = day != null ? days[day] : undefined;
    const d = picked ? `${picked.top} ${picked.num}` : null;
    const s = slot ? SLOTS.find((x) => x.key === slot)?.label : null;
    return [d, s].filter(Boolean).join(' · ') || null;
  })();

  const submit = async () => {
    if (!valid || busy || !partnerId) return;
    setBusy(true);
    setError(null);
    const s = SLOTS.find((x) => x.key === slot);
    const dd = day != null ? days[day]?.date : undefined;
    const at = dd && s ? new Date(dd.getFullYear(), dd.getMonth(), dd.getDate(), s.hour) : null;
    const message = [whenLabel ? `الموعد المفضّل: ${whenLabel}` : null, details.trim() || null].filter(Boolean).join('\n\n');
    try {
      await actionsApi.book(partnerId, {
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        phone: toE164(digits, country),
        preferredAt: at && at.getTime() > Date.now() ? at.toISOString() : null,
        message: message || undefined,
        source: params.source ?? 'client_page',
        articleId: params.articleId ?? null,
        disclaimerAccepted: true,
      });
      haptic.success();
      setDone({ when: whenLabel });
    } catch (e) {
      setError(toApiError(e).message);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    const wa = p?.phone ? whatsappHref(p.phone) : null;
    return (
      <Screen>
        <View style={[styles.doneTop, { paddingTop: insets.top + 8 }]}>
          <Tap label="إغلاق" onPress={() => router.back()} style={styles.icon48}>
            <Icon name="close" size={24} tone="text" monochrome />
          </Tap>
        </View>
        <ScrollView contentContainerStyle={[styles.doneBody, { paddingBottom: insets.bottom + 160 }]}>
          <View style={[styles.doneBadge, { backgroundColor: colors.accentContainer }]}>
            <Icon name="trust" size={44} tone="interactive" monochrome />
          </View>
          <Text style={[styles.doneTitle, { color: colors.text }]} accessibilityRole="header" maxFontSizeMultiplier={1.2}>
            وصل طلبك
          </Text>
          <Text style={[styles.doneText, { color: colors.textSecondary }]} maxFontSizeMultiplier={dsFontScale.max}>
            {`${partnerName} بتواصل معك على جوّالك لتأكيد الموعد.`}
          </Text>
          <View style={[styles.summary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <SummaryRow label="مع" value={partnerName} />
            {done.when ? <SummaryRow label="الموعد المفضّل" value={done.when} /> : null}
            <View style={[styles.sumRow, styles.sumLast]}>
              <Text style={[styles.sumLabel, { color: colors.muted }]} maxFontSizeMultiplier={1.2}>
                الحالة
              </Text>
              <View style={[styles.status, { backgroundColor: colors.warningContainer }]}>
                <Text style={[styles.statusText, { color: colors.onWarningContainer }]} maxFontSizeMultiplier={1.2}>
                  بانتظار التواصل
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
        <View style={[styles.doneActions, { paddingBottom: insets.bottom + 20 }]}>
          <Tap label="تمّ" scale={0.97} onPress={() => router.back()} style={[styles.bigBtn, { backgroundColor: colors.primary }]}>
            <Text style={[styles.bigText, { color: colors.onPrimary }]} maxFontSizeMultiplier={1.2}>
              تمّ
            </Text>
          </Tap>
          {wa && p ? (
            <Tap
              label={`راسل ${partnerName} واتساب`}
              scale={0.97}
              onPress={() => {
                partnerActionsApi.whatsappLead(p.id, params.articleId, params.source).catch((e: unknown) => console.warn('[book] whatsapp lead', toApiError(e).message));
                void openExternal(wa);
              }}
              style={[styles.bigBtn, { backgroundColor: colors.whatsapp }]}
            >
              <Icon name="whatsapp" size={20} tone="onWhatsapp" monochrome />
              <Text style={[styles.bigText, { color: colors.onWhatsapp, fontSize: 16 }]} maxFontSizeMultiplier={1.2}>
                أو راسلهم واتساب الحين
              </Text>
            </Tap>
          ) : null}
        </View>
      </Screen>
    );
  }

  const hint = valid
    ? { icon: 'success' as const, tone: 'success' as const, text: `تمام · يُحفظ \u2066${toE164(digits, country)}\u2069` }
    : showError || tooLong
      ? { icon: 'error' as const, tone: 'danger' as const, text: `رقم ${country.name} يتكوّن من ${country.min === country.max ? plainNumber(country.min) : `${plainNumber(country.min)}–${plainNumber(country.max)}`} أرقام بعد مفتاح الدولة` }
      : { icon: 'lock' as const, tone: 'muted' as const, text: 'يوصل للمزوّد فقط، بلا رسائل تسويقية' };

  return (
    <Screen>
      <Header back title="طلب حجز" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={[styles.partner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.logo, { borderColor: colors.border }]}>
              {p?.logo ? <Image cachePolicy="memory-disk" source={p.logo} style={StyleSheet.absoluteFill} contentFit="cover" /> : <Icon name="company" size={24} tone="muted" />}
            </View>
            <View style={styles.flex}>
              <Text style={[styles.withLabel, { color: colors.muted }]} maxFontSizeMultiplier={1.2}>
                الحجز مع
              </Text>
              <View style={styles.nameRow}>
                <Text style={[styles.partnerName, { color: colors.text }]} numberOfLines={2} maxFontSizeMultiplier={1.2}>
                  {partnerName}
                </Text>
                {p?.isVerified ? <Icon name="trust" size={18} tone="interactive" /> : null}
              </View>
              {services.length || p?.industry ? (
                <Text style={[styles.partnerSub, { color: colors.textSecondary }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                  {services.length ? services.join(' · ') : p?.industry}
                </Text>
              ) : null}
            </View>
          </View>

          <FormSection title="رقم جوّالك" note="المطلوب الوحيد">
            <View style={styles.phoneRow}>
              <TextInput
                ref={phoneRef}
                value={phone}
                onChangeText={setPhone}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={country.code === 'SA' ? '5X XXX XXXX' : 'رقم الجوّال'}
                placeholderTextColor={colors.placeholder}
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                accessibilityLabel={`رقم جوّالك، بعد مفتاح ${country.name}`}
                maxFontSizeMultiplier={1.2}
                style={[
                  styles.phoneInput,
                  { color: colors.text, backgroundColor: colors.inputSurface, borderColor: showError || tooLong ? colors.danger : valid || focused ? colors.primary : colors.inputBorder, borderWidth: valid || focused || showError || tooLong ? 2 : 1 },
                ]}
              />
              <Tap label={`مفتاح الدولة ${country.name} +${country.dial}، غيّر`} onPress={() => setPicker(true)} style={[styles.dial, { borderColor: colors.inputBorder, backgroundColor: colors.inputSurface }]}>
                <Text style={[styles.dialText, { color: colors.text }]} maxFontSizeMultiplier={1.2}>{`\u2066+${country.dial}\u2069`}</Text>
                <View style={styles.down}>
                  <Icon name="chevron" size={18} tone="text" monochrome />
                </View>
              </Tap>
            </View>
            <View style={styles.hint} accessibilityLiveRegion="polite">
              <Icon name={hint.icon} size={16} tone={hint.tone} monochrome />
              <Text style={[styles.hintText, { color: colors[hint.tone] }]} maxFontSizeMultiplier={1.2}>
                {hint.text}
              </Text>
            </View>
          </FormSection>

          <FormSection title="متى يناسبك؟" note="اختياري، والمزوّد يؤكّد">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days} style={styles.bleed}>
              {[{ key: -1, top: '', num: 'أي وقت' }, ...days.map((d, i) => ({ key: i, top: d.top, num: d.num }))].map((d) => {
                const on = d.key === -1 ? day === null : day === d.key;
                return (
                  <Tap
                    key={d.key}
                    label={d.key === -1 ? 'أي وقت' : `${d.top} ${d.num}`}
                    role="radio"
                    accessibilityState={{ checked: on }}
                    scale={0.96}
                    minTarget={false}
                    onPress={() => {
                      haptic.selection();
                      const next = d.key === -1 ? null : d.key;
                      setDay(next);
                      if (next === 0 && slot && slotPast(SLOTS.find((x) => x.key === slot)!)) setSlot(null);
                    }}
                    style={[styles.dayChip, d.key === -1 && styles.dayAny, on ? { backgroundColor: colors.primary } : { backgroundColor: colors.surface, borderColor: colors.borderStrong, borderWidth: 1 }]}
                  >
                    {d.top ? (
                      <Text style={[styles.dayTop, { color: on ? colors.onPrimary : colors.text }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                        {d.top}
                      </Text>
                    ) : null}
                    <Text style={[styles.dayNum, { color: on ? colors.onPrimary : colors.text }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                      {d.num}
                    </Text>
                  </Tap>
                );
              })}
            </ScrollView>
            <View style={[styles.slots, { backgroundColor: colors.sunken }]} accessibilityRole="radiogroup">
              {SLOTS.map((s) => {
                const on = slot === s.key;
                const off = slotPast(s);
                return (
                  <Tap
                    key={s.key}
                    label={off ? `${s.label} — فات وقتها اليوم` : s.label}
                    role="radio"
                    accessibilityState={{ checked: on, disabled: off }}
                    disabled={off}
                    minTarget={false}
                    onPress={() => {
                      haptic.selection();
                      setSlot(on ? null : s.key);
                    }}
                    style={[styles.slot, on && [styles.slotOn, { backgroundColor: colors.surface }], off && styles.slotOff]}
                  >
                    <Icon name={s.icon} size={18} tone={on ? 'text' : 'textSecondary'} monochrome />
                    <Text style={[styles.slotText, { color: on ? colors.text : colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
                      {s.label}
                    </Text>
                  </Tap>
                );
              })}
            </View>
          </FormSection>

          <FormSection title="اسمك" note="اختياري">
            <FormField value={name} onChangeText={setName} placeholder="اسمك" autoComplete="name" />
          </FormSection>

          {more ? (
            <>
              <FormSection title="بريدك" note="اختياري — لو تفضّل الردّ بالبريد">
                <FormField value={email} onChangeText={setEmail} placeholder="name@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" ltr />
              </FormSection>
              <FormSection title="تفاصيل" note="اختياري">
                <FormField value={details} onChangeText={setDetails} placeholder="وش تحتاج بالضبط؟" multiline />
              </FormSection>
            </>
          ) : (
            <Tap label="أضف بريدك أو تفاصيل أكثر" onPress={() => setMore(true)} style={[styles.more, { borderColor: colors.borderStrong }]}>
              <Icon name="add" size={20} tone="text" monochrome />
              <Text style={[styles.moreText, { color: colors.text }]} maxFontSizeMultiplier={dsFontScale.max}>
                أضف بريدك أو تفاصيل أكثر
              </Text>
              <View style={styles.down}>
                <Icon name="chevron" size={18} tone="text" monochrome />
              </View>
            </Tap>
          )}

          <Text style={[styles.consent, { color: colors.textSecondary }]} maxFontSizeMultiplier={dsFontScale.max}>
            {'بإرسال الطلب توافق على '}
            <Text maxFontSizeMultiplier={1.2} style={[styles.link, { color: colors.primaryText }]} onPress={() => router.push({ pathname: '/pages/[key]', params: { key: 'terms' } })} accessibilityRole="link">
              الشروط
            </Text>
            {' و'}
            <Text maxFontSizeMultiplier={1.2} style={[styles.link, { color: colors.primaryText }]} onPress={() => router.push({ pathname: '/pages/[key]', params: { key: 'privacy-policy' } })} accessibilityRole="link">
              سياسة الخصوصية
            </Text>
            {'. مدونتي منصّة تعريفية، لسنا مقدّم الخدمة.'}
          </Text>
          {error ? (
            <View style={[styles.error, { backgroundColor: colors.dangerContainer }]} accessibilityLiveRegion="assertive">
              <Icon name="error" size={18} tone="onDangerContainer" monochrome />
              <Text style={[styles.errorText, { color: colors.onDangerContainer }]} maxFontSizeMultiplier={dsFontScale.max}>
                {error}
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 14, backgroundColor: colors.page, borderTopColor: colors.border }]}>
          <Tap
            label={valid ? 'أرسل طلب الحجز' : 'أرسل طلب الحجز — اكتب رقم جوّالك أوّلاً'}
            accessibilityState={{ disabled: !valid, busy }}
            scale={0.97}
            onPress={() => (valid ? void submit() : phoneRef.current?.focus())}
            style={[styles.bigBtn, { backgroundColor: valid ? colors.primary : colors.surfaceHigh }]}
          >
            <Icon name="arrow" size={20} tone={valid ? 'onPrimary' : 'muted'} monochrome />
            {/* النصّ يأخذ العرض المتاح صراحةً: أندرويد يعيد قياسه أضيق حين يتغيّر لونه فيلتفّ «الحجز» لسطر ثانٍ
                (مقيس ١٠ أكتوبر) — والفراغ المقابل للأيقونة يُبقيه في الوسط. */}
            <Text style={[styles.bigText, styles.fill, { color: valid ? colors.onPrimary : colors.muted }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
              {busy ? 'يُرسل…' : 'أرسل طلب الحجز'}
            </Text>
            <View style={styles.iconSpace} />
          </Tap>
          <Text style={[styles.footNote, { color: colors.textSecondary }]} numberOfLines={2} maxFontSizeMultiplier={1.2}>
            {`${partnerName} بتواصل معك لتأكيد الموعد`}
          </Text>
        </View>
      </KeyboardAvoidingView>

      <CountryPicker open={picker} value={country} onClose={() => setPicker(false)} onPick={(c) => (setCountry(c), setPicker(false))} />
    </Screen>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.sumRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.sumLabel, { color: colors.muted }]} maxFontSizeMultiplier={1.2}>
        {label}
      </Text>
      <Text style={[styles.sumValue, { color: colors.text }]} numberOfLines={2} maxFontSizeMultiplier={1.2}>
        {value}
      </Text>
    </View>
  );
}

/** مفتاح الدولة — لوحة سفلية بالاسم والمفتاح (بلا أعلام إيموجي). */
function CountryPicker({ open, value, onClose, onPick }: { open: boolean; value: Country; onClose: () => void; onPick: (c: Country) => void }) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <Pressable style={[styles.scrim, { backgroundColor: colors.scrim }]} onPress={onClose} accessibilityLabel="إغلاق" />
      <View style={[styles.sheet, { backgroundColor: colors.surface, paddingBottom: insets.bottom + 12 }]}>
        <View style={[styles.grab, { backgroundColor: colors.borderStrong }]} />
        <Text style={[styles.sheetTitle, { color: colors.text }]} accessibilityRole="header" maxFontSizeMultiplier={1.2}>
          مفتاح الدولة
        </Text>
        <ScrollView>
          {COUNTRIES.map((c) => {
            const on = c.code === value.code;
            return (
              <Tap key={c.code} label={`${c.name} +${c.dial}`} role="radio" accessibilityState={{ checked: on }} onPress={() => onPick(c)} style={[styles.countryRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.countryName, { color: colors.text, fontFamily: on ? 'Tajawal_800ExtraBold' : 'Tajawal_500Medium' }]} maxFontSizeMultiplier={1.2}>
                  {c.name}
                </Text>
                <Text style={[styles.countryDial, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.2}>{`\u2066+${c.dial}\u2069`}</Text>
                {on ? <Icon name="check" size={20} tone="primaryText" monochrome /> : <View style={styles.checkSpace} />}
              </Tap>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const XB = 'Tajawal_800ExtraBold';
const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  content: { padding: ds.layout.gutter, paddingBottom: ds.space.s6 },
  bleed: { marginHorizontal: -ds.layout.gutter },
  partner: { borderRadius: ds.radius.lg, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 52, height: 52, borderRadius: 14, borderWidth: 1, overflow: 'hidden', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  withLabel: { fontFamily: 'Tajawal_500Medium', fontSize: 12, lineHeight: 18 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  partnerName: { flexShrink: 1, fontFamily: XB, fontSize: 16, lineHeight: 24 },
  partnerSub: { fontFamily: 'Tajawal_400Regular', fontSize: 13, lineHeight: 20 },
  section: { paddingTop: 22, gap: 8 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  sectionTitle: { fontFamily: XB, fontSize: 16, lineHeight: 24 },
  sectionNote: { flexShrink: 1, fontFamily: 'Tajawal_500Medium', fontSize: 12, lineHeight: 18, textAlign: 'left' },
  // الرقم يُكتب يساراً لليمين، ومفتاح الدولة في جهة البداية البصرية للرقم (يسار) كما في التصميم.
  phoneRow: { flexDirection: 'row', gap: 8 },
  // «+966 ⌄» كما في التصميم (اتجاه الرقم يسار-يمين): المفتاح ثم السهم.
  dial: { width: 96, height: 56, borderRadius: 14, borderWidth: 1, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 4 },
  dialText: { fontFamily: 'Tajawal_700Bold', fontSize: 16, lineHeight: 24 },
  down: { transform: [{ rotate: '-90deg' }] },
  phoneInput: { flex: 1, minWidth: 0, height: 56, borderRadius: 14, paddingHorizontal: 15, fontFamily: 'Tajawal_700Bold', fontSize: 17, textAlign: 'left', writingDirection: 'ltr', letterSpacing: 0.5 },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hintText: { flex: 1, fontFamily: 'Tajawal_500Medium', fontSize: 13, lineHeight: 20 },
  days: { gap: 8, paddingHorizontal: ds.layout.gutter },
  dayChip: { width: 64, height: 72, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 2 },
  dayAny: { width: 88 },
  dayTop: { fontFamily: 'Tajawal_500Medium', fontSize: 13, lineHeight: 18 },
  dayNum: { fontFamily: XB, fontSize: 18, lineHeight: 24 },
  slots: { height: 52, padding: 4, borderRadius: 26, flexDirection: 'row' },
  slot: { flex: 1, borderRadius: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  slotOn: { shadowColor: '#0E065A', shadowOpacity: 0.06, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  slotOff: { opacity: 0.38 },
  slotText: { fontFamily: 'Tajawal_700Bold', fontSize: 15, lineHeight: 20 },
  field: { minHeight: 56, borderRadius: 14, paddingHorizontal: 16, fontFamily: 'Tajawal_500Medium', fontSize: 16 },
  fieldMulti: { minHeight: 112, paddingTop: 14, textAlignVertical: 'top' },
  ltr: { textAlign: 'left', writingDirection: 'ltr' },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  more: { marginTop: 12, minHeight: 56, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  moreText: { flex: 1, fontFamily: 'Tajawal_700Bold', fontSize: 15, lineHeight: 22 },
  consent: { marginTop: 16, fontFamily: 'Tajawal_400Regular', fontSize: 13, lineHeight: 22 },
  link: { fontFamily: 'Tajawal_700Bold' },
  error: { marginTop: 12, borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  errorText: { flex: 1, fontFamily: 'Tajawal_500Medium', fontSize: 14, lineHeight: 22 },
  footer: { paddingTop: 12, paddingHorizontal: ds.layout.gutter, borderTopWidth: StyleSheet.hairlineWidth, gap: 8 },
  bigBtn: { minHeight: 56, borderRadius: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16 },
  bigText: { fontFamily: XB, fontSize: 17, lineHeight: 24 },
  fill: { flex: 1, textAlign: 'center' },
  iconSpace: { width: 20 },
  footNote: { textAlign: 'center', fontFamily: 'Tajawal_500Medium', fontSize: 12, lineHeight: 18 },
  icon48: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  doneTop: { paddingHorizontal: 8, flexDirection: 'row' },
  doneBody: { paddingHorizontal: ds.layout.gutter, paddingTop: 40, alignItems: 'center', gap: 12 },
  doneBadge: { width: 88, height: 88, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  doneTitle: { marginTop: 8, fontFamily: 'Tajawal_900Black', fontSize: 28, lineHeight: 38, textAlign: 'center' },
  doneText: { paddingHorizontal: 12, fontFamily: 'Tajawal_400Regular', fontSize: 16, lineHeight: 28, textAlign: 'center' },
  summary: { alignSelf: 'stretch', marginTop: 12, borderRadius: ds.radius.lg, borderWidth: 1 },
  sumRow: { minHeight: 56, paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  sumLast: { borderBottomWidth: 0 },
  sumLabel: { fontFamily: 'Tajawal_500Medium', fontSize: 14, lineHeight: 20 },
  sumValue: { flexShrink: 1, fontFamily: XB, fontSize: 15, lineHeight: 22, textAlign: 'left' },
  status: { minHeight: 28, paddingHorizontal: 10, borderRadius: 6, justifyContent: 'center' },
  statusText: { fontFamily: 'Tajawal_700Bold', fontSize: 13, lineHeight: 18 },
  doneActions: { position: 'absolute', start: ds.layout.gutter, end: ds.layout.gutter, bottom: 0, gap: 10 },
  scrim: { flex: 1 },
  sheet: { maxHeight: '75%', borderTopStartRadius: 28, borderTopEndRadius: 28, paddingTop: 8, paddingHorizontal: ds.layout.gutter },
  grab: { alignSelf: 'center', width: 32, height: 4, borderRadius: 2, marginBottom: 8 },
  sheetTitle: { fontFamily: XB, fontSize: 18, lineHeight: 28, paddingVertical: 8 },
  countryRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  countryName: { flex: 1, fontSize: 16, lineHeight: 24 },
  countryDial: { fontFamily: 'Tajawal_500Medium', fontSize: 15, lineHeight: 22 },
  checkSpace: { width: 20 },
});
