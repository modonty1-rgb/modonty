import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { type ReactElement } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { PagedList as PagedState } from '@/hooks/usePagedList';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, space } from '@/theme/tokens';
import { AppText } from './AppText';
import { Button } from './Button';
import { ListSkeleton } from './Skeleton';
import { ErrorState, StateView } from './StateView';
import type { ModontyIconName } from '@/components/brand/ModontyIcon';

type Props<T> = {
  list: PagedState<T>;
  renderItem: ListRenderItem<T>;
  keyOf: (item: T) => string;
  what: string;
  empty: { icon: ModontyIconName; title: string; body?: string; actionLabel?: string; onAction?: () => void };
  header?: ReactElement | null;
  skeleton?: 'card' | 'row';
  /** القائمة داخل تبويب: تحجز ارتفاع الشريط السفلي (UIUX §٥). */
  inTabs?: boolean;
  getItemType?: (item: T) => string;
};

/**
 * كل قائمة تتجاوز شاشة: FlashList (ENGINEERING §١) بحالاتها الأربع — هيكل · فارغ بفعل · خطأ بإعادة ·
 * بلا شبكة — وتذييل يقول ما يحدث عند تحميل الصفحة التالية أو فشلها.
 */
export function PagedList<T>({ list, renderItem, keyOf, what, empty, header, skeleton = 'card', inTabs, getItemType }: Props<T>) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const bottom = (inTabs ? 0 : insets.bottom) + space.xl;

  if (list.status === 'loading') {
    return (
      <View style={styles.flex}>
        {header}
        <ListSkeleton kind={skeleton} />
      </View>
    );
  }
  if (list.status === 'error') {
    return (
      <View style={styles.flex}>
        {header}
        <ErrorState error={list.error} onRetry={list.reload} what={what} />
      </View>
    );
  }

  return (
    <FlashList
      data={list.items}
      renderItem={renderItem}
      keyExtractor={keyOf}
      getItemType={getItemType}
      ListHeaderComponent={header ? <View style={styles.bleed}>{header}</View> : undefined}
      ItemSeparatorComponent={Separator}
      contentContainerStyle={{ paddingBottom: bottom, paddingHorizontal: space.screen }}
      onEndReached={list.hasMore ? list.loadMore : undefined}
      onEndReachedThreshold={0.6}
      refreshControl={<RefreshControl refreshing={list.refreshing} onRefresh={list.refresh} tintColor={colors.primary} colors={[colors.primary]} />}
      ListEmptyComponent={<StateView {...empty} />}
      ListFooterComponent={
        list.loadingMore ? (
          <View style={styles.footer} accessibilityLabel="جارٍ تحميل المزيد">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : list.moreError ? (
          <View style={styles.footer}>
            <AppText variant="secondary" tone="danger" align="center">
              {list.moreError.message}
            </AppText>
            <Button label="أعد المحاولة" kind="text" onPress={list.loadMore} compact />
          </View>
        ) : null
      }
    />
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bleed: { marginHorizontal: -space.screen, marginBottom: space.listGap },
  separator: { height: space.listGap },
  footer: { padding: space.md, alignItems: 'center', gap: space.xs, minHeight: control.touch },
});
