"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Facebook, Sparkles, Instagram, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  postArticleToFacebook,
  postArticleToInstagram,
  generateFacebookHookAI,
  generateFacebookBodyAI,
  generateInstagramPreview,
  generateInstagramDefaultPreview,
} from "../../_actions";

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

type PlatformResult = { type: "success" | "error"; msg: string };

function assembleFbCaption(hook: string, body: string, slug: string, hashtags: string): string {
  const link = `https://www.modonty.com/articles/${slug}`;
  const parts = [`✨ ${hook}`, body, `اقرأها الآن 👇\n🔗 ${link}`];
  if (hashtags.trim()) parts.push(hashtags.trim());
  return parts.join("\n\n");
}

function assembleIgCaption(hook: string, body: string, igHashtags: string): string {
  const parts = [`✨ ${hook}`, body, `رابط في البايو ☝️`];
  if (igHashtags.trim()) parts.push(igHashtags.trim());
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
  const igHashtags = article.tags.slice(0, 5).map((t) => `#${t.replace(/\s+/g, "_")}`).join(" ");
  const originalHook = article.seoTitle || article.title;
  const originalBody = article.seoDescription || "";

  const [hook, setHook] = useState(originalHook);
  const [body, setBody] = useState(originalBody);
  const [postToFacebook, setPostToFacebook] = useState(true);
  const [postToInstagram, setPostToInstagram] = useState(true);
  const [igSource, setIgSource] = useState<"default" | "ai" | "media">("default");
  const [igPreviewUrl, setIgPreviewUrl] = useState<string | null>(null);
  const [defaultPreviewUrl, setDefaultPreviewUrl] = useState<string | null>(null);
  const [mediaSelectedUrl, setMediaSelectedUrl] = useState<string | null>(null);
  const [isGeneratingPreview, startGeneratingPreview] = useTransition();
  const [isGeneratingDefault, startGeneratingDefault] = useTransition();
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [defaultPreviewError, setDefaultPreviewError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isGeneratingHook, startGeneratingHook] = useTransition();
  const [isGeneratingBody, startGeneratingBody] = useTransition();
  const [hookError, setHookError] = useState<string | null>(null);
  const [bodyError, setBodyError] = useState<string | null>(null);
  const [fbResult, setFbResult] = useState<PlatformResult | null>(null);
  const [igResult, setIgResult] = useState<PlatformResult | null>(null);
  const fullCaption = assembleFbCaption(hook, body, article.slug, autoHashtags);
  const igCaption = assembleIgCaption(hook, body, igHashtags);
  const noneSelected = !postToFacebook && !postToInstagram;
  const alreadyPosted = (!postToFacebook || fbResult?.type === "success") && (!postToInstagram || igResult?.type === "success");
  const activeIgImageUrl =
    igSource === "default" ? defaultPreviewUrl :
    igSource === "ai" ? igPreviewUrl :
    mediaSelectedUrl;

  const enabledPlatforms = [
    postToFacebook && "Facebook",
    postToInstagram && "Instagram",
  ].filter(Boolean).join(" & ");

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

  function handleGeneratePreview() {
    setPreviewError(null);
    setIgPreviewUrl(null);
    startGeneratingPreview(async () => {
      const res = await generateInstagramPreview(article.id);
      if (res.success && res.url) setIgPreviewUrl(res.url);
      else setPreviewError(res.error ?? "Preview generation failed");
    });
  }

  function handleGenerateDefaultPreview() {
    setDefaultPreviewError(null);
    setDefaultPreviewUrl(null);
    startGeneratingDefault(async () => {
      const res = await generateInstagramDefaultPreview(article.id);
      if (res.success && res.url) setDefaultPreviewUrl(res.url);
      else setDefaultPreviewError(res.error ?? "Failed to process cover image");
    });
  }

  function handleConfirmedPost() {
    startTransition(async () => {
      setFbResult(null);
      setIgResult(null);

      if (postToFacebook) {
        const res = await postArticleToFacebook(article.id, fullCaption, article.imageUrl);
        setFbResult(
          res.success
            ? { type: "success", msg: `Facebook ✅  Post ID: ${res.postId}` }
            : { type: "error", msg: `Facebook ❌  ${res.error}` }
        );
      }

      if (postToInstagram) {
        const res = await postArticleToInstagram(article.id, igCaption, activeIgImageUrl ?? undefined);
        setIgResult(
          res.success
            ? { type: "success", msg: `Instagram ✅  Post ID: ${res.postId}` }
            : { type: "error", msg: `Instagram ❌  ${res.error}` }
        );
      }

    });
  }

  return (
    <div className="p-6 max-w-[640px] mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-border">
        <button
          className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => router.push("/social/facebook")}
        >
          ← Back
        </button>
        <span className="text-border text-xs">/</span>
        <p className="text-sm font-medium text-foreground truncate" dir="rtl">{article.title}</p>
      </div>

      {/* Publish button + platform toggles */}
      <div className="flex items-center gap-2">
        {/* Platform checkboxes */}
        <div className="flex items-center gap-1 shrink-0 border border-border rounded-lg px-2 h-10 bg-[#161616]">
          <label className="flex items-center gap-1.5 cursor-pointer px-1.5 py-1 rounded hover:bg-muted/20 transition-colors">
            <Checkbox id="fb-top" checked={postToFacebook} onCheckedChange={(v) => setPostToFacebook(!!v)} />
            <Facebook className="h-3 w-3 text-[#1877F2]" />
          </label>
          <div className="w-px h-4 bg-border" />
          <label className="flex items-center gap-1.5 cursor-pointer px-1.5 py-1 rounded hover:bg-muted/20 transition-colors">
            <Checkbox id="ig-top" checked={postToInstagram} onCheckedChange={(v) => setPostToInstagram(!!v)} />
            <Instagram className="h-3 w-3 text-[#e1306c]" />
          </label>
        </div>

        {/* Publish button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="flex-1 h-10 text-[13px] font-semibold rounded-lg"
              disabled={isPending || noneSelected || alreadyPosted}
            >
              {isPending ? (
                <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin me-2" />Publishing…</>
              ) : noneSelected ? (
                "Select platform"
              ) : (
                `Publish to ${enabledPlatforms}`
              )}
            </Button>
          </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish to {enabledPlatforms}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will publish immediately.
              {postToInstagram && !activeIgImageUrl && " ⚠️ No Instagram image selected — generate or pick from media first."}
              {postToInstagram && activeIgImageUrl && " Instagram image ready at 1080×1350."}
              {" "}You can&apos;t undo this from the admin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="text-white"
              style={{
                background: postToFacebook && postToInstagram
                  ? "linear-gradient(135deg, #1877F2, #DD2A7B)"
                  : postToFacebook
                  ? "#1877F2"
                  : "linear-gradient(135deg, #F58529, #DD2A7B)",
              }}
              onClick={handleConfirmedPost}
            >
              Yes, Publish Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Results */}
      {(fbResult || igResult) && (
        <div className="space-y-1.5">
          {fbResult && (
            <div className={`text-[11px] px-3 py-2 rounded-lg border ${fbResult.type === "success" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
              {fbResult.msg}
            </div>
          )}
          {igResult && (
            <div className={`text-[11px] px-3 py-2 rounded-lg border ${igResult.type === "success" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
              {igResult.msg}
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="content">
        <TabsList className="w-full justify-start bg-[#161616] border border-border h-9 p-1 gap-0.5 rounded-lg">
          <TabsTrigger value="content" className="text-xs h-7 px-3 data-[state=active]:bg-background rounded-md">
            Content
          </TabsTrigger>
          <TabsTrigger value="facebook" className="text-xs h-7 px-3 data-[state=active]:bg-background rounded-md flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${postToFacebook ? "bg-[#1877F2]" : "bg-muted-foreground/25"}`} />
            Facebook
          </TabsTrigger>
          <TabsTrigger value="instagram" className="text-xs h-7 px-3 data-[state=active]:bg-background rounded-md flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${postToInstagram ? "bg-[#e1306c]" : "bg-muted-foreground/25"}`} />
            Instagram
          </TabsTrigger>
        </TabsList>

        {/* ── Content Tab ── */}
        <TabsContent value="content" className="mt-3 space-y-3">
          {/* Hook */}
          <div className="rounded-lg border border-border bg-[#161616] px-3.5 py-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Hook</p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">First line — shown before &quot;See more&quot;</p>
              </div>
              <div className="flex items-center gap-1">
                {hook !== originalHook && (
                  <Button variant="ghost" size="sm" className="h-6 text-[11px] px-2 text-muted-foreground" onClick={() => setHook(originalHook)}>
                    Reset
                  </Button>
                )}
                <Button variant="outline" size="sm" className="h-6 text-[11px] px-2 gap-1" onClick={handleGenerateHook} disabled={isGeneratingHook}>
                  {isGeneratingHook
                    ? <span className="h-2.5 w-2.5 border border-current/30 border-t-current rounded-full animate-spin" />
                    : <Sparkles className="h-2.5 w-2.5 text-amber-400" />}
                  AI
                </Button>
              </div>
            </div>
            <Input value={hook} onChange={(e) => setHook(e.target.value)} className="text-sm h-8" dir="rtl" placeholder="السطر الأول — Hook جذاب" />
            {hookError && <p className="text-[10px] text-red-400 mt-1">{hookError}</p>}
          </div>

          {/* Body */}
          <div className="rounded-lg border border-border bg-[#161616] px-3.5 py-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Body</p>
              <div className="flex items-center gap-1">
                {body !== originalBody && (
                  <Button variant="ghost" size="sm" className="h-6 text-[11px] px-2 text-muted-foreground" onClick={() => setBody(originalBody)}>
                    Reset
                  </Button>
                )}
                <Button variant="outline" size="sm" className="h-6 text-[11px] px-2 gap-1" onClick={handleGenerateBody} disabled={isGeneratingBody}>
                  {isGeneratingBody
                    ? <span className="h-2.5 w-2.5 border border-current/30 border-t-current rounded-full animate-spin" />
                    : <Sparkles className="h-2.5 w-2.5 text-amber-400" />}
                  AI
                </Button>
              </div>
            </div>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[100px] resize-none text-sm leading-relaxed"
              dir="rtl"
              placeholder="شرح قصير — قيمة فعلية للقارئ"
            />
            {bodyError && <p className="text-[10px] text-red-400 mt-1">{bodyError}</p>}
            <p className={`text-[10px] text-end mt-1 ${fullCaption.length > 480 ? "text-red-400" : "text-muted-foreground/40"}`}>
              {fullCaption.length} / 500
            </p>
          </div>

          {/* Caption preview */}
          <div className="rounded-lg border border-border bg-[#161616] px-3.5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Facebook Caption Preview</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap" dir="rtl">{fullCaption}</p>
          </div>
        </TabsContent>

        {/* ── Facebook Tab ── */}
        <TabsContent value="facebook" className="mt-3 space-y-3">
          {/* Facebook accurate preview */}
          <div className={`rounded-xl border border-border bg-[#18191a] overflow-hidden transition-opacity ${!postToFacebook ? "opacity-40 pointer-events-none" : ""}`}>
            {/* Page header */}
            <div className="flex items-center gap-2 px-3 pt-3 pb-2">
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-[#1877F2] flex items-center justify-center">
                {pagePictureUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={pagePictureUrl} alt="Modonty" className="w-full h-full object-cover" />
                  : <Facebook className="h-4 w-4 text-white" />}
              </div>
              <div>
                <p className="text-[12px] font-semibold text-foreground leading-tight">Modonty | مُدَوَّنَتِي</p>
                <p className="text-[10px] text-muted-foreground">الآن · 🌐</p>
              </div>
            </div>

            {/* Caption — labeled anatomy */}
            <div className="px-3 pb-2 space-y-1.5" dir="rtl">
              {/* Hook */}
              <div className="flex items-start gap-1.5">
                <span className="shrink-0 mt-0.5 text-[8px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded uppercase">Hook</span>
                <p className="text-[12px] text-foreground font-medium leading-snug">✨ {hook}</p>
              </div>
              {/* Body */}
              {body && (
                <div className="flex items-start gap-1.5">
                  <span className="shrink-0 mt-0.5 text-[8px] font-bold bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase">Body</span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{body}</p>
                </div>
              )}
              {/* CTA + Link */}
              <div className="flex items-start gap-1.5">
                <span className="shrink-0 mt-0.5 text-[8px] font-bold bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded uppercase">CTA</span>
                <div>
                  <p className="text-[11px] text-muted-foreground">اقرأها الآن 👇</p>
                  <p className="text-[11px] text-[#1877F2]">🔗 modonty.com/articles/{article.slug}</p>
                </div>
              </div>
              {/* Hashtags */}
              {autoHashtags && (
                <div className="flex items-start gap-1.5">
                  <span className="shrink-0 mt-0.5 text-[8px] font-bold bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded uppercase">Tags</span>
                  <p className="text-[11px] text-[#1877F2]">{autoHashtags}</p>
                </div>
              )}
              {fullCaption.length > 477 && (
                <p className="text-[10px] text-amber-400/80">⚠ النص طويل — Facebook يقطعه ويضيف &quot;See more&quot;</p>
              )}
            </div>

            {/* Article cover image — 16:9, appears below caption on Facebook */}
            {article.imageUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={article.imageUrl} alt="" className="w-full aspect-video object-cover" />
              : <div className="w-full aspect-video bg-muted/20 flex items-center justify-center text-[10px] text-muted-foreground/30">No cover image</div>}
            <div className="px-3 py-1.5 bg-[#242526]">
              <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wide">MODONTY.COM</p>
            </div>
          </div>
        </TabsContent>

        {/* ── Instagram Tab ── */}
        <TabsContent value="instagram" className="mt-3 space-y-3">

          {postToInstagram && (
            <div className="rounded-lg border border-border bg-[#161616] p-3 space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Image Source</p>
              <div className="flex border border-border rounded overflow-hidden">
                {(["default", "ai", "media"] as const).map((src, i) => (
                  <button
                    key={src}
                    className={`flex-1 py-1.5 text-[11px] font-medium transition-colors ${i > 0 ? "border-s border-border" : ""} ${igSource === src ? "bg-[#262626] text-foreground" : "bg-transparent text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setIgSource(src)}
                  >
                    {src === "default" ? "⬤ Default" : src === "ai" ? "✦ AI" : "📷 Media"}
                  </button>
                ))}
              </div>

              {igSource === "default" && (
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground">
                    صورة الغلاف · <span className="font-mono">Sharp</span> يقصّها <span className="text-white/60">1080×1350</span> + blur · مجاني
                  </p>
                  <button
                    className="w-full h-7 bg-background border border-[#374151] text-muted-foreground text-[11px] font-medium rounded flex items-center justify-center gap-1.5 hover:bg-muted/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={handleGenerateDefaultPreview}
                    disabled={isGeneratingDefault || !article.imageUrl}
                  >
                    {isGeneratingDefault
                      ? <><span className="h-2.5 w-2.5 border border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" /> Processing…</>
                      : defaultPreviewUrl ? "↺ Re-process" : "Preview Default Image"}
                  </button>
                  {defaultPreviewError && <p className="text-[10px] text-red-400">{defaultPreviewError}</p>}
                  {defaultPreviewUrl && <p className="text-[10px] text-green-400">✓ Default image ready</p>}
                  {!article.imageUrl && <p className="text-[10px] text-amber-400">⚠ No cover image on this article</p>}
                </div>
              )}

              {igSource === "ai" && (
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground">
                    FLUX 1.1 Pro · Saudi business context · No text · <span className="text-muted-foreground/60">$0.04/image</span>
                  </p>
                  <button
                    className="w-full h-7 bg-background border border-[#374151] text-muted-foreground text-[11px] font-medium rounded flex items-center justify-center gap-1.5 hover:bg-muted/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={handleGeneratePreview}
                    disabled={isGeneratingPreview}
                  >
                    {isGeneratingPreview
                      ? <><span className="h-2.5 w-2.5 border border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" /> Generating…</>
                      : <><Instagram className="h-2.5 w-2.5 text-pink-400" /> {igPreviewUrl ? "↺ Regenerate" : "Generate Preview"}</>}
                  </button>
                  {previewError && <p className="text-[10px] text-red-400">{previewError}</p>}
                  {igPreviewUrl && <p className="text-[10px] text-green-400">✓ Preview ready — Publish will use this image</p>}
                </div>
              )}

              {igSource === "media" && (
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground">Select from article media library</p>
                  <div className="grid grid-cols-5 gap-1">
                    {article.imageUrl && (
                      <button
                        className={`aspect-square rounded overflow-hidden border-2 transition-colors ${mediaSelectedUrl === article.imageUrl ? "border-[#e1306c]" : "border-transparent hover:border-muted-foreground/30"}`}
                        onClick={() => setMediaSelectedUrl(article.imageUrl!)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={article.imageUrl} alt="" className="w-full h-full object-cover" />
                      </button>
                    )}
                    {Array.from({ length: article.imageUrl ? 9 : 10 }).map((_, i) => (
                      <div key={i} className="aspect-square rounded bg-muted/10 border border-dashed border-border/50" />
                    ))}
                  </div>
                  {mediaSelectedUrl && <p className="text-[10px] text-blue-400">✓ Image selected</p>}
                </div>
              )}
            </div>
          )}

          {/* Instagram accurate preview */}
          <div className={`rounded-xl border border-border bg-[#000] overflow-hidden transition-opacity ${!postToInstagram ? "opacity-40 pointer-events-none" : ""}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] font-bold p-0.5" style={{ background: "linear-gradient(135deg, #F58529, #DD2A7B, #8134AF)" }}>
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[9px]">M</div>
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-white leading-tight flex items-center gap-1.5">
                    modonty
                    {(isGeneratingDefault || isGeneratingPreview) && <span className="text-[9px] text-muted-foreground animate-pulse">Processing…</span>}
                    {igSource === "default" && defaultPreviewUrl && <span className="text-[9px] bg-zinc-500/20 text-zinc-400 px-1.5 py-0.5 rounded">Default</span>}
                    {igSource === "ai" && igPreviewUrl && <span className="text-[9px] bg-pink-500/20 text-pink-400 px-1.5 py-0.5 rounded">AI</span>}
                    {igSource === "media" && mediaSelectedUrl && <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Media</span>}
                  </p>
                </div>
              </div>
              <span className="text-white text-lg leading-none">···</span>
            </div>

            {/* 4:5 image */}
            {activeIgImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activeIgImageUrl} alt="Instagram preview" className="w-full" style={{ aspectRatio: "4/5", objectFit: "cover" }} />
            ) : article.imageUrl ? (
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4/5" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={article.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover scale-110" style={{ filter: "blur(20px) brightness(0.4)" }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={article.imageUrl} alt="" className="absolute inset-x-0 w-full object-cover" style={{ top: "50%", transform: "translateY(-50%)" }} />
                <div className="absolute inset-0 flex items-end justify-center pb-4">
                  <span className="text-[9px] bg-black/80 text-white/50 px-2 py-1 rounded-full">Generate AI image or pick from media</span>
                </div>
              </div>
            ) : (
              <div className="w-full bg-[#111] flex flex-col items-center justify-center gap-2" style={{ aspectRatio: "4/5" }}>
                <ImageIcon className="h-6 w-6 text-white/20" />
                <p className="text-[10px] text-white/30">No image selected</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between px-3 pt-2.5">
              <div className="flex items-center gap-3 text-white text-[18px]">
                <span>♡</span><span>💬</span><span>✈</span>
              </div>
              <span className="text-white text-[16px]">🔖</span>
            </div>

            {/* Caption — IG anatomy */}
            <div className="px-3 pt-1.5 pb-3 space-y-1" dir="rtl">
              {/* Hook — visible before "more" */}
              <div className="flex items-start gap-1.5">
                <span className="shrink-0 mt-0.5 text-[8px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded uppercase">Hook · visible</span>
                <p className="text-[12px] text-white font-medium leading-snug">
                  <span className="font-bold">modonty</span>{" "}✨ {hook}
                </p>
              </div>
              <p className="text-[11px] text-white/30 ps-[52px]">
                ...{" "}<span className="text-white/50">المزيد</span>
              </p>
              {/* Hidden under "more" */}
              {body && (
                <div className="flex items-start gap-1.5 pt-1">
                  <span className="shrink-0 mt-0.5 text-[8px] font-bold bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase">Body</span>
                  <p className="text-[11px] text-white/50 leading-relaxed line-clamp-2">{body}</p>
                </div>
              )}
              {/* Link in bio */}
              <div className="flex items-start gap-1.5">
                <span className="shrink-0 mt-0.5 text-[8px] font-bold bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded uppercase">Link</span>
                <p className="text-[11px] text-white/50">رابط في البايو ☝️</p>
              </div>
              {/* Hashtags */}
              {igHashtags && (
                <div className="flex items-start gap-1.5">
                  <span className="shrink-0 mt-0.5 text-[8px] font-bold bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded uppercase">Tags</span>
                  <p className="text-[11px] text-[#a78bfa]">{igHashtags}</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
