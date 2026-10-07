"use server";

import { db } from "@/lib/db";

export interface SlugIssue {
  entity: string;
  label: string;
  emptySlugs: number;
}

export async function getSlugIntegrity(): Promise<SlugIssue[]> {
  const [articles, clients, categories, tags, authors, industries] = await Promise.all([
    db.article.count({ where: { slug: "" } }),
    db.client.count({ where: { slug: "" } }),
    db.category.count({ where: { slug: "" } }),
    db.tag.count({ where: { slug: "" } }),
    db.author.count({ where: { slug: "" } }),
    db.industry.count({ where: { slug: "" } }),
  ]);

  return [
    { entity: "articles", label: "Articles", emptySlugs: articles },
    { entity: "clients", label: "Clients", emptySlugs: clients },
    { entity: "categories", label: "Categories", emptySlugs: categories },
    { entity: "tags", label: "Tags", emptySlugs: tags },
    { entity: "authors", label: "Authors", emptySlugs: authors },
    { entity: "industries", label: "Industries", emptySlugs: industries },
  ];
}
