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
import type { SVGProps } from "react";
import { ModontyArticlesMark } from "@modonty/shared/components/icons/modonty-articles-mark";
import { ModontyCheckMark } from "@modonty/shared/components/icons/modonty-check-mark";
import { ModontyGalleryMark } from "@modonty/shared/components/icons/modonty-gallery-mark";
import { ModontyInvoiceMark } from "@modonty/shared/components/icons/modonty-invoice-mark";
import { ModontyKeypointsMark } from "@modonty/shared/components/icons/modonty-keypoints-mark";
import { ModontyLikeMark } from "@modonty/shared/components/icons/modonty-like-mark";
import { ModontyMark } from "@modonty/shared/components/icons/modonty-mark";
import { ModontyPartnerMark } from "@modonty/shared/components/icons/modonty-partner-mark";
import { ModontyReelsMark } from "@modonty/shared/components/icons/modonty-reels-mark";
import { ModontyProfileMark } from "@modonty/shared/components/icons/modonty-profile-mark";
import { ModontySearchMark } from "@modonty/shared/components/icons/modonty-search-mark";
import { ModontyShareMark } from "@modonty/shared/components/icons/modonty-share-mark";
import { ModontyTrendingMark } from "@modonty/shared/components/icons/modonty-trending-mark";
import { ModontyTrustMark } from "@modonty/shared/components/icons/modonty-trust-mark";

import { FitOnResize } from "./fit-on-resize";

import "@xyflow/react/dist/style.css";

const FIT = { padding: { left: "40px", right: "40px", y: "40px" } };

type StageKey =
  | "marketing" | "organic" | "sales" | "money" | "verify" | "assets"
  | "brief" | "research" | "make" | "design" | "quality" | "approve" | "publish" | "reels" | "spread";

type StageData = {
  /**
   * رقم المحطّة. الترقيم كان مرفوعاً من الـPlaybook كلّه، وأُعيد هنا وحده بطلب خالد
   * (١٢ سبتمبر ٢٠٢٦) لأنه صار أداة عمل: «أعطيك كل مرحلة رقم عشان أعطيك تعديلاتها بالرقم».
   * ومتّصل ١..١٢ عبر الحلقتين، لا يبدأ من جديد في الثانية، فلا يلتبس رقمٌ برقم.
   */
  num: string;
  /** من ينفّذها بالاسم — لا اسم قسم مجرّد. */
  who: string;
  title: string;
  kind: StageKey;
};

const icons: Record<StageKey, (p: SVGProps<SVGSVGElement>) => React.ReactElement> = {
  marketing: ModontyTrendingMark,
  organic: ModontyShareMark,
  sales: ModontyPartnerMark,
  money: ModontyInvoiceMark,
  verify: ModontyTrustMark,
  assets: ModontyProfileMark,
  brief: ModontyKeypointsMark,
  research: ModontySearchMark,
  make: ModontyArticlesMark,
  design: ModontyGalleryMark,
  quality: ModontyCheckMark,
  approve: ModontyLikeMark,
  publish: ModontyMark,
  reels: ModontyReelsMark,
  spread: ModontyShareMark,
};

function StageNode({ data }: NodeProps<Node<StageData>>) {
  const Icon = icons[data.kind];
  // المحطّتان المتوازيتان تحملان الرقم نفسه، فتحتاجان ما يقول ذلك قبل قراءة الرقم:
  // خلفية واحدة تجمعهما، فيُقرأان كخطوة واحدة بمسارين لا كخطوتين متتابعتين.
  const parallel = data.kind === "make" || data.kind === "design" || data.kind === "reels";
  return (
    <div
      className={`w-[186px] rounded-lg border p-2 shadow-sm ${
        parallel ? "border-violet-500/40 bg-violet-500/[0.09]" : "bg-card"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-2 !border-card !bg-primary" />
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !border-2 !border-card !bg-primary" />
      {/* أطراف جانبية للجسر بين الحلقتين وللخطّ الراجع — لا تُرى، ولولاها لعبر الخطّ فوق البطاقات. */}
      <Handle id="side-out" type="source" position={Position.Left} className="!opacity-0" />
      <Handle id="side-in" type="target" position={Position.Right} className="!opacity-0" />
      <Handle id="loop-in" type="target" position={Position.Left} className="!opacity-0" />
      <Handle id="back-out" type="source" position={Position.Right} className="!opacity-0" />

      <div className="flex items-center gap-2.5">
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-primary/10 text-[11px] font-bold text-primary">
          {data.num}
        </span>
        <Icon className="shrink-0 text-[19px]" />
        {/* سطر واحد: العنوان بلون النصّ والاسم بلون خافت — فيكسب الكرت عرضًا ويقصر ارتفاعه. */}
        <p className="min-w-0 leading-4">
          <span className="text-[13px] font-bold text-foreground">{data.title}</span>
          <span className="text-[10.5px] text-muted-foreground"> · {data.who}</span>
        </p>
      </div>
    </div>
  );
}

/** بطاقة صغيرة: مصدران يجريان معًا فوق محطّة واحدة، فيأخذان عرضها مناصفةً. */
function MiniNode({ data }: NodeProps<Node<StageData>>) {
  return (
    <div className="w-[92px] rounded-lg border bg-card p-2 text-center shadow-sm">
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-2 !border-card !bg-primary" />
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !border-2 !border-card !bg-primary" />
      <Handle id="in-left" type="target" position={Position.Left} className="!opacity-0" />
      {data.who ? <p className="text-[9.5px] font-bold text-muted-foreground">{data.who}</p> : null}
      <h3 className="text-[11.5px] font-bold leading-4 text-foreground">{data.title}</h3>
    </div>
  );
}

/** ترويسة العمود: تقول أيّ حلقة هذه وكم مرّة تدور — وهي أهمّ ما في الرسم. */
function LoopHead({ data }: NodeProps<Node<{ title: string; rate: string }>>) {
  return (
    <div className="w-[186px] rounded-lg border border-primary/35 bg-primary/[0.07] px-2.5 py-1.5 text-center">
      <p className="text-[12.5px] font-bold text-foreground">{data.title}</p>
      <p className="text-[10px] text-muted-foreground">{data.rate}</p>
    </div>
  );
}

const nodeTypes = { stage: StageNode, mini: MiniNode, head: LoopHead };

/**
 * حلقتان لا رحلة واحدة (خالد، ١٢ سبتمبر ٢٠٢٦).
 *
 * التسويق كان يظهر مرّتين في خطٍّ واحد: يجيب شريكاً في أوّله، ويوزّع محتواه في آخره.
 * وخطٌّ يمرّ بمحطّة مرّتين ليس خطّاً — هو حلقتان تدوران بسرعتين مختلفتين:
 * الاكتساب يحدث مرّةً لكل شريك، والإنتاج يتكرّر كل دورة. ورسمُهما خطّاً واحداً
 * يوهم القارئ أن التسويق محطّة تُقطع ثم تُترك.
 *
 * والاتّجاه رأسيّ: اثنتا عشرة محطّة في صفٍّ أفقي تصغّر خطّها إلى ما لا يُقرأ.
 */
const nodes: Node<StageData | { title: string; rate: string }>[] = [
  { id: "head-acq",  type: "head", position: { x: 560, y: -110 }, data: { title: "مراحل اكتساب الشريك", rate: "مرّة واحدة لكل شريك" }, draggable: false },
  { id: "head-prod", type: "head", position: { x: 0,   y: -110 }, data: { title: "مراحل الإنتاج", rate: "تتكرّر كل شهر" }, draggable: false },

  // حلقة الاكتساب — العمود الأيمن
  { id: "lead-paid",    type: "mini", position: { x: 560, y: -40 }, data: { num: "١", who: "أماني", title: "المدفوع", kind: "marketing" } },
  { id: "lead-organic", type: "mini", position: { x: 654, y: -40 }, data: { num: "١", who: "مريم", title: "الأورجانك", kind: "organic" } },
  { id: "marketing", type: "mini", position: { x: 786, y: 58 }, data: { num: "", who: "", title: "المدفوع", kind: "marketing" } },
  { id: "organic",   type: "mini", position: { x: 786, y: 112 }, data: { num: "", who: "", title: "الأورجانك", kind: "organic" } },
  { id: "sales",     type: "stage", position: { x: 560, y: 72 }, data: { num: "٢", who: "فاتن", title: "المبيعات", kind: "sales" } },
  { id: "money",     type: "stage", position: { x: 560, y: 144 }, data: { num: "٣", who: "فاتن", title: "الفاتورة", kind: "money" } },
  { id: "verify",    type: "stage", position: { x: 560, y: 216 }, data: { num: "٤", who: "روان", title: "التوثيق", kind: "verify" } },
  { id: "assets",    type: "stage", position: { x: 560, y: 288 }, data: { num: "٥", who: "الشريك", title: "أصوله", kind: "assets" } },

  // حلقة الإنتاج — العمود الأيسر
  { id: "brief",     type: "stage", position: { x: 0, y: 0 },   data: { num: "٦", who: "روان", title: "الموجز", kind: "brief" } },
  { id: "research",  type: "stage", position: { x: 0, y: 72 }, data: { num: "٧", who: "الكتّاب", title: "الكلمات", kind: "research" } },
  { id: "make",      type: "stage", position: { x: 0, y: 144 }, data: { num: "٨", who: "الكتّاب", title: "الكتابة", kind: "make" } },
  { id: "design",    type: "stage", position: { x: 260, y: 144 }, data: { num: "٨", who: "مصطفى", title: "التصميم", kind: "design" } },
  { id: "quality",   type: "stage", position: { x: 0, y: 216 }, data: { num: "٩", who: "طارق", title: "الجودة", kind: "quality" } },
  { id: "approve",   type: "stage", position: { x: 0, y: 288 }, data: { num: "١٠", who: "الشريك", title: "الاعتماد", kind: "approve" } },
  { id: "publish",   type: "stage", position: { x: 0, y: 360 }, data: { num: "١١", who: "الكاتب من الأدمن", title: "النشر", kind: "publish" } },
  { id: "reels",     type: "stage", position: { x: 260, y: 396 }, data: { num: "١١·١٢", who: "محمد", title: "إنتاج الريلز", kind: "reels" } },
  { id: "spread",    type: "stage", position: { x: 0, y: 448 }, data: { num: "١٢", who: "مريم", title: "التوزيع", kind: "spread" } },
];

const step = {
  type: "smoothstep" as const,
  animated: true,
  markerEnd: { type: MarkerType.ArrowClosed },
  style: { strokeWidth: 1.75 },
};

/** الجسر بين الحلقتين: يُعبَر مرّةً واحدة لكل شريك، فلا يُرسم كخطوة داخل الإنتاج. */
const bridge = {
  ...step,
  style: { strokeWidth: 2, strokeDasharray: "6 4" },
  // الانحناء افتراضياً عند منتصف المسافة، والمنتصف هنا يقع داخل بطاقة التصميم.
  //  يقرّبه من المصدر، فيمرّ الخطّ يمين البطاقة لا فوقها (قِيس: ١١ عيّنة داخلها).
  pathOptions: { stepPosition: 0.12, borderRadius: 14 },
};

/** الخطّ الراجع هو ما يجعل الإنتاج حلقةً لا خطّاً — فهو وحده الملوّن والمعنون. */
const feedback = {
  type: "smoothstep" as const,
  animated: true,
  markerEnd: { type: MarkerType.ArrowClosed, color: "#00d8d8" },
  style: { strokeWidth: 2, stroke: "#00d8d8" },
  pathOptions: { offset: 46, borderRadius: 14 },
  label: "التفاعلات تعود إلى كونسوله",
  labelStyle: { fill: "#00d8d8", fontWeight: 700, fontSize: 11.5 },
  labelBgStyle: { fill: "hsl(var(--card))", stroke: "#00d8d8", strokeOpacity: 0.35 },
  labelBgPadding: [10, 6] as [number, number],
  labelBgBorderRadius: 8,
};

const edges: Edge[] = [
  { id: "lead1", source: "lead-paid", target: "sales", ...step, pathOptions: { offset: 6, borderRadius: 8 } },
  { id: "lead2", source: "lead-organic", target: "sales", ...step, pathOptions: { offset: 6, borderRadius: 8 } },
  { id: "a1", source: "sales", sourceHandle: "back-out", target: "marketing", targetHandle: "in-left", ...step },
  { id: "a1b", source: "sales", sourceHandle: "back-out", target: "organic", targetHandle: "in-left", ...step },
  { id: "a2", source: "sales", target: "money", ...step },
  { id: "a3", source: "money", target: "verify", ...step },
  { id: "a4", source: "verify", target: "assets", ...step },

  { id: "bridge", source: "assets", sourceHandle: "side-out", target: "brief", targetHandle: "side-in", ...bridge },

  { id: "p1", source: "brief", target: "research", ...step },
  { id: "p2", source: "research", target: "make", ...step },
  { id: "p3", source: "make", target: "quality", ...step },
  // سهمٌ رايحٌ جاءٍ بين الكتابة والتصميم: يشتغلان معاً على الموجز نفسه، ويتبادلان بينهما.
  // بطاقة التصميم يمين بطاقة الكتابة، فالسهمان يعبران الفجوة بينهما لا يلفّان حول الرسم.
  { id: "pair-out", source: "make", sourceHandle: "back-out", target: "design", targetHandle: "loop-in", ...step },
  { id: "pair-back", source: "design", sourceHandle: "side-out", target: "make", targetHandle: "side-in", ...step },
  { id: "p4", source: "quality", target: "approve", ...step },
  { id: "p5", source: "approve", target: "publish", ...step },
  { id: "p6", source: "publish", target: "spread", ...step },

  // فرع محمد: يبدأ مع النشر، ويصبّ في التوزيع — فيُقرأ متوازياً لا لاحقاً.
  { id: "r1", source: "publish", sourceHandle: "back-out", target: "reels", targetHandle: "loop-in", ...step },
  { id: "r2", source: "reels", sourceHandle: "side-out", target: "spread", targetHandle: "side-in", ...step },

  { id: "loop", source: "publish", sourceHandle: "back-out", target: "assets", targetHandle: "loop-in", ...feedback },
];

export function ModontySystemMap() {
  return (
    // ارتفاع صريح لا فئة Tailwind: الرسم ينهار إلى صفر إن لم تُولَّد الفئة، وقد حدث.
    <div style={{ height: 640 }} className="w-full" dir="rtl">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        /**
         * حشوة لكل جهة على حدة، لا رقماً واحداً.
         *
         * السبب من التوثيق الرسمي: `fitView` يحسب مجاله بـ`getNodesBounds`، وهي تقيس
         * «الـnodes» وحدها — الخطوط ووسومها خارج الحساب تماماً
         * (reactflow.dev/api-reference/utils/get-nodes-bounds).
         * والخطّ الراجع هنا يخرج ٣٨٥ بكسل يسار أقصى بطاقة، ووسمه معه، فكان يُقصّ
         * عند حافّة الحاوية مهما رفعتُ الحشوة النسبية — لأنها تُحسب من مجالٍ لا يراه.
         * الحشوة الجانبية المعلومة بالبكسل هي العلاج الرسمي لهذه الحالة بعينها
         * (reactflow.dev/whats-new/2025-03-27).
         */
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
        حلقتان: حلقة الاكتساب تحدث مرّة لكل شريك — التسويق ثم المبيعات ثم الفاتورة ثم التوثيق
        وفتح الكونسول ثم تجهيز الشريك لملفّه. وحلقة الإنتاج تتكرّر كل دورة — الموجز ثم الدراسة
        والكلمات المفتاحية ثم الكتابة والإنتاج ثم الجودة والتوقيع ثم اعتماد الشريك ثم النشر ثم
        التوزيع، وتعود تفاعلاته إلى كونسوله فتُبنى عليها الدورة التالية.
      </p>
    </div>
  );
}
