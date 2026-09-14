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

import { DUTIES, PEOPLE, STAGES, type Duty } from "../../helpers/roles-data";

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
        "mb-3 break-inside-avoid rounded-xl border bg-card p-3 transition-colors",
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
          <p className="rounded-lg border border-dashed py-2 text-center text-[11.5px] text-muted-foreground">أفلت مهمّة هنا</p>
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

  const orphans = DUTIES.filter((d) => !ownerOf(d));

  const active = activeId === null ? null : DUTIES.find((d) => d.n === activeId) ?? null;

  return (
    <div dir="rtl">
      {/* `id` ثابت: بدونه يولّد dnd-kit معرّفاً عشوائياً يختلف بين السيرفر والمتصفّح فيكسر الترطيب. */}
      <DndContext id="roles-board" sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        {/*
          أعمدة CSS لا شبكة: أطوال البطاقات متفاوتة جدًّا (٢٦ مهمّة عند خالد مقابل ١ عند
          محمد)، وفي الشبكة يأخذ الصفُّ ارتفاع أطول خلية فيه فتتخلّف فراغات تحت القصيرة.
          الأعمدة تُسيل البطاقات فتملأ ما تحتها، و`break-inside-avoid` يمنع انقسام البطاقة
          بين عمودين.
        */}
        <div className="columns-1 gap-3 sm:columns-2 xl:columns-3">
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
