"use client";

import { useState, useMemo, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Bot, Globe, Wand2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ChatbotQuestionGroup } from "../actions/chatbot-questions-actions";
import { convertToArticleFaq } from "../actions/chatbot-questions-actions";

interface Props {
  groups: ChatbotQuestionGroup[];
}

export function ChatbotQuestionsClient({ groups }: Props) {
  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState<"all" | "article" | "category">("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | "web" | "db">("all");
  const [selected, setSelected] = useState<ChatbotQuestionGroup | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const filtered = useMemo(() => {
    return groups.filter((g) => {
      if (scopeFilter !== "all" && g.scopeType !== scopeFilter) return false;
      if (sourceFilter !== "all" && g.source !== sourceFilter) return false;
      if (search && !g.question.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [groups, scopeFilter, sourceFilter, search]);

  function openConvert(group: ChatbotQuestionGroup) {
    setSelected(group);
    setQuestion(group.question);
    setAnswer(group.bestAnswer ?? "");
  }

  function closeDialog() {
    setSelected(null);
    setQuestion("");
    setAnswer("");
  }

  function handleConvert() {
    if (!selected?.articleId) return;
    startTransition(async () => {
      const result = await convertToArticleFaq({
        articleId: selected.articleId!,
        question,
        answer,
      });
      if (result.success) {
        toast({ title: "Sent to client", description: "The FAQ is pending client approval before going live." });
        closeDialog();
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    });
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "article", "category"] as const).map((v) => (
            <Button
              key={v}
              variant={scopeFilter === v ? "default" : "outline"}
              size="sm"
              onClick={() => setScopeFilter(v)}
            >
              {v === "all" ? "All Scopes" : v === "article" ? "Article" : "Category"}
            </Button>
          ))}
        </div>
        <div className="flex gap-1">
          {(["all", "web", "db"] as const).map((v) => (
            <Button
              key={v}
              variant={sourceFilter === v ? "default" : "outline"}
              size="sm"
              onClick={() => setSourceFilter(v)}
            >
              {v === "all" ? "All Sources" : v === "web" ? "Web" : "DB"}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead className="w-20 text-center">Asked</TableHead>
              <TableHead className="w-24">Scope</TableHead>
              <TableHead className="w-24">Source</TableHead>
              <TableHead className="w-32">Last Asked</TableHead>
              <TableHead className="w-44"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No questions found
                </TableCell>
              </TableRow>
            )}
            {filtered.map((group) => (
              <TableRow key={group.bestMessageId}>
                <TableCell className="font-medium">
                  <p className="max-w-[380px] truncate" title={group.question}>
                    {group.question}
                  </p>
                  {(group.articleSlug ?? group.categorySlug) && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[380px]">
                      {group.articleSlug ?? group.categorySlug}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={group.count >= 5 ? "default" : "secondary"}>
                    {group.count}×
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {group.scopeType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {group.source === "web" ? (
                      <><Globe className="h-3 w-3" /> Web</>
                    ) : (
                      <><Bot className="h-3 w-3" /> DB</>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(group.lastAsked))}
                </TableCell>
                <TableCell>
                  {group.articleId ? (
                    <Button size="sm" variant="outline" onClick={() => openConvert(group)}>
                      <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                      Send to Client
                    </Button>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <AlertCircle className="h-3 w-3" />
                      Category only
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Convert Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send FAQ to Client for Approval</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="faq-question">Question</Label>
              <Input
                id="faq-question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="faq-answer">Answer</Label>
              <Textarea
                id="faq-answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={6}
              />
            </div>
            {selected?.articleSlug && (
              <p className="text-xs text-muted-foreground">
                Article: <span className="font-medium">{selected.articleSlug}</span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleConvert}
              disabled={isPending || !question.trim() || !answer.trim()}
            >
              {isPending ? "Sending..." : "Send to Client"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
