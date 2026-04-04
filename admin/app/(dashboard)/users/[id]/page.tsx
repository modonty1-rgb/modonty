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
    <div className="max-w-[1200px] mx-auto">
      <UserForm initialData={user} userId={id} />
    </div>
  );
}
