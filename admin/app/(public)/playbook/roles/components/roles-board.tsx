"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import { cn } from "@/lib/utils";

import { DUTIES, PEOPLE, STAGES, type Duty } from "../helpers/roles-data";

const DRAFT_KEY = "modonty-roles-draft-v1";
const ORPHAN = "__none__";

const stageTitle = (key: string) => STAGES.find((s) => s.key === key)?.title ?? key;

function DutyCard({ duty, dragging }: { duty: Duty; dragging?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-background p-2.5 text-right",
        duty.parked && "opacity-55",
        dragging && "shadow-lg ring-2 ring-primary",
      )}
    >
      <div className="flex items-start gap-2">
        <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground">{duty.n}</span>
        <p className="min-w-0 flex-1 text-[12.5px] font-medium leading-5">{duty.t}</p>
      </div>
      <p className="mt-1 text-[10.5px] text-muted-foreground">{stageTitle(duty.stage)}</p>
      {duty.parked ? <p className="mt-0.5 text-[10.5px] font-bold text-amber-600 dark:text-amber-400">مؤجّلة</p> : null}
    </div>
  );
}

function DraggableDuty({ duty }: { duty: Duty }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `duty:${duty.n}`, data: { n: duty.n } });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn("cursor-grab touch-none active:cursor-grabbing", isDragging && "opacity-30")}
    >
      <DutyCard duty={duty} />
    </div>
  );
}

/**
 * البطاقة هي منطقة الإفلات نفسها لا قائمة المهام داخلها — وإلا لم يستقبل موظّفٌ
 * بلا مهام أيّ بطاقة، إذ لا شيء يصطدم به المؤشّر. وهذا أشهر عطل في لوحة مبنيّة باليد.
 */
function PersonColumn({
  id,
  name,
  role,
  duties,
  tone,
}: {
  id: string;
  name: string;
  role: string;
  duties: Duty[];
  tone?: "orphan";
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `col:${id}` });
  return (
    <section
      ref={setNodeRef}
      aria-label={name}
      className={cn(
        "flex flex-col rounded-xl border bg-card p-3 transition-colors",
        tone === "orphan" && "border-amber-500/45 bg-amber-500/[0.05]",
        isOver && "border-primary bg-primary/[0.07]",
      )}
    >
      <header className="mb-2.5 flex items-start gap-2 border-b pb-2">
        <div className="min-w-0 flex-1">
          <h3 className={cn("text-[14.5px] font-bold", tone === "orphan" && "text-amber-700 dark:text-amber-300")}>{name}</h3>
          <p className="truncate text-[11px] text-muted-foreground">{role}</p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-md px-1.5 py-0.5 text-[12px] font-bold",
            duties.length ? "bg-primary text-primary-foreground" : "border bg-muted text-muted-foreground",
          )}
        >
          {duties.length}
        </span>
      </header>

      <div className="space-y-1.5">
        {duties.length ? (
          duties.map((d) => <DraggableDuty key={d.n} duty={d} />)
        ) : (
          <p className="rounded-lg border border-dashed py-4 text-center text-[12px] text-muted-foreground">أفلت مهمّة هنا</p>
        )}
      </div>
    </section>
  );
}

export function RolesBoard() {
  // المسوّدة تُقرأ بعد الترطيب لا في التهيئة: السيرفر لا يرى `localStorage`، فبدؤها منه
  // يجعل أوّل رسم على الخادم مخالفاً لأوّل رسم في المتصفّح — وهو خطأ ترطيب لا يُرقَّع.
  const [draft, setDraft] = useState<Record<number, string>>({});

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(DRAFT_KEY);
      if (saved) setDraft(JSON.parse(saved));
    } catch {
      /* متصفّح يمنع القراءة — نبدأ من المعتمد */
    }
  }, []);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [flash, setFlash] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 160, tolerance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const ownerOf = useMemo(() => (d: Duty) => draft[d.n] ?? d.owner, [draft]);

  const persist = (next: Record<number, string>) => {
    setDraft(next);
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
    } catch {
      /* متصفّح يمنع التخزين — التحريك يبقى في الجلسة وحدها */
    }
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const over = e.over?.id;
    const n = e.active.data.current?.n as number | undefined;
    if (!over || typeof n !== "number" || !String(over).startsWith("col:")) return;

    const to = String(over).slice(4);
    const target = to === ORPHAN ? "" : to;
    const original = DUTIES.find((d) => d.n === n)?.owner ?? "";
    const next = { ...draft };
    if (target === original) delete next[n];
    else next[n] = target;
    persist(next);
  };

  const onDragStart = (e: DragStartEvent) => setActiveId((e.active.data.current?.n as number) ?? null);

  const live = DUTIES.filter((d) => !d.parked);
  const owned = live.filter((d) => ownerOf(d)).length;
  const orphans = DUTIES.filter((d) => !ownerOf(d));
  const changed = Object.keys(draft).length;

  const copyDraft = async () => {
    const lines = ["# إسناد مهام مدونتي — مسوّدة", ""];
    PEOPLE.forEach((p) => {
      const mine = DUTIES.filter((d) => ownerOf(d) === p.id);
      if (!mine.length) return;
      lines.push(`## ${p.name} (${mine.length})`);
      mine.forEach((d) => lines.push(`  ${d.n}. ${d.t}`));
      lines.push("");
    });
    if (orphans.length) {
      lines.push(`## بلا مالك (${orphans.length})`);
      orphans.forEach((d) => lines.push(`  ${d.n}. ${d.t}`));
    }
    const text = lines.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setFlash("انتسخ — أرسله ليُثبَّت في المصدر");
    } catch {
      window.prompt("انسخ من هنا:", text);
    }
    setTimeout(() => setFlash(""), 2600);
  };

  const reset = () => {
    setDraft({});
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* لا شيء يُمسح */
    }
  };

  const active = activeId === null ? null : DUTIES.find((d) => d.n === activeId) ?? null;

  return (
    <div dir="rtl">
      <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-xl border bg-card p-3">
        <p className="text-[13px] text-muted-foreground">
          <b className="text-lg text-primary">{owned}</b> من <b>{live.length}</b> مهمّة لها مالك
        </p>
        <div className="h-1.5 min-w-[120px] flex-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary" style={{ width: `${Math.round((owned / live.length) * 100)}%` }} />
        </div>
        <button type="button" onClick={copyDraft} className="rounded-lg border bg-background px-3 py-1.5 text-[12.5px] hover:border-primary/50">
          نسخ التوزيع
        </button>
        {changed ? (
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-amber-500/45 bg-amber-500/[0.08] px-3 py-1.5 text-[12.5px] font-bold text-amber-700 dark:text-amber-300"
          >
            رجوع للمعتمد ({changed})
          </button>
        ) : null}
        {flash ? <span className="text-[12px] font-bold text-primary">{flash}</span> : null}
      </div>

      {changed ? (
        <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] p-2.5 text-[12.5px] leading-6 text-muted-foreground">
          <b className="text-foreground">أنت في مسوّدة.</b> ما تحرّكه يبقى في متصفّحك وحده ولا يراه الفريق.
          اضغط «نسخ التوزيع» ليُثبَّت في المصدر.
        </p>
      ) : null}

      {/* `id` ثابت: بدونه يولّد dnd-kit معرّفاً عشوائياً يختلف بين السيرفر والمتصفّح فيكسر الترطيب. */}
      <DndContext id="roles-board" sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {orphans.length ? (
            <PersonColumn id={ORPHAN} name="بلا مالك" role="عملٌ نفعله بلا اسم يحمله، أو لم نبدأه" duties={orphans} tone="orphan" />
          ) : null}
          {PEOPLE.map((p) => (
            <PersonColumn key={p.id} id={p.id} name={p.name} role={p.role} duties={DUTIES.filter((d) => ownerOf(d) === p.id)} />
          ))}
        </div>

        <DragOverlay>{active ? <DutyCard duty={active} dragging /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
}
