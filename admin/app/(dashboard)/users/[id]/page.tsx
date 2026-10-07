import { redirect } from "next/navigation";
import { getUserById } from "@/lib/users/users-actions";
import { getStaffActivitySummary } from "@/lib/audit-log/audit-log-actions";
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
  const target = showCommission
    ? await db.salesTarget.findFirst({
        where: { staffId: id, effectiveFrom: { lte: new Date() } },
        orderBy: [{ effectiveFrom: "desc" }, { createdAt: "desc" }],
        select: { monthlySarMinor: true },
      })
    : null;

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* On a rep's page the sales terms lead — they are why it is opened (Khalid, 1 Oct 2026);
          the account form follows. Outside the form: the dialogs carry forms of their own. */}
      {showCommission && <CommissionRateSection staffId={id} staffName={user.name ?? ""} rates={rates} target={target} />}
      <UserForm
        initialData={user}
        userId={id}
        activity={{ total: activity.total, last7: activity.last7, lastActiveAt: activity.lastActiveAt }}
      />
    </div>
  );
}
