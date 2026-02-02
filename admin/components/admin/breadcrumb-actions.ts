'use server';

import { getArticleById } from '@/app/(dashboard)/articles/actions/articles-actions';
import { getClientById } from '@/app/(dashboard)/clients/actions/clients-actions';
import { getCategoryById } from '@/app/(dashboard)/categories/actions/categories-actions';
import { getTagById } from '@/app/(dashboard)/tags/actions/tags-actions';
import { getIndustryById } from '@/app/(dashboard)/industries/actions/industries-actions';
import { getMediaById } from '@/app/(dashboard)/media/actions/get-media-by-id';
import { getUserById } from '@/app/(dashboard)/users/actions/users-actions';
import { getModontyAuthor } from '@/app/(dashboard)/authors/actions/authors-actions';

function normalizeEntityType(type: string): string {
  const pluralToSingular: Record<string, string> = {
    articles: 'article',
    clients: 'client',
    categories: 'category',
    tags: 'tag',
    industries: 'industry',
    authors: 'author',
    users: 'user',
  };
  return pluralToSingular[type] || type;
}

export async function getEntityName(type: string, id: string): Promise<string | null> {
  try {
    const normalizedType = normalizeEntityType(type);
    switch (normalizedType) {
      case 'article': {
        const article = await getArticleById(id);
        return article?.title || null;
      }
      case 'client': {
        const client = await getClientById(id);
        return client?.name || null;
      }
      case 'category': {
        const category = await getCategoryById(id);
        return category?.name || null;
      }
      case 'tag': {
        const tag = await getTagById(id);
        return tag?.name || null;
      }
      case 'industry': {
        const industry = await getIndustryById(id);
        return industry?.name || null;
      }
      case 'media': {
        const media = await getMediaById(id);
        return media?.filename || media?.url?.split('/').pop() || null;
      }
      case 'user': {
        const user = await getUserById(id);
        return user?.name || null;
      }
      case 'author': {
        const author = await getModontyAuthor();
        return author?.name || null;
      }
      default:
        return null;
    }
  } catch (error) {
    console.error(`Error fetching ${type} name:`, error);
    return null;
  }
}