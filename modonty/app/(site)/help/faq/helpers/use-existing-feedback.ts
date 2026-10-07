"use client";

import { useState, useEffect, useRef } from "react";
import { checkExistingFeedback } from "../actions";

export function useExistingFeedback(items: { id: string }[]) {
  const [feedbackStates, setFeedbackStates] = useState<Record<string, "helpful" | "not-helpful" | null>>({});
  const checkedItemsRef = useRef<Set<string>>(new Set());

  // Check for existing feedback on mount (only once per item)
  useEffect(() => {
    const checkFeedbacks = async () => {
      for (const item of items) {
        // Skip if already checked
        if (checkedItemsRef.current.has(item.id)) {
          continue;
        }

        // Mark as being checked
        checkedItemsRef.current.add(item.id);

        try {
          const existing = await checkExistingFeedback(item.id);
          if (existing.hasFeedback) {
            setFeedbackStates((prev) => ({
              ...prev,
              [item.id]: existing.isHelpful ? "helpful" : "not-helpful",
            }));
          }
        } catch (error) {
          console.error(`Error checking feedback for FAQ ${item.id}:`, error);
          // Remove from checked set on error so it can be retried
          checkedItemsRef.current.delete(item.id);
        }
      }
    };

    checkFeedbacks();
  }, [items]);

  return { feedbackStates, setFeedbackStates };
}
