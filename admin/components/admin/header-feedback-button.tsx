"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MessageSquarePlus, Loader2, CheckCircle2, Bug, Lightbulb, MessageCircle } from "lucide-react";
import { sendFeedback } from "@/app/(dashboard)/actions/send-feedback";

const TEAM_MEMBERS = [
  "Abu Omar",
  "Eng. Khalid",
  "Mohammed Shalaby",
  "Rawan",
  "Somaya",
  "Mustafa",
  "Ahmed",
];

const APPS = [
  { value: "modonty", label: "🌐 Modonty (public site)" },
  { value: "console", label: "👤 Console (client portal)" },
  { value: "admin", label: "🛠️ Admin (this app)" },
  { value: "general", label: "💬 General / not sure" },
];

const SEVERITIES = [
  { value: "critical", label: "🔴 Critical — blocking work" },
  { value: "bug", label: "🟡 Bug — broken but workable" },
  { value: "minor", label: "🟢 Minor — small/cosmetic" },
];

type FeedbackType = "" | "bug" | "idea" | "other";

export function HeaderFeedbackButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<FeedbackType>("");
  const [app, setApp] = useState("");
  const [whereExactly, setWhereExactly] = useState("");
  const [message, setMessage] = useState("");
  const [steps, setSteps] = useState("");
  const [severity, setSeverity] = useState("bug");
  const [benefit, setBenefit] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const reset = () => {
    setName("");
    setType("");
    setApp("");
    setWhereExactly("");
    setMessage("");
    setSteps("");
    setSeverity("bug");
    setBenefit("");
  };

  const isValid = () => {
    if (!name || !type || !app || !message.trim()) return false;
    if (type === "bug" && !whereExactly.trim()) return false;
    return true;
  };

  const handleSend = async () => {
    if (!isValid()) return;
    setSending(true);
    const result = await sendFeedback({
      name,
      type,
      app,
      whereExactly: whereExactly.trim() || undefined,
      message: message.trim(),
      steps: type === "bug" ? steps.trim() || undefined : undefined,
      severity: type === "bug" ? severity : undefined,
      benefit: type === "idea" ? benefit.trim() || undefined : undefined,
      page: typeof window !== "undefined" ? window.location.pathname : "/",
    });
    setSending(false);
    if (result.success) {
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setOpen(false);
        reset();
      }, 2000);
    }
  };

  // Auto-prefill whereExactly with current URL when type is selected
  const handleTypeChange = (newType: FeedbackType) => {
    setType(newType);
    if (!whereExactly && typeof window !== "undefined") {
      // Suggest a starting hint based on current page
      const path = window.location.pathname;
      const segments = path.split("/").filter(Boolean);
      const hint = segments.length > 0 ? segments[segments.length - 1] : "";
      if (hint) setWhereExactly(hint.replace(/-/g, " "));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setSent(false); reset(); } }}>
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-700 dark:text-amber-300 transition-colors"
                aria-label="Beta — Send feedback"
              >
                <span className="text-[10px] font-bold tracking-wider uppercase leading-none">Beta</span>
                <span className="h-3 w-px bg-amber-500/40" aria-hidden="true" />
                <MessageSquarePlus className="h-3.5 w-3.5" />
                <span className="text-[11px] font-medium hidden md:inline">Feedback</span>
              </button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">This system is in beta — click to send feedback</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>Help the dev team — be specific so we know exactly where to look.</DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <p className="text-sm font-medium">Got it — thanks!</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {/* Type radio (segmented buttons) */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">What kind of feedback?</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTypeChange("bug")}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                      type === "bug"
                        ? "bg-red-500/15 border-red-500 text-red-700 dark:text-red-300"
                        : "bg-muted/30 border-border hover:bg-muted/50"
                    }`}
                  >
                    <Bug className="h-3.5 w-3.5" />
                    Bug
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange("idea")}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                      type === "idea"
                        ? "bg-blue-500/15 border-blue-500 text-blue-700 dark:text-blue-300"
                        : "bg-muted/30 border-border hover:bg-muted/50"
                    }`}
                  >
                    <Lightbulb className="h-3.5 w-3.5" />
                    Idea
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange("other")}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                      type === "other"
                        ? "bg-slate-500/15 border-slate-500 text-slate-700 dark:text-slate-300"
                        : "bg-muted/30 border-border hover:bg-muted/50"
                    }`}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Other
                  </button>
                </div>
              </div>

              {/* Common fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Your Name</label>
                  <Select value={name} onValueChange={setName}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {TEAM_MEMBERS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">App</label>
                  <Select value={app} onValueChange={setApp}>
                    <SelectTrigger><SelectValue placeholder="Where?" /></SelectTrigger>
                    <SelectContent>
                      {APPS.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Type-specific fields */}
              {type && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      {type === "bug" ? "Where exactly? *" : type === "idea" ? "Where would it apply? (optional)" : "Where? (optional)"}
                    </label>
                    <Input
                      value={whereExactly}
                      onChange={(e) => setWhereExactly(e.target.value)}
                      placeholder={type === "bug" ? "e.g. Article edit page → title field" : "e.g. Articles list, Settings page"}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      {type === "bug" ? "What happened? *" : type === "idea" ? "Your idea *" : "Your comment *"}
                    </label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        type === "bug"
                          ? "Describe the broken behavior — what you saw vs what you expected"
                          : type === "idea"
                          ? "Describe your idea or suggestion clearly"
                          : "Your message..."
                      }
                      rows={4}
                    />
                  </div>

                  {type === "bug" && (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Steps to reproduce (optional)</label>
                        <Textarea
                          value={steps}
                          onChange={(e) => setSteps(e.target.value)}
                          placeholder="1. Open X&#10;2. Click Y&#10;3. Expected Z but got W"
                          rows={3}
                          className="font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Severity</label>
                        <Select value={severity} onValueChange={setSeverity}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {SEVERITIES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {type === "idea" && (
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Why would it help? (optional)</label>
                      <Textarea
                        value={benefit}
                        onChange={(e) => setBenefit(e.target.value)}
                        placeholder="What value does this add? Who benefits?"
                        rows={3}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSend} disabled={!isValid() || sending}>
                {sending ? (<><Loader2 className="h-4 w-4 animate-spin" />Sending...</>) : "Send"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
