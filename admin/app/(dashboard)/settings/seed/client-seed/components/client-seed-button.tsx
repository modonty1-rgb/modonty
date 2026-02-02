/**
 * Client Seed Button Component
 * Standalone button for creating client seed data
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createClientSeed } from "../actions/client-seed-actions";

interface ClientSeedButtonProps {
  defaultClientCount?: number;
  useOpenAI?: boolean;
  industryBrief?: string;
  clearDatabase?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ClientSeedButton({
  defaultClientCount = 5,
  useOpenAI = false,
  industryBrief,
  clearDatabase = true,
  disabled = false,
  className,
}: ClientSeedButtonProps) {
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const handleCreateClientSeed = async () => {
    const input = prompt(
      "How many clients would you like to create? (1-50)",
      defaultClientCount.toString()
    );

    if (input === null) {
      return;
    }

    const requestedCount = parseInt(input, 10);
    if (isNaN(requestedCount) || requestedCount < 1 || requestedCount > 50) {
      toast({
        title: "Invalid client count",
        description: "Please enter a value between 1 and 50 for client seed.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsRunning(true);

      const result = await createClientSeed({
        clientCount: requestedCount,
        useOpenAI,
        industryBrief,
        clearDatabase,
      });

      if (result.success && result.summary) {
        toast({
          title: "Client seed completed",
          description: `Created ${result.summary.clients} clients with media from Unsplash`,
        });
      } else {
        toast({
          title: "Client seed failed",
          description: result.error || "An unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while starting the client seed process.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleCreateClientSeed}
      disabled={isRunning || disabled}
      className={className}
    >
      {isRunning ? "Creating clients..." : "Create Client Seed"}
    </Button>
  );
}
