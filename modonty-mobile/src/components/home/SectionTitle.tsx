import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds, dsFontScale, dsType } from '@/theme/tokens';

/** عنوان القسم — title-lg 22/32 w800، ورابط «الكل» بالأزرق بهدف ٤٨ (Screens A · 01). */
export function SectionTitle({ title, more }: { title: string; more?: { label: string; a11y: string; onPress: () => void } }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.row}>
      <Text style={[dsType.titleLg, styles.title, { color: colors.text }]} accessibilityRole="header" maxFontSizeMultiplier={dsFontScale.max}>
        {title}
      </Text>
      {more ? (
        <Tap label={more.a11y} role="link" onPress={more.onPress} style={styles.more}>
          <Text style={[dsType.label, { color: colors.primaryText }]} maxFontSizeMultiplier={1.2}>
            {more.label}
          </Text>
          <Icon name="arrow" size={18} tone="primaryText" monochrome />
        </Tap>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: ds.layout.gutter, paddingTop: ds.space.s5, paddingBottom: ds.space.s3 },
  title: { flex: 1 },
  more: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 2 },
});
