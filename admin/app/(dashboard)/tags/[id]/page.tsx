import { redirect } from "next/navigation";
import { getTagById, getTagArticles } from "../actions/tags-actions";
import { TagView } from "./components/tag-view";
import { TagArticles } from "./components/tag-articles";
import { DeleteTagButton } from "./components/delete-tag-button";
import { RevalidateSEOButton } from "./components/revalidate-seo-button";

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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">Tag Details</h1>
          <p className="text-sm text-muted-foreground mt-0.5">View tag information and articles</p>
        </div>
        <div className="flex items-center gap-2">
          <RevalidateSEOButton tagId={id} />
          <DeleteTagButton tagId={id} />
        </div>
      </div>
      <div className="space-y-6">
        <TagView tag={tag} />
        <TagArticles articles={articles} tagId={id} />
      </div>
    </div>
  );
}
