"use client";

import dynamic from "next/dynamic";
import type { TextToSpeechProps } from "@/components/TextToSpeech";

const TextToSpeech = dynamic(() => import("@/components/TextToSpeech").then(mod => ({ default: mod.TextToSpeech })), {
  ssr: false,
});

export function PostCardTextToSpeech(props: TextToSpeechProps) {
  return <TextToSpeech {...props} />;
}
