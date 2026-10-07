import { memo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { IconButton } from '@/components/ui/IconButton';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, radius, space, typography } from '@/theme/tokens';

/**
 * حقل كتابة أسفل الشاشة (تعليق/ردّ): يحجز insets.bottom، والإرسال يمنع التكرار ويقول ما يحدث.
 * `replyTo` يُظهر لمن يُكتب الردّ مع زرّ إلغاء مرئي.
 */
export const Composer = memo(function Composer({
  placeholder,
  onSend,
  replyTo,
  onCancelReply,
}: {
  placeholder: string;
  onSend: (text: string) => Promise<boolean>;
  replyTo?: string | null;
  onCancelReply?: () => void;
}) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const send = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    const ok = await onSend(text.trim());
    setBusy(false);
    if (ok) setText('');
  };
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + space.xs, backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {replyTo ? (
        <View style={styles.replyRow}>
          <AppText variant="secondary" tone="muted" style={styles.flex}>
            {`ردّ على ${replyTo}`}
          </AppText>
          <IconButton icon="close" label="إلغاء الردّ" onPress={() => onCancelReply?.()} />
        </View>
      ) : null}
      <View style={styles.row}>
        <TextInput
          mode="outlined"
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          multiline
          dense
          style={[styles.input, { backgroundColor: colors.inputSurface }]}
          outlineStyle={{ borderRadius: radius.field, borderColor: colors.inputBorder }}
          contentStyle={styles.rtl}
          accessibilityLabel={placeholder}
          editable={!busy}
        />
        <IconButton icon={busy ? 'clock' : 'forward'} label={busy ? 'يُرسل…' : 'إرسال'} onPress={() => void send()} disabled={busy || !text.trim()} tone="interactive" />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  bar: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: space.sm, paddingTop: space.xs },
  replyRow: { flexDirection: 'row', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: space.xs },
  input: { flex: 1, maxHeight: control.inputHeight * 3, ...typography.body },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  flex: { flex: 1 },
});
