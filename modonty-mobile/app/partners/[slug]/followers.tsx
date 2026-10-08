import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { SimpleList } from '@/components/ui/SimpleList';
import { Tap } from '@/components/ui/Tap';
import { open } from '@/lib/nav';
import { moreContentApi } from '@/services/api-content';
import type { PartnerFollower } from '@/services/api-types-content';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, radius, space } from '@/theme/tokens';

/** S09g — متابعو الشريك (C13 followers — getClientFollowers). */
export default function PartnerFollowersScreen() {
  const { slug, name } = useLocalSearchParams<{ slug: string; name?: string }>();
  const { colors } = useAppTheme();
  return (
    <Screen>
      <Header back title={name ? `متابعو ${name}` : 'المتابعون'} />
      <SimpleList<PartnerFollower>
        load={async (signal) => (await moreContentApi.partnerFollowers(slug, signal)).items}
        renderItem={({ item }) => {
          const body = (
            <>
              {item.image ? <Image source={item.image} style={styles.avatar} contentFit="cover" /> : <Icon name="profile" tone="muted" />}
              <AppText variant="label" style={styles.flex}>
                {item.name}
              </AppText>
              {item.userId ? <Icon name="forward" size={control.iconSmall} tone="muted" /> : null}
            </>
          );
          const style = [styles.row, { backgroundColor: colors.surface, borderColor: colors.border }];
          return item.userId ? (
            <Tap label={item.name} role="link" onPress={() => open.user(item.userId!)} style={style}>
              {body}
            </Tap>
          ) : (
            <View style={style}>{body}</View>
          );
        }}
        keyOf={(f) => f.id}
        what="المتابعين"
        empty={{ icon: 'profile', title: 'لا متابعين بعد' }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: space.sm, minHeight: control.touch },
  avatar: { width: control.avatar, height: control.avatar, borderRadius: radius.pill },
  flex: { flex: 1 },
});
