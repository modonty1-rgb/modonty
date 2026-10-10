import { Image } from 'expo-image';
import { memo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import type { ModontyIconName } from '@/components/brand/ModontyIcon';
import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { experienceYears, servicesCount } from '@/lib/format';
import { open, openExternal } from '@/lib/nav';
import { whatsappHref } from '@/lib/whatsapp';
import { useToast } from '@/providers/ToastProvider';
import { contentApi } from '@/services/api';
import { partnerActionsApi } from '@/services/api-actions';
import type { ClientListItem } from '@/services/api-types';
import { toApiError } from '@/services/errors';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds, dsFontScale } from '@/theme/tokens';

/** حدود ذهبية للمميّز — Screens B · 07 (‎#E0A100، النصّ goldText). */
const GOLD = '#E0A100';

/**
 * بطاقة دليل الشركاء — Screens B · 07: شعار ٥٦ · المجال · الاسم + التوثيق · «مميّز» · الوصف سطرين ·
 * رقاقات ما يملكه الشريك فقط (المدينة · الخبرة · الاعتماد · الخدمات) · «راسلنا واتساب» + «الصفحة».
 * القائمة لا تحمل رقم الواتساب: الضغط يجلب صفحة الشريك ثم يفتح المحادثة ويسجّل التواصل (`client_list` كالويب).
 */
export const DirectoryCard = memo(function DirectoryCard({ item }: { item: ClientListItem }) {
  const { colors } = useAppTheme();
  const toast = useToast();
  const [opening, setOpening] = useState(false);

  const chips: { key: string; icon?: ModontyIconName; label: string; tint?: boolean }[] = [];
  if (item.city) chips.push({ key: 'city', icon: 'location', label: item.city });
  if (item.yearsInBusiness) chips.push({ key: 'years', icon: 'professionals', label: experienceYears(item.yearsInBusiness) });
  if (item.credential) chips.push({ key: 'cred', icon: 'success', label: item.credential, tint: true });
  if (item.services.length) chips.push({ key: 'svc', label: servicesCount(item.services.length) });

  const whatsapp = async () => {
    if (opening) return;
    setOpening(true);
    try {
      const d = await contentApi.partner(item.slug);
      const href = d.partner.phone ? whatsappHref(d.partner.phone) : null;
      if (!href) {
        toast.show('رقم الواتساب غير متاح الآن — افتح صفحة الشريك للتواصل.', 'error');
        return;
      }
      partnerActionsApi.whatsappLead(item.id, undefined, 'client_list').catch((error: unknown) => console.warn('[directory] whatsapp lead', toApiError(error).message));
      await openExternal(href);
    } catch (error) {
      toast.show(toApiError(error).message, 'error');
    } finally {
      setOpening(false);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, item.isFeatured ? styles.featured : { borderColor: colors.border }]}>
      <Tap label={item.name} role="link" minTarget={false} onPress={() => open.partner(item.slug)} style={styles.top}>
        <View style={[styles.logo, { borderColor: colors.border, backgroundColor: '#FFFFFF' }]}>
          {item.logo ? <Image cachePolicy="memory-disk" recyclingKey={item.id} source={item.logo} style={StyleSheet.absoluteFill} contentFit="cover" /> : <Icon name="company" size={26} tone="muted" />}
        </View>
        <View style={styles.flex}>
          <View style={styles.row}>
            {item.industry ? (
              <Text style={[styles.industry, { color: colors.interactive }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                {item.industry.name}
              </Text>
            ) : (
              <View style={styles.flex} />
            )}
            {item.isFeatured ? (
              <View style={styles.badge}>
                <Icon name="featured" size={13} tone="goldText" monochrome />
                <Text style={[styles.badgeText, { color: colors.goldText }]} maxFontSizeMultiplier={1.2}>
                  مميّز
                </Text>
              </View>
            ) : null}
          </View>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={2} maxFontSizeMultiplier={dsFontScale.max}>
              {item.name}
            </Text>
            {item.isVerified ? <Icon name="trust" size={18} tone="interactive" /> : null}
          </View>
        </View>
      </Tap>

      {item.description ? (
        <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={2} maxFontSizeMultiplier={dsFontScale.max}>
          {item.description}
        </Text>
      ) : null}

      {chips.length ? (
        <View style={styles.chips}>
          {chips.map((c) => (
            <View key={c.key} style={[styles.chip, { backgroundColor: c.tint ? colors.accentContainer : colors.sunken }]}>
              {c.icon ? <Icon name={c.icon} size={14} tone={c.tint ? 'interactive' : 'textSecondary'} monochrome /> : null}
              <Text style={[styles.chipText, { color: c.tint ? colors.interactive : colors.textSecondary }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                {c.label}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.actions}>
        {item.hasWhatsapp ? (
          <Tap label={`راسلنا واتساب — ${item.name}`} scale={0.97} onPress={() => void whatsapp()} style={[styles.wa, { backgroundColor: colors.whatsapp }]}>
            {opening ? <ActivityIndicator size="small" color={colors.onWhatsapp} /> : <Icon name="whatsapp" size={20} tone="onWhatsapp" monochrome />}
            <Text style={[styles.btnText, { color: colors.onWhatsapp }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
              راسلنا واتساب
            </Text>
          </Tap>
        ) : null}
        <Tap label={`صفحة ${item.name}`} role="link" scale={0.97} onPress={() => open.partner(item.slug)} style={[styles.page, !item.hasWhatsapp && styles.flex, { borderColor: colors.borderStrong, backgroundColor: colors.surface }]}>
          <Text style={[styles.btnText, { color: colors.text }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
            الصفحة
          </Text>
          <Icon name="chevron" size={18} tone="text" monochrome />
        </Tap>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  card: { marginHorizontal: ds.layout.gutter, marginBottom: ds.space.s3, borderRadius: ds.radius.lg, borderWidth: 1, padding: ds.space.s4, gap: ds.space.s3 },
  featured: { borderWidth: 1.5, borderColor: GOLD },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: ds.space.s3 },
  logo: { width: 56, height: 56, borderRadius: 14, borderWidth: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: ds.space.s2 },
  industry: { flex: 1, fontFamily: 'Tajawal_700Bold', fontSize: 13, lineHeight: 20 },
  badge: { height: 24, paddingHorizontal: 8, borderRadius: 6, borderWidth: 1, borderColor: GOLD, flexDirection: 'row', alignItems: 'center', gap: 3 },
  badgeText: { fontFamily: 'Tajawal_700Bold', fontSize: 12, lineHeight: 16 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  name: { flexShrink: 1, fontFamily: 'Tajawal_800ExtraBold', fontSize: 16, lineHeight: 24 },
  desc: { fontFamily: 'Tajawal_400Regular', fontSize: 14, lineHeight: 22 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { minHeight: 28, paddingHorizontal: 8, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: '100%' },
  chipText: { flexShrink: 1, fontFamily: 'Tajawal_500Medium', fontSize: 12, lineHeight: 18 },
  actions: { flexDirection: 'row', gap: ds.space.s2 },
  wa: { flex: 1, height: 48, paddingHorizontal: 12, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  page: { height: 48, paddingHorizontal: 18, borderRadius: 24, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  btnText: { fontFamily: 'Tajawal_700Bold', fontSize: 15, lineHeight: 20 },
});
