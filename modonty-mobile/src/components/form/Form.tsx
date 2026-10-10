import { useState, type ComponentProps, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';

import type { ModontyIconName } from '@/components/brand/ModontyIcon';
import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { useAppTheme } from '@/theme/ThemeProvider';
import { dsFontScale } from '@/theme/tokens';

/**
 * عُدّة النماذج — من شاشة الحجز المعتمدة (Screens B · 09): عنوان القسم ١٦ w800 وملاحظته يساراً ·
 * حقل ٥٦ زاوية ١٤ بحدّ ١ (٢ أزرق عند التركيز، أحمر عند الخطأ) · أزرار ٥٦ حبّة.
 * الحجز والدخول وإنشاء الحساب واستعادة كلمة المرور بشكل واحد.
 */
export function FormSection({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.section}>
      <View style={styles.head}>
        <Text style={[styles.title, { color: colors.text }]} maxFontSizeMultiplier={1.2}>
          {title}
        </Text>
        {note ? (
          <Text style={[styles.note, { color: colors.muted }]} maxFontSizeMultiplier={1.2}>
            {note}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export function FormField({
  ltr,
  multiline,
  error,
  secure,
  ...rest
}: ComponentProps<typeof TextInput> & { ltr?: boolean; error?: string | null; secure?: boolean }) {
  const { colors } = useAppTheme();
  const [focus, setFocus] = useState(false);
  const [hidden, setHidden] = useState(true);
  const border = error ? colors.danger : focus ? colors.primary : colors.inputBorder;
  return (
    <View style={styles.fieldWrap}>
      <View style={[styles.field, multiline && styles.fieldMulti, { backgroundColor: colors.inputSurface, borderColor: border, borderWidth: focus || error ? 2 : 1 }]}>
        <TextInput
          {...rest}
          multiline={multiline}
          secureTextEntry={secure ? hidden : rest.secureTextEntry}
          onFocus={(e) => (setFocus(true), rest.onFocus?.(e))}
          onBlur={(e) => (setFocus(false), rest.onBlur?.(e))}
          placeholderTextColor={colors.placeholder}
          maxFontSizeMultiplier={1.2}
          style={[styles.input, multiline && styles.inputMulti, ltr ? styles.ltr : styles.rtl, { color: colors.text }]}
        />
        {secure ? (
          <Tap label={hidden ? 'إظهار كلمة المرور' : 'إخفاء كلمة المرور'} onPress={() => setHidden((h) => !h)} style={styles.eye}>
            <Icon name={hidden ? 'views' : 'viewsOff'} size={20} tone="muted" monochrome />
          </Tap>
        ) : null}
      </View>
      {error ? (
        <View style={styles.errRow} accessibilityLiveRegion="polite">
          <Icon name="error" size={16} tone="danger" monochrome />
          <Text style={[styles.errText, { color: colors.danger }]} maxFontSizeMultiplier={1.2}>
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/**
 * زرّ ٥٦ حبّة. النصّ يأخذ العرض المتاح صراحةً وفراغٌ مقابل الأيقونة يُبقيه في الوسط — أندرويد يعيد قياسه أضيق
 * حين يتغيّر لونه فيلتفّ لسطر ثانٍ (مقيس ١٠ أكتوبر في زرّ الحجز).
 */
export function FormButton({
  label,
  onPress,
  kind = 'primary',
  icon,
  leading,
  busy,
  busyLabel,
  disabled,
}: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'outline' | 'text';
  icon?: ModontyIconName;
  leading?: ReactNode;
  busy?: boolean;
  busyLabel?: string;
  disabled?: boolean;
}) {
  const { colors } = useAppTheme();
  const off = disabled || busy;
  const bg = kind === 'primary' ? (disabled ? colors.surfaceHigh : colors.primary) : kind === 'outline' ? colors.surface : 'transparent';
  const fg = kind === 'primary' ? (disabled ? colors.muted : colors.onPrimary) : kind === 'text' ? colors.primaryText : colors.text;
  const hasLead = Boolean(leading || icon || busy);
  return (
    <Tap
      label={busy && busyLabel ? busyLabel : label}
      accessibilityState={{ disabled: !!disabled, busy: !!busy }}
      disabled={off}
      scale={0.97}
      onPress={onPress}
      style={[styles.btn, kind === 'text' ? styles.btnText : null, { backgroundColor: bg }, kind === 'outline' && { borderWidth: 1, borderColor: colors.borderStrong }]}
    >
      {busy ? <ActivityIndicator size="small" color={fg} /> : leading ?? (icon ? <Icon name={icon} size={20} tone={kind === 'primary' ? (disabled ? 'muted' : 'onPrimary') : 'text'} monochrome /> : null)}
      {/* سطران عند تكبير الخطّ ٢٠٠٪ — لا قصّ («المتابعة بحساب Google» انقصّ بسطر واحد). */}
      <Text style={[styles.btnLabel, kind === 'text' && styles.btnLabelText, { color: fg }]} numberOfLines={2} maxFontSizeMultiplier={1.2}>
        {busy && busyLabel ? busyLabel : label}
      </Text>
      {hasLead ? <View style={styles.leadSpace} /> : null}
    </Tap>
  );
}

/** خطأ الخادم بنصّه — صندوق أحمر خفيف. */
export function FormError({ message }: { message: string | null }) {
  const { colors } = useAppTheme();
  if (!message) return null;
  return (
    <View style={[styles.error, { backgroundColor: colors.dangerContainer }]} accessibilityLiveRegion="assertive">
      <Icon name="error" size={18} tone="onDangerContainer" monochrome />
      <Text style={[styles.errorText, { color: colors.onDangerContainer }]} maxFontSizeMultiplier={dsFontScale.max}>
        {message}
      </Text>
    </View>
  );
}

/** «أو» بين خطّين — قبل أزرار Google/Apple. */
export function OrDivider() {
  const { colors } = useAppTheme();
  return (
    <View style={styles.or}>
      <View style={[styles.orLine, { backgroundColor: colors.border }]} />
      <Text style={[styles.orText, { color: colors.muted }]} maxFontSizeMultiplier={1.2}>
        أو
      </Text>
      <View style={[styles.orLine, { backgroundColor: colors.border }]} />
    </View>
  );
}

const XB = 'Tajawal_800ExtraBold';
const styles = StyleSheet.create({
  section: { paddingTop: 22, gap: 8 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  // العنوان يأخذ العرض المتاح صراحةً: قِيس أضيق فسقطت «المرور» من «كلمة المرور» (مقيس ١٠ أكتوبر).
  title: { flex: 1, fontFamily: XB, fontSize: 16, lineHeight: 24 },
  note: { flexShrink: 1, fontFamily: 'Tajawal_500Medium', fontSize: 12, lineHeight: 18, textAlign: 'left' },
  fieldWrap: { gap: 6 },
  field: { minHeight: 56, borderRadius: 14, flexDirection: 'row', alignItems: 'center' },
  fieldMulti: { minHeight: 112, alignItems: 'flex-start' },
  input: { flex: 1, minHeight: 52, paddingHorizontal: 16, fontFamily: 'Tajawal_500Medium', fontSize: 16 },
  inputMulti: { minHeight: 108, paddingTop: 14, textAlignVertical: 'top' },
  ltr: { textAlign: 'left', writingDirection: 'ltr' },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  eye: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  errRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errText: { flex: 1, fontFamily: 'Tajawal_500Medium', fontSize: 13, lineHeight: 20 },
  btn: { minHeight: 56, borderRadius: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 6 },
  btnText: { minHeight: 48 },
  btnLabel: { flex: 1, textAlign: 'center', fontFamily: XB, fontSize: 17, lineHeight: 24 },
  btnLabelText: { fontFamily: 'Tajawal_700Bold', fontSize: 15, lineHeight: 22 },
  leadSpace: { width: 20 },
  error: { borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  errorText: { flex: 1, fontFamily: 'Tajawal_500Medium', fontSize: 14, lineHeight: 22 },
  or: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  orLine: { flex: 1, height: StyleSheet.hairlineWidth },
  orText: { fontFamily: 'Tajawal_500Medium', fontSize: 13, lineHeight: 20 },
});
