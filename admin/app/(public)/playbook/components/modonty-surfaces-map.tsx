"use client";

import {
  Background,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import type { SVGProps } from "react";
import { ModontyMark } from "@modonty/shared/components/icons/modonty-mark";
import { ModontyPartnerMark } from "@modonty/shared/components/icons/modonty-partner-mark";
import { ModontyProfessionalsMark } from "@modonty/shared/components/icons/modonty-professionals-mark";
import { ModontyTrustMark } from "@modonty/shared/components/icons/modonty-trust-mark";
import { ModontyViewsMark } from "@modonty/shared/components/icons/modonty-views-mark";

import { FitOnResize } from "./fit-on-resize";

import "@xyflow/react/dist/style.css";

const FIT = { padding: 0.04 };

type SurfaceKind = "audience" | "buyer" | "partner" | "team";

type SurfaceData = {
  host: string;
  who: string;
  job: string;
  kind: SurfaceKind;
};

type HubData = Record<string, never>;

/** أيقونات مدونتي لا مكتبة عامّة، والترقيم ٠١..٠٤ سقط: العنوان يعرّف السطح لا رقمه. */
const surfaceIcons: Record<SurfaceKind, (p: SVGProps<SVGSVGElement>) => React.ReactElement> = {
  audience: ModontyViewsMark,
  buyer: ModontyPartnerMark,
  partner: ModontyTrustMark,
  team: ModontyProfessionalsMark,
};

/** الأسطح على اليمين يدخل إليها الخط من يسارها، والعكس على اليسار — ليصل كلٌّ منها بالمركز. */
function SurfaceNode({ data }: NodeProps<Node<SurfaceData>>) {
  const Icon = surfaceIcons[data.kind];
  const isRightColumn = data.kind === "audience" || data.kind === "buyer";
  return (
    <div className="w-[248px] rounded-xl border bg-card p-3.5 shadow-sm">
      <Handle
        type="target"
        position={isRightColumn ? Position.Left : Position.Right}
        className="!h-2 !w-2 !border-2 !border-card !bg-primary"
      />
      <div className="flex items-center gap-2.5">
        <Icon className="shrink-0 text-[26px]" />
        <div className="min-w-0">
          <p className="font-mono text-[12.5px] font-bold leading-4 text-foreground" dir="ltr">{data.host}</p>
          <p className="text-[12.5px] font-bold text-muted-foreground">{data.who}</p>
        </div>
      </div>
      <p className="mt-2.5 text-[12.5px] leading-[1.65] text-muted-foreground">{data.job}</p>
    </div>
  );
}

function HubNode() {
  return (
    <div className="w-[190px] rounded-xl border-2 border-primary/45 bg-primary/[0.06] p-4 text-center shadow-sm">
      <Handle id="right" type="source" position={Position.Right} className="!h-2 !w-2 !border-2 !border-card !bg-primary" />
      <Handle id="left" type="source" position={Position.Left} className="!h-2 !w-2 !border-2 !border-card !bg-primary" />
      <span className="mx-auto grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary"><ModontyMark className="text-[20px]" /></span>
      <p className="mt-2.5 text-[15px] font-bold">مدونتي</p>
    </div>
  );
}

const nodeTypes = { surface: SurfaceNode, hub: HubNode };

/**
 * أربعة أسطح حول مركز واحد. العمود الأيمن من يأتي إلينا (جمهور ومشترٍ)، والأيسر من يشغّل
 * (شريك وفريق). التخطيط مضغوط عمدًا: `fitView` يصغّر الرسم ليملأ الحاوية، فالرسم العريض
 * يصغّر خطّه بنفسه.
 */
const nodes: Node<SurfaceData | HubData>[] = [
  { id: "hub", type: "hub", position: { x: 384, y: 128 }, data: {}, draggable: false },
  { id: "audience", type: "surface", position: { x: 680, y: 20 }, data: { host: "modonty.com", who: "الجمهور", job: "يبحث ويقرأ ويشاهد ويسمع، يصل إلى جهة موثقة، ثم يتواصل أو يحجز.", kind: "audience" } },
  { id: "buyer", type: "surface", position: { x: 680, y: 220 }, data: { host: "pay.modonty.com", who: "المشتري", job: "بوابة الشراء: الباقات والطلب والدفع والفاتورة، من تطبيق مدونتي نفسه.", kind: "buyer" } },
  { id: "partner", type: "surface", position: { x: 30, y: 20 }, data: { host: "console.modonty.com", who: "الشريك", job: "يكمل بياناته وأصوله، يضبط شكل صفحته، يراجع ويعتمد، ويقرأ إحصاءاته.", kind: "partner" } },
  { id: "team", type: "surface", position: { x: 30, y: 220 }, data: { host: "admin.modonty.com", who: "فريق مدونتي", job: "ننتج المحتوى والمرئيات، نفحص الجودة والسيو، ونعتمد ما يخرج.", kind: "team" } },
];

const baseEdge = { type: "smoothstep" as const, style: { strokeWidth: 2 }, animated: true };

const edges: Edge[] = [
  { id: "hub-audience", source: "hub", sourceHandle: "right", target: "audience", ...baseEdge },
  { id: "hub-buyer", source: "hub", sourceHandle: "right", target: "buyer", ...baseEdge },
  { id: "hub-partner", source: "hub", sourceHandle: "left", target: "partner", ...baseEdge },
  { id: "hub-team", source: "hub", sourceHandle: "left", target: "team", ...baseEdge },
];

export function ModontySurfacesMap() {
  return (
    <div className="h-[400px] w-full bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.08),transparent_38%)]" dir="rtl">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={FIT}
        maxZoom={1}
        // الافتراضي ٠٫٥، فيعجز الرسم عن التصغير كفايةً على الشاشات الضيّقة فيُقصّ.
        minZoom={0.15}
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
        <FitOnResize options={FIT} />
        <Background gap={20} size={1} className="!opacity-40" />
      </ReactFlow>
      <p className="sr-only">
        أسطح مدونتي الأربعة حول مركز واحد: modonty.com للجمهور، وpay.modonty.com للمشتري،
        وconsole.modonty.com للشريك، وadmin.modonty.com لفريق مدونتي.
      </p>
    </div>
  );
}
