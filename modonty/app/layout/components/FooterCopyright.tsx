import { getPageSeoDefaults } from "@/lib/settings/get-page-seo-defaults";

/**
 * سطر الحقوق. الاسم من `Settings.siteName` لا من ثابت في الكود — هو نفسه الاسم في
 * `og:site_name` وفي عقدة الهوية، فما يقرؤه الزائر أسفل الصفحة يطابق ما يُرسَل لجوجل.
 *
 * وبغياب العمود يُعرض العام وحده: «© 2026» جملة صحيحة ناقصة، أمّا اسمٌ كتبه الكود فيبقى
 * معروضاً بعد تغيير الاسم من الأدمن — وهذا خطأ يظهر للزائر لا نقصٌ يُرى.
 */
export async function FooterCopyright({ year }: { year: number }) {
  const { siteName } = await getPageSeoDefaults();
  return <>© {year}{siteName ? ` ${siteName}` : ""}</>;
}
