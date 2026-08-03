"use client";

import { useState } from "react";

import { SeoAutoMaintenance } from "./seo-auto-maintenance";
import { CascadeStatusPanel } from "./cascade-status-panel";

/**
 * The two writers on this page share rows, and their order matters.
 *
 * Standard Fixes repair each entity's stored `canonicalUrl`. Full Rebuild then bakes that
 * column into every JSON-LD and metadata blob (knowledge-graph-generator:160 and
 * metadata-generator:150 both read it). Run the rebuild first and it happily bakes the
 * stale canonical into all 118 articles behind a green progress bar.
 *
 * Standard Fixes start on their own when the page opens, so the only way to get the wrong
 * order is a click during those ~20 seconds. This holds the start button until they land.
 */
export function SeoFixSequence({ attentionCount }: { attentionCount: number }) {
  const [standardFixesRunning, setStandardFixesRunning] = useState(true);

  return (
    <>
      <SeoAutoMaintenance
        attentionCount={attentionCount}
        onRunningChange={setStandardFixesRunning}
      />
      <CascadeStatusPanel blocked={standardFixesRunning} />
    </>
  );
}
