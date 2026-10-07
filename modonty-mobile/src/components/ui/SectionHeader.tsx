import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { space } from '@/theme/tokens';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { Tap } from './Tap';

/** عنوان قسم + «عرض الكل» اختياري بمؤشّر تنقّل. */
export const SectionHeader = memo(function SectionHeader({ title, onMore, moreLabel = 'عرض الكل' }: { title: string; onMore?: () => void; moreLabel?: string }) {
  return (
    <View style={styles.row}>
      <AppText variant="sectionTitle" accessibilityRole="header" style={styles.flex}>
        {title}
      </AppText>
      {onMore ? (
        <Tap label={`${moreLabel} — ${title}`} role="link" onPress={onMore} style={styles.more}>
          <AppText variant="label" tone="interactive">
            {moreLabel}
          </AppText>
          <Icon name="forward" size={16} tone="interactive" />
        </Tap>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.screen, gap: space.xs },
  flex: { flex: 1 },
  more: { flexDirection: 'row', alignItems: 'center', gap: space.xxs, justifyContent: 'center', paddingHorizontal: space.xs },
});
