"use client";

import {
  Background,
  BaseEdge,
  EdgeLabelRenderer,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  getSmoothStepPath,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { Square } from "lucide-react";
import { ModontyMark } from "@modonty/shared/components/icons/modonty-mark";

import { FitOnResize } from "./fit-on-resize";

import "@xyflow/react/dist/style.css";

const FIT = { padding: 0.06 };

type AloneData = { title: string; body: string };
type HubData = { label: string };
type BrickData = { label: string; self?: boolean };

/** الطوبة الوحيدة: حدٌّ متقطّع بلا لون، لأنها الحالة التي نُخرج الشريك منها لا التي نبيعها. */
function AloneNode({ data }: NodeProps<Node<AloneData>>) {
  return (
    <div className="w-[210px] rounded-xl border border-dashed border-muted-foreground/40 bg-muted/20 p-3.5">
      <Handle type="source" position={Position.Left} className="!h-2 !w-2 !border-2 !border-card !bg-muted-foreground" />
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
          <Square className="h-3.5 w-3.5" />
        </span>
        <p className="text-[13.5px] font-bold">{data.title}</p>
      </div>
      <p className="mt-2 text-[12px] leading-5 text-muted-foreground">{data.body}</p>
    </div>
  );
}

function HubNode({ data }: NodeProps<Node<HubData>>) {
  return (
    <div className="w-[170px] rounded-xl border-2 border-primary/45 bg-primary/[0.08] p-3.5 text-center">
      <Handle id="in" type="target" position={Position.Right} className="!h-2 !w-2 !border-2 !border-card !bg-primary" />
      <Handle id="out" type="source" position={Position.Left} className="!h-2 !w-2 !border-2 !border-card !bg-primary" />
      <span className="mx-auto grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
        <ModontyMark className="text-[19px]" />
      </span>
      <p className="mt-2 text-[14px] font-bold">مدونتي</p>
      <p className="mt-0.5 text-[11.5px] leading-5 text-muted-foreground">{data.label}</p>
    </div>
  );
}

/** طوبة داخل البنيان: تتلقّى من المركز، وتشدّ التي تحتها. */
function BrickNode({ data }: NodeProps<Node<BrickData>>) {
  return (
    <div className={`w-[150px] rounded-lg px-3 py-2 text-center ${data.self ? "border-2 border-primary/60 bg-primary/[0.12]" : "border border-primary/25 bg-primary/[0.05]"}`}>
      <Handle id="in" type="target" position={Position.Right} className="!h-1.5 !w-1.5 !border !border-card !bg-primary" />
      <Handle id="down" type="source" position={Position.Bottom} className="!h-1.5 !w-1.5 !border !border-card !bg-primary" />
      <Handle id="up" type="target" position={Position.Top} className="!h-1.5 !w-1.5 !border !border-card !bg-primary" />
      <p className="text-[12.5px] font-bold">{data.label}</p>
    </div>
  );
}

type LabelEdge = Edge<{ label: string }>;

/**
 * `EdgeLabelRenderer` من توثيق React Flow الرسمي (reactflow.dev/llms-full.txt):
 * يرسم عنوان الخط كـHTML فوق الـSVG، فيأخذ خطّ الصفحة وألوان الثيم. كان العنوان
 * قبله نصّ SVG بخلفية بيضاء ثابتة لا تعرف الوضع الداكن ولا خطّ الواجهة.
 */
function LabeledEdge({
  id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, style, data,
}: EdgeProps<LabelEdge>) {
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  });
  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan absolute rounded-md border border-primary/25 bg-card px-2 py-0.5 text-[11px] font-bold text-primary shadow-sm"
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
        >
          {data?.label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const nodeTypes = { alone: AloneNode, hub: HubNode, brick: BrickNode };
const edgeTypes = { labeled: LabeledEdge };

/** رأس سهم مغلق: الاتجاه يُرى بلا انتظار الحركة (MarkerType من توثيق React Flow). */
const arrow = { type: MarkerType.ArrowClosed, width: 16, height: 16 } as const;

/**
 * الفلسفة رسمًا لا جدولًا (خالد، ١٢ سبتمبر ٢٠٢٦: «حاسس أني قاعد أقرا في جدول»).
 * القراءة من اليمين إلى اليسار: طوبةٌ وحيدة، ثم سهمُ الانضمام، ثم بنيانٌ يشدّ بعضه بعضًا.
 * المواضع مضغوطة عمدًا — `fitView` يصغّر الرسم ليملأ الحاوية، فالرسم العريض يصغّر خطّه بنفسه.
 */
const nodes: Node<AloneData | HubData | BrickData>[] = [
  {
    id: "alone",
    type: "alone",
    position: { x: 590, y: 123 },
    data: { title: "طوبة وحيدة", body: "على نطاقه وحده: يبدأ من الصفر، وينتظر سنتين حتى يثق به البحث." },
    draggable: false,
  },
  { id: "hub", type: "hub", position: { x: 300, y: 120 }, data: { label: "بنيانٌ قائم" }, draggable: false },
  { id: "b1", type: "brick", position: { x: 60, y: 40 }, data: { label: "من سبقه" }, draggable: false },
  { id: "b2", type: "brick", position: { x: 60, y: 158 }, data: { label: "الشريك الجديد", self: true }, draggable: false },
  { id: "b3", type: "brick", position: { x: 60, y: 276 }, data: { label: "من يأتي بعده" }, draggable: false },
];

const edges: Edge[] = [
  {
    id: "join",
    source: "alone",
    target: "hub",
    targetHandle: "in",
    type: "labeled",
    animated: true,
    data: { label: "ينضم" },
    markerEnd: arrow,
    style: { strokeWidth: 2 },
  },
  { id: "h1", source: "hub", sourceHandle: "out", target: "b1", targetHandle: "in", type: "default", style: { strokeWidth: 1.25, opacity: 0.45 } },
  { id: "h2", source: "hub", sourceHandle: "out", target: "b2", targetHandle: "in", type: "default", style: { strokeWidth: 1.25, opacity: 0.45 } },
  { id: "h3", source: "hub", sourceHandle: "out", target: "b3", targetHandle: "in", type: "default", style: { strokeWidth: 1.25, opacity: 0.45 } },
  {
    id: "s1",
    source: "b1",
    sourceHandle: "down",
    target: "b2",
    targetHandle: "up",
    type: "labeled",
    animated: true,
    data: { label: "يشدّه" },
    markerEnd: arrow,
    style: { strokeWidth: 2 },
  },
  {
    id: "s2",
    source: "b2",
    sourceHandle: "down",
    target: "b3",
    targetHandle: "up",
    type: "labeled",
    animated: true,
    data: { label: "يشدّه" },
    markerEnd: arrow,
    style: { strokeWidth: 2 },
  },
];

export function ModontyPhilosophyMap() {
  return (
    <div className="h-[340px] w-full" dir="rtl">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
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
        <Background gap={20} size={1} className="!opacity-30" />
      </ReactFlow>
      <p className="sr-only">
        الشريك على نطاقه وحده طوبةٌ وحيدة تنتظر سنتين حتى يثق بها البحث. وحين ينضم إلى مدونتي
        يصير طوبةً في بنيان قائم: من سبقه يشدّه، وهو يشدّ من يأتي بعده.
      </p>
    </div>
  );
}
