import { redirect } from "next/navigation";
import { getUserById } from "../actions/users-actions";
import { getStaffActivitySummary } from "../../audit-log/actions/audit-log-actions";
import { UserForm } from "../components/user-form";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, activity] = await Promise.all([
    getUserById(id),
    getStaffActivitySummary(id),
  ]);

  if (!user) {
    redirect("/users");
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      <UserForm
        initialData={user}
        userId={id}
        activity={{ total: activity.total, last7: activity.last7, lastActiveAt: activity.lastActiveAt }}
      />
    </div>
  );
}
