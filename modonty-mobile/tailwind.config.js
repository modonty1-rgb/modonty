/** ألوان الموقع عبر متغيّرات CSS (global.css) — نفس أسماء shadcn في modonty/tailwind. */
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        destructive: 'hsl(var(--destructive))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        link: { DEFAULT: 'hsl(var(--link))', accent: 'hsl(var(--link-accent))' },
        star: 'hsl(var(--star))',
        header: 'hsl(var(--header))',
      },
      fontFamily: {
        tajawal: ['Tajawal_400Regular'],
        'tajawal-medium': ['Tajawal_500Medium'],
        'tajawal-bold': ['Tajawal_700Bold'],
      },
      borderRadius: { xl: '12px', '2xl': '16px' },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
