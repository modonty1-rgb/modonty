"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/app/(dashboard)/articles/components/rich-text-editor";

interface BasicSectionProps {
  title: string;
  content: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  headerAction?: React.ReactNode;
}

export function BasicSection({
  title,
  content,
  onTitleChange,
  onContentChange,
  headerAction,
}: BasicSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Basic Information</CardTitle>
        {headerAction}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <span className="text-xs text-amber-700 shrink-0">Ref: JSON-LD WebPage.name, AboutPage.name</span>
          </div>
          <Input
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter page title"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <Label htmlFor="content">
              Content <span className="text-destructive">*</span>
            </Label>
            <span className="text-xs text-amber-700 shrink-0">Ref: Page body (GEO content parity)</span>
          </div>
          <RichTextEditor
            content={content}
            onChange={onContentChange}
            placeholder="Start writing content..."
          />
        </div>
      </CardContent>
    </Card>
  );
}
