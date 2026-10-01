import { redirect } from "next/navigation";
import { getUserById } from "../actions/users-actions";
import { getStaffActivitySummary } from "../../audit-log/actions/audit-log-actions";
import { UserForm } from "../components/user-form";
import { db } from "@/lib/db";
import { checkFinanceAdmin } from "@/lib/require-finance-admin";
import { CommissionRateSection } from "./components/commission-rate-section";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, activity, gate] = await Promise.all([
    getUserById(id),
    getStaffActivitySummary(id),
    checkFinanceAdmin(),
  ]);

  if (!user) {
    redirect("/users");
  }

  // A rep's commission rate is set here, on his own page — SALES staff only, and only the admin
  // sees it (the rate decides what the company pays him).
  const showCommission = user.role === "SALES" && gate.status === "ok";
  const rates = showCommission
    ? await db.salesCommissionRate.findMany({
        where: { staffId: id },
        orderBy: { effectiveFrom: "asc" },
        select: { id: true, newRateBp: true, renewalRateBp: true, effectiveFrom: true },
      })
    : [];

  return (
    <div className="max-w-[1200px] mx-auto">
      <UserForm
        initialData={user}
        userId={id}
        activity={{ total: activity.total, last7: activity.last7, lastActiveAt: activity.lastActiveAt }}
      />
      {/* Same two-thirds column as the form's cards above it (user-form.tsx: lg:grid-cols-3 · col-span-2). */}
      {showCommission && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CommissionRateSection staffId={id} staffName={user.name ?? ""} rates={rates} />
          </div>
        </div>
      )}
    </div>
  );
}
