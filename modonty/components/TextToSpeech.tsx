"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Pause, Play } from "lucide-react";

export interface TextToSpeechProps {
  text: string;
  lang?: string;
  className?: string;
}

export function TextToSpeech({ text, lang = "ar-SA", className }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setIsSupported("speechSynthesis" in window);
  }, []);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlay = () => {
    if (!isSupported || !text) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 ${className || ""}`}>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handlePlay}
        aria-label={isPlaying ? "إيقاف مؤقت" : isPaused ? "متابعة" : "استمع"}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4 text-primary" />
        ) : isPaused ? (
          <Play className="h-4 w-4 text-primary" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>
      {isPlaying && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleStop}
          aria-label="إيقاف"
        >
          <VolumeX className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}




