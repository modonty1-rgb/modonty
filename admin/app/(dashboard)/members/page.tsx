import { getMembers } from "./actions/members-actions";
import { PageHeader } from "@/components/shared/page-header";
import { MemberTable } from "./components/member-table";

export default async function MembersPage() {
  const members = await getMembers();

  return (
    <div dir="rtl" className="max-w-[1200px] mx-auto">
      <PageHeader
        title="الأعضاء"
        description={`${members.length} عضو مسجّل — زوار سجّلوا في مدونتي (جوجل أو البريد)`}
      />
      <MemberTable members={members} />
    </div>
  );
}
