import { redirect } from "next/navigation";
import { getTagById } from "../../actions/tags-actions";
import { TagForm } from "../../components/tag-form";
import { DeleteTagButton } from "../components/delete-tag-button";
import { RevalidateSEOButton } from "../components/revalidate-seo-button";
import { SeoCachePreview } from "@/components/shared/seo-cache-preview";

export default async function EditTagPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tag = await getTagById(id);

  if (!tag) {
    redirect("/tags");
  }

  return (
    <div className="container mx-auto max-w-[1128px]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">Edit Tag</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Update tag information</p>
        </div>
        <div className="flex items-center gap-2">
          <RevalidateSEOButton tagId={id} />
          <DeleteTagButton tagId={id} />
        </div>
      </div>
      <SeoCachePreview
        jsonLd={tag.jsonLdStructuredData}
        metaTags={tag.nextjsMetadata}
        lastGenerated={tag.jsonLdLastGenerated}
      />
      <TagForm initialData={tag} tagId={id} />
    </div>
  );
}
