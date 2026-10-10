import { FlashList, type FlashListRef, type ListRenderItem } from '@shopify/flash-list';
import { useMemo, type ReactElement, type Ref } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { PagedList as PagedState } from '@/hooks/usePagedList';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, ds, space } from '@/theme/tokens';
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
  /** `null` = لا حالة فراغ (المحتوى في الرأس — مثل تبويب الشركاء في البحث). */
  empty: { icon: ModontyIconName; title: string; body?: string; actionLabel?: string; onAction?: () => void } | null;
  header?: ReactElement | null;
  skeleton?: 'card' | 'row';
  /** القائمة داخل تبويب: الكبسولة عائمة فوقها، فتُترك لها ٨٨dp + safe area (Tokens §٠٩). */
  inTabs?: boolean;
  /** طيّ الرأس والكبسولة مع التمرير (useTabHeader). */
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  getItemType?: (item: T) => string;
  /** صفوف بعرض الشاشة (نظام التصميم ١٫٠): بلا حشو جانبي ولا فاصل — الصفّ يرسم حدّه. */
  flush?: boolean;
  /** ما يظهر بعد آخر صفحة فقط (مثل «صِر شريكاً») — لا يظهر والقائمة ما زالت تحمّل. */
  footer?: ReactElement | null;
  /** للتمرير البرمجي (مثلاً إبقاء الرقاقات المثبّتة مكانها عند تغيير الفلتر). */
  listRef?: Ref<FlashListRef<T>>;
};

/**
 * كل قائمة تتجاوز شاشة: FlashList (ENGINEERING §١) بحالاتها الأربع — هيكل · فارغ بفعل · خطأ بإعادة ·
 * بلا شبكة — وتذييل يقول ما يحدث عند تحميل الصفحة التالية أو فشلها.
 */
export function PagedList<T>({ list, renderItem, keyOf, what, empty, header, skeleton = 'card', inTabs, getItemType, onScroll, flush, footer, listRef }: Props<T>) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const bottom = insets.bottom + (inTabs ? ds.layout.contentBottomInset : space.xl);
  // التمرير اللانهائي: صفحات offset قد تكرّر عنصراً إن نُشر جديد بين طلبين — المفتاح المكرّر يربك
  // إعادة التدوير في FlashList (صفوف تقفز أو تختفي). نُسقط المكرّر هنا مرّة لكل القوائم.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = useMemo(() => dedupe(list.items, keyOf), [list.items]);

  // القائمة تبقى مركّبة في كل الحالات: الهيكل والخطأ والفراغ داخلها تحت الرأس. استبدالها بعرض ثابت أثناء
  // التحميل كان يرجع التمرير للأعلى والشريط المطوي باقٍ، فتظهر الرقاقات مرّتين (مقيس ١٠ أكتوبر).
  const emptyState =
    list.status === 'loading' ? (
      // الهيكل والخطأ بعرض الشاشة كما كانا خارج القائمة — يُلغى حشوها الجانبي. والهيكل بطول شاشة على الأقل
      // كي لا ينكمش المحتوى أثناء تغيير الفلتر فيضيع موضع التمرير.
      <View style={[flush ? undefined : styles.bleedFooter, { minHeight: height }]}>
        <ListSkeleton kind={skeleton} />
      </View>
    ) : list.status === 'error' ? (
      <View style={flush ? undefined : styles.bleedFooter}>
        <ErrorState error={list.error} onRetry={list.reload} what={what} />
      </View>
    ) : empty ? (
      <StateView {...empty} />
    ) : null;

  return (
    <FlashList
      // نسختان من @types/react في المستودع (flash-list تحمل واحدة) فلا يتطابق نوع Ref رغم أنه نفسه.
      ref={listRef as never}
      data={data}
      // قوائمنا تُلحق بالآخر فقط، والحفاظ على الموضع (مفعّل افتراضياً في v2) يرجعها للأعلى حين تُستبدل
      // البيانات بعد فلتر (مقيس ١٠ أكتوبر: الموضع ١٢٠ ← ٠).
      maintainVisibleContentPosition={{ disabled: true }}
      renderItem={renderItem}
      keyExtractor={keyOf}
      getItemType={getItemType}
      ListHeaderComponent={header ? <View style={flush ? undefined : styles.bleed}>{header}</View> : undefined}
      ItemSeparatorComponent={flush ? undefined : Separator}
      contentContainerStyle={{ paddingBottom: bottom, paddingHorizontal: flush ? 0 : space.screen }}
      onEndReached={list.hasMore ? list.loadMore : undefined}
      // الصفحة التالية تُطلب والقارئ على بُعد شاشة ونصف من النهاية — لا انتظار عند الحافّة.
      onEndReachedThreshold={1.5}
      onScroll={onScroll}
      scrollEventThrottle={16}
      refreshControl={<RefreshControl refreshing={list.refreshing} onRefresh={list.refresh} tintColor={colors.primary} colors={[colors.primary]} />}
      ListEmptyComponent={emptyState}
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
        ) : !list.hasMore && data.length > 0 && footer ? (
          <View style={flush ? undefined : styles.bleedFooter}>{footer}</View>
        ) : null
      }
    />
  );
}

function dedupe<T>(items: T[], keyOf: (item: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of items) {
    const k = keyOf(it);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(it);
  }
  return out.length === items.length ? items : out;
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  bleed: { marginHorizontal: -space.screen, marginBottom: space.listGap },
  separator: { height: space.listGap },
  bleedFooter: { marginHorizontal: -space.screen },
  footer: { padding: space.md, alignItems: 'center', gap: space.xs, minHeight: control.touch },
});
