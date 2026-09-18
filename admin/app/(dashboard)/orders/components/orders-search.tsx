"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

/**
 * **البحث في الرابط لا في حالة المكوّن** — فيبحث في الجدول كلِّه.
 *
 * كان حقلَ `DataTable` الداخليّ، وهو يرشّح **الصفوف المجلوبة وحدها** (٥٠ طلباً بـ`TAKE`).
 * فعميلٌ اسمُه في الطلب رقم ٦٠ لا يظهر مهما كُتب اسمُه كاملاً — وغيابُ النتيجة يُقرأ
 * «لا يوجد» بدل «خارج الصفحة». والآن يمرّ الشرطُ إلى القاعدة فيشمل كلَّ الطلبات.
 *
 * وموضعُه بين العنوان وزرّ «+» بطلب خالد (١٩ سبتمبر ٢٠٢٦)، وهو موضعٌ يناسبه: صفُّ
 * العنوان يقول «أيُّ اشتراكٍ تريد»، وصفُّ التوجلات تحته يقول «أيَّ مجموعةٍ تريد».
 *
 * والكتابةُ تُؤجَّل ٣٥٠ مللي قبل أن تصل الرابط: كلُّ حرفٍ رحلةٌ إلى الخادم، والتأجيلُ
 * يجعلها رحلةً واحدةً بعد أن تسكن اليد.
 */
export function OrdersSearch({ placeholder = "ابحث باسم العميل أو رقم الطلب" }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const urlValue = params.get("q") ?? "";
  const [value, setValue] = useState(urlValue);
  const typing = useRef(false);

  // الرابطُ يقود حين يتغيّر من خارج الحقل (زرُّ الرجوع · حبّةُ فلترٍ تُمسح)، ولا يقاطع
  // الكتابةَ الجارية — وإلّا قفز المؤشّر إلى آخر ما وصل الخادمَ من حروف.
  useEffect(() => {
    if (!typing.current) setValue(urlValue);
  }, [urlValue]);

  useEffect(() => {
    if (value === urlValue) return;
    typing.current = true;
    const id = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (value.trim()) next.set("q", value.trim());
      else next.delete("q");
      typing.current = false;
      router.replace(`${pathname}${next.toString() ? `?${next}` : ""}`, { scroll: false });
    }, 350);
    return () => clearTimeout(id);
  }, [value, urlValue, params, pathname, router]);

  return (
    <div className="relative min-w-0 flex-1">
      <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="ابحث في الاشتراكات"
        className="h-9 w-full rounded-md border border-input bg-background ps-8 pe-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="امسح البحث"
          className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
