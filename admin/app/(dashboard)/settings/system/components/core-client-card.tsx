"use client";

import { useEffect, useState, useTransition } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Crown } from "lucide-react";

import {
  getCoreClientState,
  saveCoreClientId,
  type CoreClientOption,
} from "../../actions/core-client-actions";

/** Picks which Client row IS the platform (Modonty Core). One key, read everywhere. */
export function CoreClientCard() {
  const { toast } = useToast();
  const [options, setOptions] = useState<CoreClientOption[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    getCoreClientState().then((r) => {
      if ("error" in r) return;
      setOptions(r.options);
      setCurrent(r.current);
      setSelected(r.current ?? "");
    });
  }, []);

  const currentName = options.find((o) => o.id === current)?.name;

  function save() {
    startTransition(async () => {
      const r = await saveCoreClientId(selected);
      if ("error" in r) {
        toast({ title: "Failed", description: r.error, variant: "destructive" });
        return;
      }
      setCurrent(selected);
      toast({ title: "Core client saved", description: options.find((o) => o.id === selected)?.name });
    });
  }

  return (
    <Card className="border-violet-500/40">
      <CardContent className="flex flex-wrap items-center gap-3 p-4">
        <Crown className="h-4 w-4 shrink-0 text-violet-500" />
        <div className="min-w-0">
          <div className="text-sm font-bold">Modonty Core Client</div>
          <div className="text-xs text-muted-foreground">
            The Client row that IS the platform — media ownership, picker scoping and partner-list
            exclusion all key off this.
          </div>
        </div>
        <div className="ms-auto flex items-center gap-2">
          {current ? (
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-500">
              {currentName ?? current}
            </Badge>
          ) : (
            <Badge variant="destructive">not set</Badge>
          )}
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="h-9 w-[220px]">
              <SelectValue placeholder="Select client…" />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={save} disabled={pending || !selected || selected === current}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
