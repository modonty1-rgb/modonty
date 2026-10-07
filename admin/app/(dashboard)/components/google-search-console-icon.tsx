/**
 * Google Search Console brand icon (inline SVG, multicolor).
 * Hardcoded Google brand colors so it stays recognizable on any theme.
 * Source pattern: Google Search Console product logo (magnifying glass + bar chart in Google colors).
 */
export function GoogleSearchConsoleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Magnifying glass handle (Google grey) */}
      <line
        x1="15.2"
        y1="15.2"
        x2="20.5"
        y2="20.5"
        stroke="#5F6368"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* Outer ring (Google blue) */}
      <circle
        cx="10"
        cy="10"
        r="6.6"
        fill="none"
        stroke="#4285F4"
        strokeWidth="1.6"
      />
      {/* Bar chart inside the lens (Google brand colors) */}
      <rect x="6.4" y="10.2" width="1.5" height="3" rx="0.3" fill="#4285F4" />
      <rect x="9.25" y="6.7" width="1.5" height="6.5" rx="0.3" fill="#EA4335" />
      <rect x="12.1" y="8.5" width="1.5" height="4.7" rx="0.3" fill="#FBBC04" />
    </svg>
  );
}
