import { useEffect, useState } from 'react';

import { contentApi } from '@/services/api';

/** وعد واحد لكل تشغيل: `coreClientSlug` لا يتغيّر أثناء الجلسة، فلا يُطلب `/home` لكل شاشة تحتاجه. */
let pending: Promise<string | null> | null = null;

/**
 * slug مدونتي نفسها (`Settings.coreClientId` على الخادم — الموقع يقرؤه ولا يكتب الاسم بيده). لزرّ
 * «تابع مدونتي» في الشاشات التي ليست الرئيسية.
 */
export function useCoreSlug(): string | null {
  const [slug, setSlug] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    pending ??= contentApi.home().then(
      (h) => h.coreClientSlug,
      (error: unknown) => {
        pending = null;
        console.warn('[core-slug]', error);
        return null;
      },
    );
    pending.then((s) => {
      if (alive) setSlug(s);
    });
    return () => {
      alive = false;
    };
  }, []);
  return slug;
}
