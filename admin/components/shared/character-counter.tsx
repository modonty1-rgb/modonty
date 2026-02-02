interface CharacterCounterProps {
  current: number;
  min?: number;
  max?: number;
  restrict?: boolean;
  className?: string;
  /** Shown when below min (best-practice warning). Ref: Google Search Central, Schema.org. */
  belowMinHint?: string;
  /** Shown when above max (best-practice warning). Ref: Google, Twitter Cards. */
  aboveMaxHint?: string;
}

export function CharacterCounter({
  current,
  min,
  max,
  restrict = false,
  className = "",
  belowMinHint,
  aboveMaxHint,
}: CharacterCounterProps) {
  const isBelowMin = min !== undefined && current < min;
  const isAboveMax = max !== undefined && current > max;
  const isValid = (!min || current >= min) && (!max || current <= max);

  const showError = restrict && isAboveMax;
  const showWarning = !restrict && isAboveMax;

  return (
    <div className={`text-xs ${className}`}>
      <span
        className={
          showError
            ? "text-destructive"
            : showWarning
              ? "text-amber-600 dark:text-amber-500"
              : isValid
                ? "text-muted-foreground"
                : "text-destructive"
        }
      >
        {current}
        {min !== undefined && ` / ${min} minimum`}
        {max !== undefined && !min && ` / ${max} maximum`}
        {min !== undefined && max !== undefined && ` (max: ${max})`}
        {showError && " - Exceeds maximum"}
        {showWarning && " - Exceeds recommended"}
      </span>
      {isBelowMin && belowMinHint && (
        <p className="mt-1 text-amber-600 dark:text-amber-500" role="status">
          {belowMinHint}
        </p>
      )}
      {isAboveMax && aboveMaxHint && (
        <p className="mt-1 text-amber-600 dark:text-amber-500" role="status">
          {aboveMaxHint}
        </p>
      )}
    </div>
  );
}
