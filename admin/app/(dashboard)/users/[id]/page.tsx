import { redirect } from "next/navigation";
import { getUserById, getClients, updateUser } from "../actions/users-actions";
import { PageHeader } from "@/components/shared/page-header";
import { UserForm } from "../components/user-form";
import { DeleteUserButton } from "./components/delete-user-button";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, clients] = await Promise.all([getUserById(id), getClients()]);

  if (!user) {
    redirect("/users");
  }

  return (
    <div className="container mx-auto max-w-[1128px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">Edit User</h1>
          <p className="text-muted-foreground mt-1">Update user information</p>
        </div>
        <DeleteUserButton userId={id} />
      </div>
      <UserForm
        initialData={{
          ...user,
          clientAccess: user.clientAccess || [],
        }}
        clients={clients}
        onSubmit={(data) => updateUser(id, data)}
      />
    </div>
  );
}
