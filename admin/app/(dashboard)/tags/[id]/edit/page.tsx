import { redirect } from "next/navigation";
import { getTagById } from "../../actions/tags-actions";
import { PageHeader } from "@/components/shared/page-header";
import { TagForm } from "../../components/tag-form";
import { DeleteTagButton } from "../components/delete-tag-button";

export default async function EditTagPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tag = await getTagById(id);

  if (!tag) {
    redirect("/tags");
  }

  return (
    <div className="container mx-auto max-w-[1128px]">
      <PageHeader title="Edit Tag" description="Update tag information" />
      <div className="mb-6">
        <DeleteTagButton tagId={id} />
      </div>
      <TagForm initialData={tag} tagId={id} />
    </div>
  );
}
