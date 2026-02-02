import { getClients, createUser } from "../actions/users-actions";
import { PageHeader } from "@/components/shared/page-header";
import { UserForm } from "../components/user-form";

export default async function NewUserPage() {
  const clients = await getClients();

  return (
    <div className="container mx-auto max-w-[1128px]">
      <PageHeader title="Create User" description="Add a new user to the system" />
      <UserForm clients={clients} onSubmit={createUser} />
    </div>
  );
}
