import { cache } from 'react';
import { getHomeFeedArticlesCached } from "./home-feed-shapes";

export const getHomeFeedArticles = cache(() => getHomeFeedArticlesCached());
