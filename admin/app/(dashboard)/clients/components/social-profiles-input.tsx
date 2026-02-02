"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Music,
  Link as LinkIcon,
  Check,
  X,
  Plus,
  Info,
} from "lucide-react";
import {
  validateSocialUrl,
  getPlatformIcon,
  getPlatformName,
  type Platform,
} from "../helpers/url-validation";
import { cn } from "@/lib/utils";

interface SocialProfile {
  url: string;
  platform: Platform;
}

interface SocialProfilesInputProps {
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
  hint?: string;
  error?: string;
  required?: boolean;
}

const platformIcons: Record<Platform, React.ComponentType<{ className?: string }>> = {
  linkedin: Linkedin,
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Music,
  other: LinkIcon,
};

export function SocialProfilesInput({
  label,
  value,
  onChange,
  hint,
  error,
  required,
}: SocialProfilesInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [profiles, setProfiles] = useState<SocialProfile[]>([]);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    error?: string;
  } | null>(null);

  // Initialize profiles from value prop
  useEffect(() => {
    if (value && value.length > 0) {
      const initialProfiles: SocialProfile[] = value.map((url) => {
        const result = validateSocialUrl(url, []);
        return {
          url: result.normalizedUrl,
          platform: result.platform,
        };
      });
      setProfiles(initialProfiles);
    } else {
      setProfiles([]);
    }
  }, [value]);

  // Validate input as user types
  useEffect(() => {
    if (!inputValue.trim()) {
      setValidationResult(null);
      return;
    }

    const result = validateSocialUrl(inputValue, profiles.map((p) => p.url));
    setValidationResult({
      isValid: result.isValid,
      error: result.error,
    });
  }, [inputValue, profiles]);

  const handleAdd = () => {
    if (!inputValue.trim() || !validationResult?.isValid) return;

    const result = validateSocialUrl(inputValue, profiles.map((p) => p.url));
    if (result.isValid) {
      const newProfile: SocialProfile = {
        url: result.normalizedUrl,
        platform: result.platform,
      };
      const updatedProfiles = [...profiles, newProfile];
      setProfiles(updatedProfiles);
      onChange(updatedProfiles.map((p) => p.url));
      setInputValue("");
      setValidationResult(null);
    }
  };

  const handleRemove = (index: number) => {
    const updatedProfiles = profiles.filter((_, i) => i !== index);
    setProfiles(updatedProfiles);
    onChange(updatedProfiles.map((p) => p.url));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && validationResult?.isValid) {
      e.preventDefault();
      handleAdd();
    }
  };

  const canAdd = validationResult?.isValid && inputValue.trim().length > 0;

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="linkedin.com/company/example"
            className={cn(
              "pr-10",
              validationResult?.isValid && "border-green-500 focus-visible:ring-green-500",
              validationResult && !validationResult.isValid && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {validationResult && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {validationResult.isValid ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-destructive" />
              )}
            </div>
          )}
        </div>
        <Button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          size="default"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {validationResult && !validationResult.isValid && validationResult.error && (
        <p className="text-sm text-destructive">{validationResult.error}</p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {profiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Added URLs ({profiles.length})
          </p>
          <div className="space-y-2">
            {profiles.map((profile, index) => {
              const Icon = platformIcons[profile.platform];
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-md border bg-card hover:bg-muted/50 transition-colors"
                >
                  <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <a
                      href={profile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline break-all"
                    >
                      {profile.url}
                    </a>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {getPlatformName(profile.platform)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(index)}
                    className="h-8 w-8 flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
