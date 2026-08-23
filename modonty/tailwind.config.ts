import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    // The shadcn primitives live in `shared`, outside this app's folder. Without this glob
    // every class used ONLY by them is purged: the dialog kept `fixed` (other files use it)
    // but lost `top-[50%]`, `left-[50%]` and the translates, so it landed at its static
    // position ~18,700px down the page while the black overlay covered the screen. Console
    // already carries this line for the same reason.
    "../shared/components/**/*.{ts,tsx}",
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
        "link-accent": "hsl(var(--link-accent))",
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
        // The designer's three greys, reachable by name. The light and dark ones already serve
        // as --border and --muted-foreground; the middle one had no token at all before 19 Aug.
        brand: {
          navy: "hsl(var(--brand-navy))",
          blue: "hsl(var(--brand-blue))",
          teal: "hsl(var(--brand-teal))",
          "gray-light": "hsl(var(--brand-gray-light))",
          gray: "hsl(var(--brand-gray))",
          "gray-dark": "hsl(var(--brand-gray-dark))",
        },
        star: "hsl(var(--star))",
        // The four reader actions — like · save · comment · share.
        action: {
          like: "hsl(var(--action-like))",
          "like-foreground": "hsl(var(--action-like-foreground))",
          save: "hsl(var(--action-save))",
          "save-foreground": "hsl(var(--action-save-foreground))",
          comment: "hsl(var(--action-comment))",
          "comment-foreground": "hsl(var(--action-comment-foreground))",
          share: "hsl(var(--action-share))",
          "share-foreground": "hsl(var(--action-share-foreground))",
          listen: "hsl(var(--action-listen))",
          "listen-foreground": "hsl(var(--action-listen-foreground))",
          audio: "hsl(var(--action-audio))",
          "audio-foreground": "hsl(var(--action-audio-foreground))",
          // Tab-strip only — see the `--tab-*` note in globals.css. Kept inside `action`
          // so the six tiles are declared the same way, not in two different namespaces.
          reels: "hsl(var(--tab-reels))",
          "reels-foreground": "hsl(var(--tab-reels-foreground))",
        },
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
      // Article typography. `maxWidth: none` is kept because every consumer already
      // sets its own column width — the plugin's 65ch would narrow eleven live pages.
      // Heading sizes are stated explicitly rather than inherited: Tajawal reads
      // smaller than the Latin faces the plugin's defaults were drawn for, and an
      // Arabic heading needs the extra step to separate from the paragraph.
      typography: {
        DEFAULT: {
          css: {
            // Every prose colour is bound to a theme token, so `prose` follows light and
            // dark on its own and no page needs `dark:prose-invert`. Without this the
            // plugin's own near-black defaults ship to every consumer: /terms lost its
            // headings and bold text into the dark background the moment it was enabled.
            "--tw-prose-body": "hsl(var(--foreground))",
            "--tw-prose-headings": "hsl(var(--foreground))",
            "--tw-prose-lead": "hsl(var(--muted-foreground))",
            "--tw-prose-links": "hsl(var(--primary))",
            "--tw-prose-bold": "hsl(var(--foreground))",
            "--tw-prose-counters": "hsl(var(--muted-foreground))",
            "--tw-prose-bullets": "hsl(var(--muted-foreground))",
            "--tw-prose-hr": "hsl(var(--border))",
            "--tw-prose-quotes": "hsl(var(--foreground))",
            "--tw-prose-quote-borders": "hsl(var(--border))",
            "--tw-prose-captions": "hsl(var(--muted-foreground))",
            "--tw-prose-code": "hsl(var(--foreground))",
            "--tw-prose-pre-code": "hsl(var(--foreground))",
            "--tw-prose-pre-bg": "hsl(var(--muted))",
            "--tw-prose-th-borders": "hsl(var(--border))",
            "--tw-prose-td-borders": "hsl(var(--border))",
            maxWidth: "none",
            color: "hsl(var(--foreground))",
            lineHeight: "1.8",
            h2: { fontSize: "1.75em", fontWeight: "700", lineHeight: "1.35", marginTop: "1.9em", marginBottom: "0.7em" },
            h3: { fontSize: "1.35em", fontWeight: "700", lineHeight: "1.4", marginTop: "1.6em", marginBottom: "0.6em" },
            h4: { fontSize: "1.15em", fontWeight: "700", lineHeight: "1.45" },
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
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};

export default config;

