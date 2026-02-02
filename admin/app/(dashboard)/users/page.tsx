import { getUsers } from "./actions/users-actions";
import { PageHeader } from "@/components/shared/page-header";
import { UserTable } from "./components/user-table";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="container mx-auto max-w-[1128px]">
      <PageHeader
        title="Users"
        description="Manage all users in the system"
        actionLabel="New User"
        actionHref="/users/new"
      />
      <UserTable users={users} />
    </div>
  );
}
