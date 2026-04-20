"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Database, HardDrive, Clock, ShieldAlert, Download, Upload, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { messages } from "@/lib/messages";
import { runBackup } from "../actions/run-backup";
import { getAvailableBackups, runRestore } from "../actions/run-restore";

interface TableInfo {
  name: string;
  label: string;
  count: number;
  group: string;
}

interface DatabaseHealth {
  tables: TableInfo[];
  totalRecords: number;
  lastChecked: string;
  storageMB: number;
  collectionsCount: number;
}

const groups = ["Core", "Content", "Audience", "Analytics", "System"];

export function DatabaseOverview({ health, isLocal }: { health: DatabaseHealth; isLocal: boolean }) {
  const { toast } = useToast();
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupResult, setBackupResult] = useState<{ success: boolean; message: string } | null>(null);

  // Restore state
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [backups, setBackups] = useState<{ name: string; date: string }[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [restoreLoading, setRestoreLoading] = useState(false);

  const checkedAt = new Date(health.lastChecked);
  const formattedTime = checkedAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const formattedDate = checkedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  useEffect(() => {
    if (restoreOpen && isLocal) {
      getAvailableBackups().then(setBackups);
    }
  }, [restoreOpen, isLocal]);

  const handleBackup = async () => {
    setBackupLoading(true);
    setBackupResult(null);
    const result = await runBackup();
    setBackupResult(result);
    setBackupLoading(false);
    toast({
      title: result.success ? messages.success.success : messages.error.server_error,
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
  };

  const handleRestore = async () => {
    if (!selectedBackup || confirmText !== "RESTORE") return;
    setRestoreLoading(true);
    const result = await runRestore(selectedBackup);
    setRestoreLoading(false);
    setRestoreOpen(false);
    setConfirmText("");
    setSelectedBackup(null);
    toast({
      title: result.success ? messages.success.success : messages.error.server_error,
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{health.totalRecords.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Records</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <HardDrive className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {health.storageMB > 0 ? `${health.storageMB}` : health.tables.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  {health.storageMB > 0 ? "Storage MB" : "Data Tables"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Clock className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formattedTime}</p>
                <p className="text-xs text-muted-foreground">{formattedDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <ShieldAlert className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">Free Tier</p>
                <p className="text-xs text-muted-foreground">No auto-backup</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup & Restore */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          {isLocal ? (
            <div className="space-y-4">
              {/* Backup Row */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-semibold text-sm">Backup</p>
                  <p className="text-xs text-muted-foreground">Save a full copy of all your data to your machine.</p>
                </div>
                <Button onClick={handleBackup} disabled={backupLoading || restoreLoading} size="sm">
                  {backupLoading ? (
                    <><Loader2 className="h-4 w-4 me-2 animate-spin" /> Backing up...</>
                  ) : (
                    <><Download className="h-4 w-4 me-2" /> Backup Now</>
                  )}
                </Button>
              </div>

              {backupResult && (
                <div className={`flex items-center gap-1.5 text-xs ${backupResult.success ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
                  {backupResult.success ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                  {backupResult.message}
                </div>
              )}

              <div className="border-t" />

              {/* Restore Row */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-semibold text-sm">Restore</p>
                  <p className="text-xs text-muted-foreground">Replace current data with a previous backup. A safety copy is saved first.</p>
                </div>
                <Dialog open={restoreOpen} onOpenChange={(open) => { setRestoreOpen(open); if (!open) { setSelectedBackup(null); setConfirmText(""); } }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={backupLoading || restoreLoading} className="text-destructive border-destructive/30 hover:bg-destructive/10">
                      <Upload className="h-4 w-4 me-2" /> Restore
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Restore from Backup</DialogTitle>
                      <DialogDescription>
                        Choose a backup to restore. Your current data will be backed up first as a safety net.
                      </DialogDescription>
                    </DialogHeader>

                    {backups.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">No backups found. Create a backup first.</p>
                    ) : (
                      <div className="space-y-4">
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {backups.map((b) => (
                            <button
                              key={b.name}
                              type="button"
                              onClick={() => setSelectedBackup(b.name)}
                              className={`w-full text-start p-3 rounded-lg border text-sm transition-colors ${
                                selectedBackup === b.name
                                  ? "border-primary bg-primary/5 font-medium"
                                  : "border-border hover:bg-muted/50"
                              }`}
                            >
                              {b.name}
                            </button>
                          ))}
                        </div>

                        {selectedBackup && (
                          <div className="space-y-2">
                            <p className="text-xs text-destructive font-medium">
                              This will replace ALL current data. Type RESTORE to confirm:
                            </p>
                            <Input
                              value={confirmText}
                              onChange={(e) => setConfirmText(e.target.value)}
                              placeholder="Type RESTORE"
                              className={confirmText === "RESTORE" ? "border-destructive" : ""}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setRestoreOpen(false)} disabled={restoreLoading}>
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleRestore}
                        disabled={!selectedBackup || confirmText !== "RESTORE" || restoreLoading}
                      >
                        {restoreLoading ? (
                          <><Loader2 className="h-4 w-4 me-2 animate-spin" /> Restoring...</>
                        ) : (
                          "Restore Now"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="font-semibold text-sm">Backup & Restore</p>
              <p className="text-xs text-muted-foreground">
                Free tier — backup and restore are only available from your local machine (localhost).
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tables by Group */}
      {groups.map((group) => {
        const groupTables = health.tables.filter((t) => t.group === group);
        const groupTotal = groupTables.reduce((s, t) => s + t.count, 0);

        return (
          <div key={group} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{group}</h2>
              <Badge variant="secondary" className="text-xs font-normal">
                {groupTotal.toLocaleString()} records
              </Badge>
            </div>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead className="w-[120px] text-end">Records</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupTables.map((table) => (
                    <TableRow key={table.name}>
                      <TableCell className="font-medium">{table.label}</TableCell>
                      <TableCell className="text-end">
                        <span className={table.count === 0 ? "text-muted-foreground" : "font-semibold"}>
                          {table.count.toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
