import Link from "next/link";

import { getIndustries } from "../../industries/actions/industries-actions";
import { getActiveCountries } from "../../settings/reference-data/actions/reference-data-actions";
import { getEditors } from "../../users/actions/users-actions";
import { loadSiteUrl } from "@/lib/seo/site-url";
import { CreateClientForm } from "./components/create-client-form";

/**
 * **حسابٌ داخليّ فقط** — لا عميلٌ يدفع.
 *
 * كانت هذه الصفحة الباب الثاني لميلاد العميل: فورمٌ يسأل الموظّف عن الباقة والسعر
 * والعملة ودورة الفوترة والرصيد الافتتاحيّ بيده. وما دام البابان مفتوحين، تُولد كل
 * يوم نسخةٌ ثانية من المال تخالف الفاتورة — وهو ما تمنعه قاعدة المصدر الواحد.
 *
 * فمن يدفع يُفعَّل من طلبه في `/orders` (زرّ «فعّل»)، حيث الأرقام مكتوبةٌ أصلاً بما
 * دفعه فعلاً. وما بقي لهذه الصفحة هو ما لا طلبَ له: حساباتنا نحن (مدونتي · العروض).
 *
 * وسقط معها `?orderId=` — الجسرُ القديم بين الطلب والفورم، وقد حلّت محلّه نافذةُ التفعيل.
 */
export default async function NewInternalClientPage() {
  const [industries, siteUrl, countries, editors] = await Promise.all([
    getIndustries(),
    loadSiteUrl(),
    getActiveCountries(),
    getEditors(),
  ]);

  return (
    <div className="max-w-[1040px] mx-auto px-6 py-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold">حساب داخلي جديد</h1>
        <p className="text-[12.5px] text-muted-foreground mt-0.5">
          حساباتنا نحن — مجّانيّة وخارج كل فوترة.{" "}
          <span className="text-foreground">عميلٌ يدفع؟</span>{" "}
          <Link href="/orders?view=awaiting-activation" className="font-semibold underline underline-offset-2">
            فعّله من طلبه
          </Link>{" "}
          — الباقة والسعر والمدّة مكتوبةٌ هناك، فلا تُكتب هنا بيدٍ ثانية.
        </p>
      </div>
      <CreateClientForm industries={industries} siteUrl={siteUrl} countries={countries} editors={editors} />
    </div>
  );
}
