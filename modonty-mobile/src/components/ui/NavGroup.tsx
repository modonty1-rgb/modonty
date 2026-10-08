import { Fragment, memo } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ModontyIconName } from '@/components/brand/ModontyIcon';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, radius, space } from '@/theme/tokens';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { Tap } from './Tap';

export type NavRowItem = {
  key: string;
  icon: ModontyIconName;
  label: string;
  hint?: string | null;
  badge?: string | null;
  onPress: () => void;
  danger?: boolean;
};

/**
 * مجموعة صفوف تنقّل: سطح مرفوع واحد بفواصل خفيفة، لا بطاقات متداخلة (BRANDING — أنماط M3).
 * كل صفّ يفتح صفحة أخرى فيحمل مؤشّر تنقّل في الطرف النهائي.
 */
export const NavGroup = memo(function NavGroup({ title, items }: { title?: string; items: NavRowItem[] }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.wrap}>
      {title ? (
        <AppText variant="label" tone="muted" style={styles.title} accessibilityRole="header">
          {title}
        </AppText>
      ) : null}
      <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {items.map((item, i) => (
          <Fragment key={item.key}>
            {i > 0 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
            <Tap label={item.hint ? `${item.label} — ${item.hint}` : item.label} role="link" onPress={item.onPress} style={styles.row}>
              <Icon name={item.icon} tone={item.danger ? 'danger' : 'text'} />
              <View style={styles.text}>
                <AppText variant="body" tone={item.danger ? 'danger' : 'text'} numberOfLines={1}>
                  {item.label}
                </AppText>
                {item.hint ? (
                  <AppText variant="secondary" tone="muted" numberOfLines={1}>
                    {item.hint}
                  </AppText>
                ) : null}
              </View>
              {item.badge ? (
                <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                  <AppText variant="tabLabel" tone="onPrimary" fixedSize>
                    {item.badge}
                  </AppText>
                </View>
              ) : null}
              <Icon name="forward" size={control.iconSmall} tone="muted" />
            </Tap>
          </Fragment>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: space.xs },
  title: { paddingHorizontal: space.xxs },
  group: { borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth, marginStart: space.card + control.icon + space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.card, minHeight: control.touch + space.xs },
  text: { flex: 1, paddingVertical: space.xs },
  badge: { minWidth: control.iconSmall, height: control.iconSmall, paddingHorizontal: space.xxs, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
