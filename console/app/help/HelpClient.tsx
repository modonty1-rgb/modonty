"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { ScrollProgress } from "./components/ScrollProgress";
import { ImageModal } from "./components/ImageModal";
import { HeroV2 } from "./components/v2/HeroV2";
import { TocSidebarV2 } from "./components/v2/TocSidebarV2";
import { Tier0Platform } from "./components/v2/Tier0Platform";
import { Tier1Intro } from "./components/v2/Tier1Intro";
import { Tier2ClientPage } from "./components/v2/Tier2ClientPage";
import { Tier3Engagement } from "./components/v2/Tier3Engagement";
import { AllEngagementSummary } from "./components/v2/AllEngagementSummary";
import { Tier4ConsolePages } from "./components/v2/Tier4ConsolePages";
import { Tier5Account } from "./components/v2/Tier5Account";
import { SalesPitchPlayer } from "./console/SalesPitchPlayer";

interface ModalState {
  src: string;
  alt: string;
}

export function HelpClient() {
  const [modal, setModal] = useState<ModalState | null>(null);

  const openImage = (src: string, alt: string) => setModal({ src, alt });

  return (
    <div className="min-h-dvh bg-background">
      {/* Fixed top bar — sales pitch player (browser-tts mode for iteration) */}
      <div className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-background/90 border-b border-border shadow-sm">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-2.5 flex items-center justify-end gap-3">
          <a
            href="https://www.modonty.com/story"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-background hover:bg-muted text-foreground text-xs md:text-sm font-medium px-3 py-2 rounded-full border border-border transition-colors"
            aria-label="افتح الصفحة العامة للقصة"
            title="افتح القصة كصفحة عامة على modonty.com (للمشاركة)"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">الصفحة العامة</span>
          </a>
          <SalesPitchPlayer
            mode="elevenlabs"
            manifestUrl="/help/audio/general-pitch/manifest.json"
            audioBase="/help/audio/general-pitch"
            label="اسمع شرح مودونتي"
          />
        </div>
      </div>

      <ScrollProgress />
      <TocSidebarV2 />
      <div className="max-w-[1100px] md:ms-[284px] lg:ms-[304px] mx-auto px-4 md:px-6 py-6 pt-14">
        <main>
          <HeroV2 />
          <Tier0Platform />
          <Tier1Intro />
          <Tier2ClientPage onImageClick={openImage} />
          <Tier3Engagement onImageClick={openImage} />
          <AllEngagementSummary />
          <Tier4ConsolePages onImageClick={openImage} />
          <Tier5Account onImageClick={openImage} />

          <footer className="text-center text-xs text-muted-foreground py-8 border-t border-border mt-8">
            <p className="mb-1">
              دليل بوابة العملاء — <b className="text-foreground">مودونتي</b>
            </p>
            <p>كل لقطات الشاشة من موقعك الحقيقي · يُحدّث باستمرار</p>
          </footer>
        </main>
      </div>
      <ImageModal
        src={modal?.src ?? null}
        alt={modal?.alt ?? ""}
        onClose={() => setModal(null)}
      />
    </div>
  );
}
