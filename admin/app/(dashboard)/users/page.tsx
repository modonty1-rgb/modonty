import { getUsers } from "./actions/users-actions";
import { PageHeader } from "@/components/shared/page-header";
import { UserTable } from "./components/user-table";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Admins"
        description={`${users.length} admin${users.length !== 1 ? "s" : ""} managing the dashboard`}
        actionLabel="Add Admin"
        actionHref="/users/new"
      />
      <UserTable users={users} />
    </div>
  );
}
