import { getIndustries } from "../../industries/actions/industries-actions";
import { getActiveCountries } from "../../settings/reference-data/actions/reference-data-actions";
import { loadSiteUrl } from "@/lib/seo/site-url";
import { CreateClientForm } from "./components/create-client-form";

export default async function NewClientPage() {
  const [industries, siteUrl, countries] = await Promise.all([
    getIndustries(),
    loadSiteUrl(),
    getActiveCountries(),
  ]);

  return (
    <div className="max-w-[1040px] mx-auto px-6 py-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold">إنشاء عميل جديد</h1>
        <p className="text-[12.5px] text-muted-foreground mt-0.5">
          عبّي الأساسيات، اختر الباقة، وحدّد التصنيف — كله في صفحة واحدة منظّمة.
        </p>
      </div>
      <CreateClientForm industries={industries} siteUrl={siteUrl} countries={countries} />
    </div>
  );
}
