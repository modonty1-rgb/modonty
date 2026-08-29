import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { ConfirmDialog } from '@/src/components/ui/ConfirmDialog';

export type ConfirmRequest = {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  /** فعل لا رجعة فيه (رفض · حذف · خروج) → أحمر. غيره → أخضر الماركة. */
  tone?: 'danger' | 'brand';
};

type ConfirmFn = (request: ConfirmRequest) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * نافذة تأكيد **واحدة** للتطبيق كلّه.
 *
 * كان كل موضع ينادي `Alert.alert` بنفسه — ثلاثة مواضع بثلاث نسخ من نفس المنطق، ونافذة
 * النظام الرمادية التي لا تشبه التطبيق ولا تعمل على الويب. وبدل أن تحمل كل شاشة حالة
 * `visible` ودوالّ تأكيد وإلغاء، تُركَّب النافذة مرّة عند الجذر ويُنادى `useConfirm()`:
 *
 *   const confirm = useConfirm();
 *   if (await confirm({ title, description, confirmLabel, cancelLabel })) doTheThing();
 *
 * فيبقى الشرط سطراً واحداً في مكان القرار، والشكل والسلوك مصدرهما واحد.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((next) => new Promise<boolean>((resolve) => {
    // طلب جديد بينما القديم مفتوح: يُغلق القديم بالإلغاء فلا يبقى وعد معلَّقاً للأبد.
    resolver.current?.(false);
    resolver.current = resolve;
    setRequest(next);
  }), []);

  const settle = useCallback((value: boolean) => {
    setRequest(null);
    const resolve = resolver.current;
    resolver.current = null;
    resolve?.(value);
  }, []);

  const value = useMemo(() => confirm, [confirm]);

  return <ConfirmContext.Provider value={value}>
    {children}
    <ConfirmDialog
      visible={request !== null}
      title={request?.title ?? ''}
      description={request?.description ?? ''}
      confirmLabel={request?.confirmLabel ?? ''}
      cancelLabel={request?.cancelLabel ?? ''}
      tone={request?.tone}
      onConfirm={() => settle(true)}
      onCancel={() => settle(false)}
    />
  </ConfirmContext.Provider>;
}

export function useConfirm(): ConfirmFn {
  const confirm = useContext(ConfirmContext);
  if (confirm === null) throw new Error('useConfirm خارج ConfirmProvider — ركّب المزوّد عند جذر التطبيق.');
  return confirm;
}
