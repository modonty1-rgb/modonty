import { getMembers } from "./actions/members-actions";
import { PageHeader } from "@/components/shared/page-header";
import { MemberTable } from "./components/member-table";

export default async function MembersPage() {
  const members = await getMembers();

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Members"
        description={`${members.length} registered member${members.length !== 1 ? "s" : ""} — visitors who signed up (Google or email)`}
      />
      <MemberTable members={members} />
    </div>
  );
}
