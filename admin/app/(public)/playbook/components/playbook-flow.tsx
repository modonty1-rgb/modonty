"use client";

import {
  Background,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { BadgeCheck, ClipboardCheck, FileCheck2, KeyRound, UsersRound } from "lucide-react";

type StageData = {
  number: string;
  title: string;
  owner: string;
  result: string;
  description: string;
  icon: "handoff" | "access" | "profile" | "ready";
};

const stageIcons = {
  handoff: UsersRound,
  access: KeyRound,
  profile: ClipboardCheck,
  ready: FileCheck2,
};

function StageNode({ data }: NodeProps<Node<StageData>>) {
  const Icon = stageIcons[data.icon];

  return (
    <div className="w-[224px] rounded-2xl border border-border bg-card p-4 text-right shadow-[0_12px_30px_-18px_rgba(15,23,42,0.55)]">
      <Handle type="target" position={Position.Right} className="!h-2.5 !w-2.5 !border-2 !border-card !bg-primary" />
      <Handle type="source" position={Position.Left} className="!h-2.5 !w-2.5 !border-2 !border-card !bg-primary" />
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-xs font-bold text-primary">{data.number}</span>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <h3 className="mt-4 text-sm font-bold leading-6 text-foreground">{data.title}</h3>
      <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{data.description}</p>
      <div className="mt-4 space-y-1.5 border-t pt-3 text-[11px] leading-5">
        <p><span className="font-semibold text-foreground">المسؤول:</span> <span className="text-muted-foreground">{data.owner}</span></p>
        <p className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400"><BadgeCheck className="h-3.5 w-3.5 shrink-0" />{data.result}</p>
      </div>
    </div>
  );
}

const nodeTypes = { stage: StageNode };

const nodes: Node<StageData>[] = [
  {
    id: "handoff",
    type: "stage",
    position: { x: 870, y: 70 },
    data: {
      number: "01",
      title: "تسليم العميل بعد التوقيع",
      owner: "متابعة العملاء",
      result: "ملف بداية واضح",
      description: "تستلم الفريق الاتفاق ومواد الهوية المتاحة.",
      icon: "handoff",
    },
  },
  {
    id: "console",
    type: "stage",
    position: { x: 580, y: 70 },
    data: {
      number: "02",
      title: "تأسيس الكونسول",
      owner: "متابعة العملاء",
      result: "دخول العميل جاهز",
      description: "وصول خاص للعميل إلى نشاطه في الكونسول.",
      icon: "access",
    },
  },
  {
    id: "profile",
    type: "stage",
    position: { x: 290, y: 70 },
    data: {
      number: "03",
      title: "إكمال بيانات النشاط",
      owner: "العميل + متابعة العملاء",
      result: "بيانات قابلة للاستخدام",
      description: "العميل يثبت معلومات نشاطه، والفريق يتابع الاكتمال.",
      icon: "profile",
    },
  },
  {
    id: "ready",
    type: "stage",
    position: { x: 0, y: 70 },
    data: {
      number: "04",
      title: "فحص الجاهزية والتسليم",
      owner: "متابعة العملاء",
      result: "جاهز لخطة المحتوى",
      description: "لا ينتقل الملف قبل اكتمال البيانات ومواد الهوية.",
      icon: "ready",
    },
  },
];

const edges: Edge[] = [
  { id: "handoff-console", source: "handoff", target: "console", animated: true, type: "smoothstep", markerEnd: { type: MarkerType.ArrowClosed }, style: { strokeWidth: 2 } },
  { id: "console-profile", source: "console", target: "profile", animated: true, type: "smoothstep", markerEnd: { type: MarkerType.ArrowClosed }, style: { strokeWidth: 2 } },
  { id: "profile-ready", source: "profile", target: "ready", animated: true, type: "smoothstep", markerEnd: { type: MarkerType.ArrowClosed }, style: { strokeWidth: 2 } },
];

export function PlaybookFlow() {
  return (
    <div className="h-[420px] w-full bg-[radial-gradient(circle_at_20%_0%,hsl(var(--primary)/0.08),transparent_32%)]" dir="rtl">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} size={1} className="!opacity-45" />
      </ReactFlow>
    </div>
  );
}
