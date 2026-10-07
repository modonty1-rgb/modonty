import type { ListRenderItem } from '@shopify/flash-list';
import type { ReactElement } from 'react';

import type { ModontyIconName } from '@/components/brand/ModontyIcon';
import { usePagedList } from '@/hooks/usePagedList';
import { PagedList } from './PagedList';

/** قائمة من طلب واحد بلا صفحات (قوائم «حسابي» مسقوفة بـ٥٠ كالويب) — بنفس حالات PagedList الأربع. */
export function SimpleList<T>({
  load,
  deps = [],
  renderItem,
  keyOf,
  what,
  empty,
  header,
  skeleton = 'row',
}: {
  load: (signal: AbortSignal) => Promise<T[]>;
  deps?: readonly unknown[];
  renderItem: ListRenderItem<T>;
  keyOf: (item: T) => string;
  what: string;
  empty: { icon: ModontyIconName; title: string; body?: string; actionLabel?: string; onAction?: () => void };
  header?: ReactElement | null;
  skeleton?: 'card' | 'row';
}) {
  const list = usePagedList<T, never>(async (_cursor, signal) => ({ items: await load(signal), next: null }), deps);
  return <PagedList list={list} renderItem={renderItem} keyOf={keyOf} what={what} empty={empty} header={header} skeleton={skeleton} />;
}
