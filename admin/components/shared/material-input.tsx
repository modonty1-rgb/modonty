"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface MaterialInputProps extends React.ComponentProps<"input"> {
  label: string;
  error?: string;
  hint?: string;
}

export const MaterialInput = React.forwardRef<HTMLInputElement, MaterialInputProps>(
  ({ className, label, error, hint, value, type, onFocus, onBlur, placeholder, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const hasValue = Boolean(value && String(value).length > 0);
    const hasPlaceholder = Boolean(placeholder);
    const isPasswordType = type === "password";
    const inputType = isPasswordType && showPassword ? "text" : type;
    // For date/time inputs, always float the label since they have native placeholders
    const isDateType = type === "date" || type === "time" || type === "datetime-local";
    // Float label if focused, has value, has placeholder, or is date type
    const isFloating = isFocused || hasValue || hasPlaceholder || isDateType;

    return (
      <div className="relative w-full">
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            value={value}
            placeholder={placeholder}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            className={cn(
              "peer h-12 w-full rounded-md border-2 bg-transparent text-sm",
              "transition-all duration-200",
              "focus:outline-none",
              isDateType ? "pt-5 pb-2" : isFloating ? "pt-5 pb-2" : "py-2",
              isPasswordType ? "pl-3 pr-10" : "px-3",
              isFloating || isFocused
                ? error
                  ? "border-destructive focus:border-destructive"
                  : "border-primary focus:border-primary"
                : error
                  ? "border-destructive"
                  : "border-input",
              className
            )}
            {...props}
          />
          {isPasswordType && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
          <label
            className={cn(
              "absolute left-3 pointer-events-none transition-all duration-200 origin-left z-10",
              isFloating
                ? "top-1.5 text-xs scale-90"
                : "top-1/2 -translate-y-1/2 text-sm",
              isFloating && !error
                ? "text-primary"
                : error
                  ? "text-destructive"
                  : "text-muted-foreground"
            )}
          >
            {label}
            {props.required && <span className="text-destructive ml-0.5">*</span>}
          </label>
          {isFloating && (
            <div
              className={cn(
                "absolute top-0 left-3 right-3 h-px transition-colors duration-200",
                error ? "bg-destructive" : "bg-primary"
              )}
            />
          )}
        </div>
        {error && (
          <p className="text-xs text-destructive mt-1.5 px-3">{error}</p>
        )}
        {hint && !error && (
          <p className={cn(
            "text-xs mt-1.5 px-3",
            hint.includes("authentication") || hint.includes("account access")
              ? "text-amber-600 dark:text-amber-500"
              : "text-muted-foreground"
          )}>{hint}</p>
        )}
      </div>
    );
  }
);

MaterialInput.displayName = "MaterialInput";
