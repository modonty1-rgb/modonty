import { redirect } from "next/navigation";
import { getTierConfigs } from "../../actions/tier-actions";
import { TierForm } from "../../components/tier-form";

export default async function EditTierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tiers = await getTierConfigs();
  const tier = tiers.find((t) => t.id === id);

  if (!tier) {
    redirect("/subscription-tiers");
  }

  return (
    <div className="container mx-auto max-w-[1128px]">
      <TierForm initialData={tier} />
    </div>
  );
}
