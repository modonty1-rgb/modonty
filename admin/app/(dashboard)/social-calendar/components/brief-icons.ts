import type { SocialFunnelStage, SocialPostFormat } from "@prisma/client";
import {
  Clapperboard,
  ClipboardList,
  Image as ImageIcon,
  Layers,
  Megaphone,
  ShoppingBag,
  Smartphone,
  ThumbsUp,
  Video,
  type LucideIcon,
} from "lucide-react";

/**
 * أيقونات نوع المحتوى وهدف الحملة — نظائر lucide لأيقونات القديم (`react-icons/fa6` في
 * `EntryPageForm.tsx:61-80` و`ProductionForm.tsx:32-51`). مكان واحد للنموذج وصفحة الإنتاج.
 */
export const FORMAT_ICON: Record<SocialPostFormat, LucideIcon> = {
  VIDEO: Video,
  CAROUSEL: Layers,
  POST: ImageIcon,
  STORY: Smartphone,
  REEL: Clapperboard,
};

export const FUNNEL_ICON: Record<SocialFunnelStage, LucideIcon> = {
  AWARENESS: Megaphone,
  ENGAGEMENT: ThumbsUp,
  LEADS: ClipboardList,
  CONVERSION: ShoppingBag,
};
