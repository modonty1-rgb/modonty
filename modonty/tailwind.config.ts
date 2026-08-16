import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-tajawal)",
          "var(--font-montserrat)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        arabic: ["var(--font-tajawal)", "sans-serif"],
        latin: ["var(--font-montserrat)", "-apple-system", "sans-serif"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // Brand blue as TEXT (`text-link`); `text-primary` fails AA on dark surfaces.
        link: "hsl(var(--link))",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        star: "hsl(var(--star))",
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "hsl(var(--foreground))",
            lineHeight: "1.6",
          },
        },
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
      },
      // Scroll-driven pairs. Keyframes have to live in config — everything else
      // (timeline, range, feature query, reduced motion) is a utility at the call site.
      // Firefox needs a duration even though the scroll timeline is what drives it.
      keyframes: {
        "scroll-fill": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        // Opacity only, on purpose. A fade is not motion, so this needs no
        // `motion-reduce` variant — and that matters: the variant used to swap in
        // `animate-none`, which left nothing setting opacity 0, so the button sat on
        // screen from the first pixel for anyone with reduced motion switched on.
        // pointerEvents rides along so the hidden button is not an invisible click
        // target over the content beneath it.
        "scroll-reveal": {
          from: { opacity: "0", pointerEvents: "none" },
          to: { opacity: "1", pointerEvents: "auto" },
        },
      },
      // `both` is required, not cosmetic. MDN, animation-range: "By default, the styles
      // defined in a keyframe animation are only applied to an element while that element
      // is being animated… set animation-fill-mode to backwards, forwards, or both."
      // Without it the button falls back to its own styling outside the range — which is
      // why it showed at scroll 0 in one browser and not another.
      animation: {
        "scroll-fill": "scroll-fill 1ms linear both",
        "scroll-reveal": "scroll-reveal 1ms linear both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

