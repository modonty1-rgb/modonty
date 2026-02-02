"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Heading from "@tiptap/extension-heading";
import CharacterCount from "@tiptap/extension-character-count";
import { LongParagraphHighlight } from "./extensions/long-paragraph-highlight";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaPickerDialog } from "@/components/shared/media-picker-dialog";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  clientId?: string | null;
  onStatsChange?: (stats: { wordCount: number; characterCount: number }) => void;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "ابدأ كتابة المحتوى...",
  className,
  clientId,
  onStatsChange,
}: RichTextEditorProps) {
  const { toast } = useToast();
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkRel, setLinkRel] = useState<"follow" | "nofollow" | "sponsored">("follow");
  const [linkTarget, setLinkTarget] = useState<"_blank" | "_self">("_blank");
  const linkSelectionRef = useRef<{ from: number; to: number } | null>(null);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            rel: {
              default: null,
              parseHTML: element => element.getAttribute('rel'),
              renderHTML: attributes => {
                if (!attributes.rel) return {};
                return { rel: attributes.rel };
              },
            },
            target: {
              default: null,
              parseHTML: element => element.getAttribute('target'),
              renderHTML: attributes => {
                if (!attributes.target) return {};
                return { target: attributes.target };
              },
            },
          };
        },
      }).configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-md",
        },
      }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      CharacterCount,
      LongParagraphHighlight.configure({
        maxLength: 500,
        className:
          "border-l-2 border-amber-500/60 bg-amber-500/10",
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl",
          "max-w-none min-h-[300px] p-4",
          "focus:outline-none",
          "rtl:text-right ltr:text-left",
          "[&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:mb-4",
          "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3",
          "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2",
          "[&_p]:mb-4 [&_p]:leading-relaxed",
          "[&_ul]:list-disc [&_ul]:mr-6 [&_ul]:mb-4",
          "[&_ol]:list-decimal [&_ol]:mr-6 [&_ol]:mb-4",
          "[&_blockquote]:border-r-4 [&_blockquote]:border-primary [&_blockquote]:pr-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
          "[&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm",
          "[&_a]:text-primary [&_a]:underline",
          "[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:my-4"
        ),
        dir: "rtl",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);

      const characterCount = editor.storage.characterCount?.characters() || 0;
      const actualWordCount = calculateWordCount(html);
      onStatsChange?.({ wordCount: actualWordCount, characterCount });
    },
  });

  const lastContentSet = useRef<string | null>(null);
  useEffect(() => {
    if (!editor) return;
    if (content === lastContentSet.current) return;
    const current = editor.getHTML();
    if (content !== current) {
      editor.commands.setContent(content ?? "", { emitUpdate: false });
      lastContentSet.current = content ?? "";
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const calculateWordCount = (text: string): number => {
    if (!text) return 0;
    const stripped = text.replace(/<[^>]*>/g, "");
    const words = stripped.trim().split(/\s+/).filter(Boolean);
    return words.length;
  };

  const wordCount = editor.storage.characterCount?.words() || 0;
  const characterCount = editor.storage.characterCount?.characters() || 0;
  const actualWordCount = calculateWordCount(editor.getHTML());

  return (
    <div className={cn("border border-border rounded-md bg-card", className)}>
      <div className="border-b border-border p-2 flex flex-wrap items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(editor.isActive("bold") && "bg-muted")}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(editor.isActive("italic") && "bg-muted")}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(editor.isActive("underline") && "bg-muted")}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(editor.isActive("strike") && "bg-muted")}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={cn(editor.isActive("code") && "bg-muted")}
        >
          <Code className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn(editor.isActive("heading", { level: 1 }) && "bg-muted")}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(editor.isActive("heading", { level: 2 }) && "bg-muted")}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(editor.isActive("heading", { level: 3 }) && "bg-muted")}
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(editor.isActive("bulletList") && "bg-muted")}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(editor.isActive("orderedList") && "bg-muted")}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(editor.isActive("blockquote") && "bg-muted")}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={cn(editor.isActive({ textAlign: "right" }) && "bg-muted")}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={cn(editor.isActive({ textAlign: "center" }) && "bg-muted")}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={cn(editor.isActive({ textAlign: "left" }) && "bg-muted")}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={cn(editor.isActive({ textAlign: "justify" }) && "bg-muted")}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            if (!clientId) {
              toast({
                title: "تحذير",
                description: "يرجى اختيار عميل أولاً لضمان تتبع الروابط الخلفية بشكل صحيح",
                variant: "destructive",
              });
              return;
            }
            
            const { from, to } = editor.state.selection;
            linkSelectionRef.current = { from, to };
            const attrs = editor.getAttributes("link");
            setLinkUrl(attrs.href || "");
            setLinkRel(attrs.rel === "nofollow" ? "nofollow" : attrs.rel === "sponsored" ? "sponsored" : "follow");
            setLinkTarget(attrs.target === "_blank" ? "_blank" : "_self");
            setLinkDialogOpen(true);
          }}
          className={cn(editor.isActive("link") && "bg-muted")}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setMediaPickerOpen(true)}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <MediaPickerDialog
          open={mediaPickerOpen}
          onOpenChange={setMediaPickerOpen}
          clientId={clientId || null}
          onSelect={(media) => {
            editor.chain().focus().setImage({ src: media.url, alt: media.altText || '' }).run();
            setMediaPickerOpen(false);
          }}
        />
        <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>إضافة رابط</DialogTitle>
              <DialogDescription>أدخل رابط URL مع خيارات SEO</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="link-url">رابط URL</Label>
                <Input
                  id="link-url"
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="link-rel">نوع الرابط</Label>
                  <Select value={linkRel} onValueChange={(value) => setLinkRel(value as typeof linkRel)}>
                    <SelectTrigger id="link-rel">
                      <SelectValue placeholder="Follow (default)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="follow">Follow</SelectItem>
                      <SelectItem value="nofollow">Nofollow</SelectItem>
                      <SelectItem value="sponsored">Sponsored</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    {linkRel === "follow" && "✅ يمرر قيمة SEO"}
                    {linkRel === "nofollow" && "⚠️ لا يمرر قيمة SEO"}
                    {linkRel === "sponsored" && "⚠️ رابط إعلاني"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link-target">فتح في</Label>
                  <Select value={linkTarget} onValueChange={(value) => setLinkTarget(value as typeof linkTarget)}>
                    <SelectTrigger id="link-target">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_blank">نافذة جديدة</SelectItem>
                      <SelectItem value="_self">نفس الصفحة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setLinkDialogOpen(false);
                  setLinkUrl("");
                  setLinkRel("follow");
                  setLinkTarget("_blank");
                }}
              >
                إلغاء
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (linkUrl.trim()) {
                    setLinkDialogOpen(false);
                    
                    const attrs: { href: string; target?: string; rel?: string } = {
                      href: linkUrl.trim(),
                    };
                    
                    if (linkRel) {
                      attrs.rel = linkRel;
                    }
                    
                    if (linkTarget === "_blank") {
                      attrs.target = "_blank";
                      attrs.rel = (attrs.rel ? `${attrs.rel} ` : "") + "noopener noreferrer";
                    }
                    
                    setTimeout(() => {
                      if (linkSelectionRef.current) {
                        const { from, to } = linkSelectionRef.current;
                        const selectedText = editor.state.doc.textBetween(from, to, " ");
                        
                        if (selectedText.trim()) {
                          editor.chain().focus().setTextSelection({ from, to }).setLink(attrs).run();
                        } else {
                          editor.chain().focus().setTextSelection({ from, to }).insertContent(`<a ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(" ")}>${linkUrl.trim()}</a>`).run();
                        }
                      } else {
                        editor.chain().focus().setLink(attrs).run();
                      }
                      setLinkUrl("");
                      setLinkRel("follow");
                      setLinkTarget("_blank");
                      linkSelectionRef.current = null;
                    }, 100);
                  }
                }}
              >
                إضافة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <EditorContent editor={editor} className="min-h-[300px]" />

      <div className="border-t border-border p-2 flex justify-between items-center text-xs text-muted-foreground">
        <div className="flex gap-4">
          <span>الكلمات: {actualWordCount}</span>
          <span>الأحرف: {characterCount}</span>
        </div>
        <div className="text-muted-foreground/70">Ctrl+K للأوامر السريعة</div>
      </div>
    </div>
  );
}
