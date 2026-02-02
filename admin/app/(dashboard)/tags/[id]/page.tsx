import { redirect } from "next/navigation";
import { getTagById, getTagArticles } from "../actions/tags-actions";
import { PageHeader } from "@/components/shared/page-header";
import { TagView } from "./components/tag-view";
import { TagArticles } from "./components/tag-articles";
import { DeleteTagButton } from "./components/delete-tag-button";

export default async function TagViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const [tag, articles] = await Promise.all([
    getTagById(id),
    getTagArticles(id),
  ]);

  if (!tag) {
    redirect("/tags");
  }

  return (
    <div className="container mx-auto max-w-[1128px]">
      <PageHeader
        title="Tag Details"
        description="View tag information and articles"
      />
      <div className="mb-6">
        <DeleteTagButton tagId={id} />
      </div>
      <div className="space-y-6">
        <TagView tag={tag} />
        <TagArticles articles={articles} tagId={id} />
      </div>
    </div>
  );
}
