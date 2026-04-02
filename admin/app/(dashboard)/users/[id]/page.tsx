import { redirect } from "next/navigation";
import { getUserById } from "../actions/users-actions";
import { UserForm } from "../components/user-form";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    redirect("/users");
  }

  return (
    <div className="container mx-auto max-w-[1128px]">
      <UserForm initialData={user} userId={id} />
    </div>
  );
}
