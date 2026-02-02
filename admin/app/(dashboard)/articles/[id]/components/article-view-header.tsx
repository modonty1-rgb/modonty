"use client";

import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { getStatusLabel, getStatusVariant } from "../../helpers/status-utils";
import {
  Calendar,
  Clock,
  FileText,
  User,
  Folder,
  Star,
  Eye,
} from "lucide-react";
import { Article } from "../helpers/article-view-types";
import { FieldLabel } from "./shared/field-label";
import { CopyableId } from "./shared/copyable-id";

interface ArticleViewHeaderProps {
  article: Article;
}

export function ArticleViewHeader({ article }: ArticleViewHeaderProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            {article.featured && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm px-3 py-1 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700">
                  <Star className="h-3.5 w-3.5 mr-1.5 fill-yellow-500 dark:fill-yellow-400" />
                  Featured
                </Badge>
                <FieldLabel
                  label=""
                  fieldPath="article.featured"
                  fieldType="Boolean"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <Badge variant={getStatusVariant(article.status)} className="text-sm px-3 py-1">
                {getStatusLabel(article.status)}
              </Badge>
              <FieldLabel
                label=""
                fieldPath="article.status"
                fieldType="ArticleStatus"
              />
            </div>
            {article.category?.name && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Folder className="h-4 w-4" />
                <span className="font-medium text-foreground">{article.category.name}</span>
                <FieldLabel
                  label=""
                  fieldPath="article.category"
                  fieldType="Category?"
                  idValue={article.category.id}
                  idLabel="Category ID"
                />
              </div>
            )}
            {article.author?.name && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="font-medium text-foreground">{article.author.name}</span>
                <FieldLabel
                  label=""
                  fieldPath="article.author"
                  fieldType="Author"
                  idValue={article.author.id}
                  idLabel="Author ID"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(article.createdAt), "MMM d, yyyy")}</span>
              <FieldLabel
                label=""
                fieldPath="article.createdAt"
                fieldType="DateTime"
              />
            </div>
            {article.lastReviewed && (
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>Reviewed {format(new Date(article.lastReviewed), "MMM d, yyyy")}</span>
                <FieldLabel
                  label=""
                  fieldPath="article.lastReviewed"
                  fieldType="DateTime?"
                />
              </div>
            )}
            {article.readingTimeMinutes && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>~{article.readingTimeMinutes} min read</span>
                <FieldLabel
                  label=""
                  fieldPath="article.readingTimeMinutes"
                  fieldType="Int?"
                />
              </div>
            )}
            {article.contentDepth && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>{article.contentDepth}</span>
                <FieldLabel
                  label=""
                  fieldPath="article.contentDepth"
                  fieldType="String?"
                />
              </div>
            )}
            {article.license && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>License: {article.license}</span>
                <FieldLabel
                  label=""
                  fieldPath="article.license"
                  fieldType="String?"
                  value={article.license}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
