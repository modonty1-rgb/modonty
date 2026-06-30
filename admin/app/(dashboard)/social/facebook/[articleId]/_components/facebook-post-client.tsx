"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Facebook, ArrowLeft, ExternalLink, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { postArticleToFacebook, generateFacebookHookAI, generateFacebookBodyAI } from "../../_actions";

type Article = {
  id: string;
  title: string;
  slug: string;
  seoTitle: string | null;
  seoDescription: string | null;
  imageUrl: string | null;
  tags: string[];
  clientName: string | null;
  datePublished: string | null;
};

function assembleCaption(hook: string, body: string, slug: string, hashtags: string): string {
  const link = `https://www.modonty.com/articles/${slug}`;
  const parts = [`✨ ${hook}`, body, `اقرأها الآن 👇\n🔗 ${link}`];
  if (hashtags.trim()) parts.push(hashtags.trim());
  return parts.join("\n\n");
}

export default function FacebookPostClient({
  article,
  pagePictureUrl,
}: {
  article: Article;
  pagePictureUrl: string | null;
}) {
  const router = useRouter();

  const autoHashtags = article.tags.slice(0, 2).map((t) => `#${t.replace(/\s+/g, "_")}`).join(" ");
  const originalHook = article.seoTitle || article.title;
  const originalBody = article.seoDescription || "";

  const [hook, setHook] = useState(originalHook);
  const [body, setBody] = useState(originalBody);
  const [isPending, startTransition] = useTransition();
  const [isGeneratingHook, startGeneratingHook] = useTransition();
  const [isGeneratingBody, startGeneratingBody] = useTransition();
  const [hookError, setHookError] = useState<string | null>(null);
  const [bodyError, setBodyError] = useState<string | null>(null);
  const [result, setResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const fullCaption = assembleCaption(hook, body, article.slug, autoHashtags);

  function handleGenerateHook() {
    setHookError(null);
    startGeneratingHook(async () => {
      const res = await generateFacebookHookAI(article.seoTitle || article.title, article.seoDescription || "");
      if (res.success && res.hook) setHook(res.hook);
      else setHookError(res.error ?? "AI generation failed");
    });
  }

  function handleGenerateBody() {
    setBodyError(null);
    startGeneratingBody(async () => {
      const res = await generateFacebookBodyAI(article.seoTitle || article.title, article.seoDescription || "");
      if (res.success && res.body) setBody(res.body);
      else setBodyError(res.error ?? "AI generation failed");
    });
  }

  function handleConfirmedPost() {
    startTransition(async () => {
      setResult(null);
      const res = await postArticleToFacebook(article.id, fullCaption, article.imageUrl);
      if (res.success) {
        setResult({ type: "success", msg: `Posted successfully! Post ID: ${res.postId}` });
        setTimeout(() => router.push("/social/facebook"), 2000);
      } else {
        setResult({ type: "error", msg: res.error ?? "Failed to post" });
      }
    });
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={() => router.push("/social/facebook")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded bg-[#1877F2] flex items-center justify-center shrink-0">
            <Facebook className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-medium">Post to Facebook</span>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_400px] gap-6 items-start">
        {/* Left — editor */}
        <div className="space-y-4">
          {/* Article info */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Article</p>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-1.5">
              <p className="font-semibold text-base leading-snug" dir="rtl">{article.title}</p>
              <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                {article.clientName && (
                  <span className="bg-muted rounded px-2 py-0.5">{article.clientName}</span>
                )}
                {article.datePublished && (
                  <span>
                    {new Intl.DateTimeFormat("en-GB", {
                      day: "2-digit", month: "short", year: "numeric",
                    }).format(new Date(article.datePublished))}
                  </span>
                )}
                <a
                  href={`https://www.modonty.com/articles/${article.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                >
                  View article <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Hook */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Hook</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">First line — shown before "See more"</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {hook !== originalHook && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => setHook(originalHook)}>
                      Reset
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1.5"
                    onClick={handleGenerateHook}
                    disabled={isGeneratingHook}
                  >
                    {isGeneratingHook ? (
                      <span className="h-3 w-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3 text-yellow-400" />
                    )}
                    {isGeneratingHook ? "Generating…" : "Generate with AI"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              <Input
                value={hook}
                onChange={(e) => setHook(e.target.value)}
                className="text-sm"
                dir="rtl"
                placeholder="السطر الأول — Hook جذاب يلمس المشكلة"
              />
              {hookError && <p className="text-xs text-red-400">{hookError}</p>}
            </CardContent>
          </Card>

          {/* Body */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Body</p>
                <div className="flex items-center gap-1.5">
                  {body !== originalBody && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => setBody(originalBody)}>
                      Reset
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1.5"
                    onClick={handleGenerateBody}
                    disabled={isGeneratingBody}
                  >
                    {isGeneratingBody ? (
                      <span className="h-3 w-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3 text-yellow-400" />
                    )}
                    {isGeneratingBody ? "Generating…" : "Generate with AI"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[120px] resize-none text-sm leading-relaxed"
                dir="rtl"
                placeholder="شرح قصير — قيمة فعلية للقارئ"
              />
              {bodyError && <p className="text-xs text-red-400">{bodyError}</p>}
            </CardContent>
          </Card>

          {/* Char count */}
          <p className={`text-xs text-end ${fullCaption.length > 480 ? "text-red-400" : "text-muted-foreground"}`}>
            {fullCaption.length} / 500
          </p>

          {/* Feedback */}
          {result && (
            <div
              className={`text-sm px-4 py-3 rounded-lg border ${
                result.type === "success"
                  ? "bg-green-500/10 text-green-400 border-green-500/20"
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}
            >
              {result.msg}
            </div>
          )}

          {/* Post button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="w-full bg-[#1877F2] hover:bg-[#1565d8] text-white h-11 text-sm"
                disabled={isPending || result?.type === "success"}
              >
                {isPending ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin me-2" />
                    Posting to Facebook…
                  </>
                ) : (
                  <>
                    <Facebook className="h-4 w-4 me-2" />
                    Post to Facebook
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Post to Facebook?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will publish the post to the Modonty Facebook Page immediately. You can&apos;t undo this from the admin — you&apos;d need to delete it directly on Facebook.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-[#1877F2] hover:bg-[#1565d8] text-white"
                  onClick={handleConfirmedPost}
                >
                  <Facebook className="h-4 w-4 me-1.5" />
                  Yes, Post Now
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Right — preview */}
        <div className="sticky top-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-3">
            Post Preview
          </p>
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="flex items-center gap-2.5 p-3">
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-[#1877F2]">
                {pagePictureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pagePictureUrl} alt="Modonty" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Facebook className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold">Modonty | مُدَوَّنَتِي</p>
                <p className="text-[11px] text-muted-foreground">Just now · 🌐</p>
              </div>
            </div>
            <div className="px-3 pb-2">
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words" dir="rtl">
                {fullCaption}
              </p>
            </div>
            {article.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={article.imageUrl} alt="" className="w-full aspect-video object-cover" />
            ) : (
              <div className="w-full aspect-video bg-muted flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Facebook className="h-8 w-8 opacity-20" />
                <p className="text-xs">Text post — no featured image</p>
              </div>
            )}
            <div className="flex border-t border-border">
              {["👍  Like", "💬  Comment", "↪  Share"].map((a) => (
                <button key={a} className="flex-1 py-2 text-xs text-muted-foreground hover:bg-muted/40 transition-colors">
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
