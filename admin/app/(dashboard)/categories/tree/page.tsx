import { getCategories } from "../actions/categories-actions";
import { CategoriesTreeClient } from "../components/categories-tree-client";

export default async function CategoriesTreePage() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto max-w-[1128px] space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Category Tree</h1>
        <p className="text-muted-foreground">
          Visualize your category hierarchy in a folder-style tree view.
        </p>
      </div>

      <div className="border rounded-lg p-4 bg-card">
        <CategoriesTreeClient categories={categories} />
      </div>
    </div>
  );
}

