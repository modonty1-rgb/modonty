"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquarePlus, Loader2, CheckCircle2 } from "lucide-react";
import { sendFeedback } from "../actions/send-feedback";

const TEAM_MEMBERS = [
  "Abu Omar",
  "Eng. Khalid",
  "Mohammed Shalaby",
  "Rawan",
  "Somaya",
  "Mustafa",
  "Ahmed",
];

export function FeedbackBanner() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!name || !message.trim()) return;
    setSending(true);
    const result = await sendFeedback({
      name,
      message: message.trim(),
      page: typeof window !== "undefined" ? window.location.pathname : "/",
    });
    setSending(false);
    if (result.success) {
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setOpen(false);
        setName("");
        setMessage("");
      }, 2000);
    }
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-center gap-3">
      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
        This system is in beta. If something is unclear, broken, or confusing — let us know.
      </span>
      <Button
        variant="outline"
        size="sm"
        className="h-6 px-2.5 text-[11px] gap-1 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
        onClick={() => setOpen(true)}
      >
        <MessageSquarePlus className="h-3 w-3" />
        Send Note
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Feedback</DialogTitle>
            <DialogDescription>
              Your message will be sent to the development team.
            </DialogDescription>
          </DialogHeader>

          {sent ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <p className="text-sm font-medium">Message received! Thank you.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Your Name</label>
                  <Select value={name} onValueChange={setName}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your name" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAM_MEMBERS.map((member) => (
                        <SelectItem key={member} value={member}>
                          {member}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Message</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe what you noticed — a bug, unclear feature, or suggestion..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={!name || !message.trim() || sending}
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
