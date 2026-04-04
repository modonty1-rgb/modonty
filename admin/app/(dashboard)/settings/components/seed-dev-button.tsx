"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Database, CheckCircle2, XCircle, Loader2, SkipForward, Square } from "lucide-react";
import { runSeedSection, saveCombinedLog } from "../actions/seed-integration-test";
import type { SeedSection, SectionResult, TestResult } from "../actions/seed-integration-test";

const SECTIONS: { id: SeedSection; label: string; description: string }[] = [
  { id: "categories", label: "Categories", description: "6 categories + parent-child" },
  { id: "tags", label: "Tags", description: "5 tags" },
  { id: "industries", label: "Industries", description: "5 industries" },
  { id: "clients", label: "Clients", description: "2 clients with full data" },
  { id: "articles", label: "Articles", description: "3 articles (published + draft)" },
  { id: "faqs", label: "FAQs", description: "3 FAQs" },
  { id: "interactions", label: "Interactions", description: "Comments, views, likes, subscribers" },
];

function StatusIcon({ status }: { status: TestResult["status"] }) {
  if (status === "pass") return <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />;
  if (status === "fail") return <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />;
  return <SkipForward className="h-3.5 w-3.5 text-amber-500 shrink-0" />;
}

function ElapsedTimer({ running }: { running: boolean }) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    if (!running) return;
    startRef.current = Date.now();
    setElapsed(0);
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  if (!running && elapsed === 0) return null;

  const min = Math.floor(elapsed / 60);
  const sec = elapsed % 60;
  return (
    <span className="text-xs font-mono text-muted-foreground">
      {min > 0 ? `${min}m ${sec}s` : `${sec}s`}
    </span>
  );
}

export function SeedDevButton() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<SeedSection>>(new Set(SECTIONS.map(s => s.id)));
  const [running, setRunning] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const cancelledRef = useRef(false);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalSections, setTotalSections] = useState(0);
  const [sectionResults, setSectionResults] = useState<SectionResult[]>([]);
  const [logFile, setLogFile] = useState<string | null>(null);

  function toggleSection(id: SeedSection) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() { setSelected(new Set(SECTIONS.map(s => s.id))); }
  function selectNone() { setSelected(new Set()); }

  function handleCancel() {
    cancelledRef.current = true;
    setCancelled(true);
  }

  async function handleRun(sections: typeof SECTIONS) {
    setRunning(true);
    setCancelled(false);
    cancelledRef.current = false;
    setSectionResults([]);
    setLogFile(null);
    setTotalSections(sections.length);

    const allResults: SectionResult[] = [];
    for (let i = 0; i < sections.length; i++) {
      if (cancelledRef.current) break;
      const s = sections[i];
      setCurrentSection(s.label);
      setCurrentIndex(i);
      const result = await runSeedSection(s.id);
      allResults.push(result);
      setSectionResults([...allResults]);
    }

    if (!cancelledRef.current) {
      const file = await saveCombinedLog(allResults);
      setLogFile(file);
    }
    setCurrentSection(null);
    setRunning(false);
  }

  const progressPercent = totalSections > 0
    ? Math.round((sectionResults.length / totalSections) * 100)
    : 0;
  const totalPassed = sectionResults.reduce((s, r) => s + r.passed, 0);
  const totalFailed = sectionResults.reduce((s, r) => s + r.failed, 0);
  const isDone = !running && sectionResults.length > 0;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2 border-dashed border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/10"
      >
        <Database className="h-3.5 w-3.5" />
        Integration Test
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!running) setOpen(v); }}>
        <DialogContent
          className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
          onPointerDownOutside={(e) => { if (running) e.preventDefault(); }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-yellow-500" />
              Integration Test
            </DialogTitle>
            <DialogDescription>
              CREATE → UPDATE → DELETE → RE-CREATE using real server actions
            </DialogDescription>
          </DialogHeader>

          {/* Section Selection */}
          {!running && sectionResults.length === 0 && (
            <div className="space-y-3">
              <div className="flex gap-2 text-xs">
                <button onClick={selectAll} className="text-blue-500 hover:underline">Select All</button>
                <span className="text-muted-foreground">|</span>
                <button onClick={selectNone} className="text-blue-500 hover:underline">Clear All</button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {SECTIONS.map(s => (
                  <label key={s.id} className="flex items-center gap-3 p-2 rounded border hover:bg-muted/50 cursor-pointer">
                    <Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggleSection(s.id)} />
                    <div className="flex-1">
                      <span className="font-medium text-sm">{s.label}</span>
                      <span className="text-xs text-muted-foreground ms-2">{s.description}</span>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={() => handleRun(SECTIONS.filter(s => selected.has(s.id)))} disabled={selected.size === 0} className="flex-1">
                  Run Selected ({selected.size})
                </Button>
                <Button onClick={() => { setSelected(new Set(SECTIONS.map(s => s.id))); handleRun(SECTIONS); }} variant="outline">
                  Run All
                </Button>
              </div>
            </div>
          )}

          {/* Running / Results */}
          {(running || sectionResults.length > 0) && (
            <>
              {/* Progress Header */}
              <div className="space-y-2 pb-2 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {running ? (
                      <>
                        <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                        <span className="text-sm font-medium">
                          {currentSection} ({currentIndex + 1}/{totalSections})
                        </span>
                      </>
                    ) : cancelled ? (
                      <>
                        <Square className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium text-amber-600">Cancelled</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-medium text-emerald-600">Complete</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <ElapsedTimer running={running} />
                    <span className="text-xs font-mono text-muted-foreground">
                      {sectionResults.length}/{totalSections}
                    </span>
                  </div>
                </div>
                <Progress value={isDone ? 100 : progressPercent} className="h-1.5" />
              </div>

              {/* Results List */}
              <div className="flex-1 overflow-y-auto space-y-3 pe-1" style={{ maxHeight: "45vh" }}>
                {sectionResults.map((sr, i) => (
                  <div key={i} className="border rounded p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">{sr.section}</h3>
                      <div className="flex gap-2 text-xs">
                        <span className="text-green-600">{sr.passed} passed</span>
                        {sr.failed > 0 && <span className="text-red-600">{sr.failed} failed</span>}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      {sr.results.map((r, j) => (
                        <div key={j} className={`flex items-start gap-2 text-xs py-0.5 ${
                          r.status === "fail" ? "text-red-600" : r.status === "skip" ? "text-amber-600" : "text-muted-foreground"
                        }`}>
                          <StatusIcon status={r.status} />
                          <span className={`text-[10px] font-mono px-1 rounded shrink-0 ${
                            r.phase === "validate" ? "bg-purple-500/15 text-purple-600" :
                            r.phase === "create" ? "bg-blue-500/15 text-blue-600" :
                            r.phase === "verify" ? "bg-cyan-500/15 text-cyan-600" :
                            r.phase === "update" ? "bg-amber-500/15 text-amber-600" :
                            r.phase === "constraint" ? "bg-orange-500/15 text-orange-600" :
                            r.phase === "delete" ? "bg-red-500/15 text-red-600" :
                            r.phase === "re-create" ? "bg-green-500/15 text-green-600" :
                            "bg-emerald-500/15 text-emerald-600"
                          }`}>{r.phase}</span>
                          <span className="flex-1">{r.action}</span>
                          {r.detail && <span className="text-xs opacity-70 max-w-[200px] truncate">{r.detail}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t">
                {running ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full gap-2"
                    onClick={handleCancel}
                  >
                    <Square className="h-3.5 w-3.5" />
                    Cancel after current section
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-green-600 font-medium">{totalPassed} passed</span>
                        {totalFailed > 0 && <span className="text-red-600 font-medium">{totalFailed} failed</span>}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setSectionResults([]); setCurrentSection(null); setLogFile(null); setCancelled(false); }}>
                          Run Again
                        </Button>
                        <Button size="sm" onClick={() => window.location.reload()}>
                          Done
                        </Button>
                      </div>
                    </div>
                    {logFile && (
                      <div className="text-xs text-muted-foreground bg-muted/50 rounded px-3 py-1.5 font-mono">
                        Log: logs/integration-test/{logFile}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
