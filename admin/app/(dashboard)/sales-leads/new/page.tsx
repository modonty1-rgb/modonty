import { LeadForm } from "../components/lead-form";
import { getIndustryOptions } from "../helpers/get-lead";

export const metadata = { title: "عميل محتمل جديد — أدمن مدونتي" };

export default async function NewLeadPage() {
  const industries = await getIndustryOptions();
  return (
    <div dir="rtl" className="p-4 sm:p-6">
      <LeadForm industries={industries} />
    </div>
  );
}
