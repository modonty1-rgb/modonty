import { useState, useEffect } from "react";

import { fetchArticleComments } from "../data/fetch-article-comments";

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  status?: string;
  parentId?: string | null;
  replyingTo?: { id: string; authorName: string } | null;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  _count?: {
    likes: number;
    dislikes: number;
  };
  likes?: { id: string }[];
  dislikes?: { id: string }[];
}

/** The comments list and its loading state — fetched once the section is open and nothing arrived from the server. */
export function useArticleComments(
  initialComments: Comment[],
  articleId: string,
  userId: string | null | undefined,
  commentsOpen: boolean,
) {
  const [comments, setComments] = useState(initialComments);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(initialComments.length > 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!commentsOpen || fetched) return;
    setLoading(true);
    setError(null);
    fetchArticleComments(articleId)
      .then((data) => {
        setComments(Array.isArray(data) ? data : []);
        setFetched(true);
      })
      .catch(() => setError("فشل تحميل التعليقات"))
      .finally(() => setLoading(false));
  }, [commentsOpen, fetched, articleId, userId]);

  return { comments, setComments, loading, fetched, setFetched, error, setError };
}
