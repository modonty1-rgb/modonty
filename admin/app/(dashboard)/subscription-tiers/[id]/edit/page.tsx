import { redirect } from "next/navigation";
import { getTierConfigs } from "../../actions/tier-actions";
import { PageHeader } from "@/components/shared/page-header";
import { TierForm } from "../../components/tier-form";
import { updateTierConfig } from "../../actions/tier-actions";

export default async function EditTierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tiers = await getTierConfigs();
  const tier = tiers.find((t) => t.id === id);

  if (!tier) {
    redirect("/subscription-tiers");
  }

  async function handleSubmit(data: {
    name: string;
    articlesPerMonth: number;
    price: number;
    isActive: boolean;
    isPopular: boolean;
    description: string | null;
  }) {
    "use server";
    return await updateTierConfig(id, data);
  }

  return (
    <div className="container mx-auto max-w-[1128px]">
      <PageHeader
        title={`Edit ${tier.name} Tier`}
        description="Update subscription tier configuration, pricing, and limits"
      />
      <TierForm initialData={tier} onSubmit={handleSubmit} />
    </div>
  );
}
