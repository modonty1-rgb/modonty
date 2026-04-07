import { getChangelogs, getAdminNotes } from "./actions";
import { ChangelogClient } from "./changelog-client";

export default async function ChangelogPage() {
  const [changelogs, notes] = await Promise.all([
    getChangelogs(),
    getAdminNotes(),
  ]);

  return (
    <div className="p-4 sm:p-6 max-w-[900px] mx-auto">
      <ChangelogClient
        changelogs={JSON.parse(JSON.stringify(changelogs))}
        notes={JSON.parse(JSON.stringify(notes))}
      />
    </div>
  );
}
