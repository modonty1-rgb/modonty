import type { CommentStatus } from "@prisma/client";
import type { CommentKind } from "./comment-kind";

export interface CommentWithDetails {
  id: string;
  kind: CommentKind;
  content: string;
  status: CommentStatus;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  editedAt: Date | null;
  author: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  /** The article or the reel the comment hangs off — `href` points at its console page. */
  source: {
    id: string;
    title: string;
    href: string;
  };
  parent: {
    id: string;
    content: string;
  } | null;
  _count: {
    replies: number;
    likes: number;
    dislikes: number;
  };
}
