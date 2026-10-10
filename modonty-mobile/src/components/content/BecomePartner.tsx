import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { openExternal } from '@/lib/nav';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds, dsFontScale, dsType } from '@/theme/tokens';

/** `modonty/constants/partner.ts` — PARTNER_SIGNUP_URL. */
const PARTNER_SIGNUP_URL = 'https://pay.modonty.com';

/** «صِر شريكاً» — بطاقة الحاوية الأساسية (Screens A · 02 و B · 07): أيقونة في مربّع أبيض · العنوان · سهم. */
export function BecomePartner() {
  const { colors } = useAppTheme();
  return (
    <Tap label="صِر شريكاً" role="link" scale={0.97} onPress={() => openExternal(PARTNER_SIGNUP_URL)} style={[styles.card, { backgroundColor: colors.primaryContainer }]}>
      <View style={[styles.chip, { backgroundColor: colors.surface }]}>
        <Icon name="partner" size={24} tone="primaryText" />
      </View>
      <Text style={[dsType.titleMd, styles.label, { color: colors.onPrimaryContainer }]} maxFontSizeMultiplier={dsFontScale.max}>
        صِر شريكاً
      </Text>
      <Icon name="chevron" size={20} tone="onPrimaryContainer" monochrome />
    </Tap>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: ds.layout.gutter, marginVertical: ds.space.s4, minHeight: 72, borderRadius: 24, paddingVertical: ds.space.s3, paddingHorizontal: ds.space.s4, flexDirection: 'row', alignItems: 'center', gap: 14 },
  chip: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, fontFamily: 'Tajawal_800ExtraBold' },
});
