# Design System Documentation

> **Single Source of Truth** for all design decisions across the Modonty monorepo (admin, beta, home packages)
>
> This design system replicates LinkedIn's professional, calm, editorial aesthetic with 100% alignment to their exact design specifications.

---

## Table of Contents

1. [Design Foundations](#design-foundations)
2. [Component System](#component-system)
3. [Layout Patterns](#layout-patterns)
4. [Responsive Design](#responsive-design)
5. [Icons](#icons)
6. [Dark Mode](#dark-mode)
7. [RTL Support](#rtl-support)
8. [Accessibility](#accessibility)
9. [Animation & Transitions](#animation--transitions)
10. [Monorepo Guidelines](#monorepo-guidelines)
11. [Official Documentation References](#official-documentation-references)
12. [Best Practices](#best-practices)
13. [Code Examples](#code-examples)

---

## Design Foundations

### Colors

#### LinkedIn Color Palette (Exact Values)

Our color system uses LinkedIn's exact color values, implemented via HSL CSS variables for flexibility and dark mode support.

**Background & Surfaces:**

```css
/* LinkedIn's exact warm gray background */
--background: 45 8% 95%; /* #f3f2ef - LinkedIn's signature background */
--card: 0 0% 100%; /* #ffffff - Pure white for cards */
--popover: 0 0% 100%; /* White for popovers and dropdowns */
--border: 60 3% 88%; /* #e0e0de - LinkedIn's subtle border color */
--input: 60 3% 88%; /* Border color for inputs */
```

**Primary Colors:**

```css
/* LinkedIn's exact brand blue */
--primary: 210 90% 40%; /* #0a66c2 - LinkedIn's signature blue */
--primary-foreground: 0 0% 100%; /* White text on primary */
--primary-hover: 210 100% 25%; /* #004182 - Darker blue on hover */
--primary-light: 210 90% 70%; /* #70b5f9 - Light blue for secondary actions */
--ring: 210 90% 40%; /* Focus ring color */
```

**Text Colors:**

```css
--foreground: 0 0% 0%; /* #000000 - Black for main text */
--card-foreground: 0 0% 0%; /* Black text on cards */
--muted-foreground: 0 0% 40%; /* #666666 - LinkedIn's gray text */
--secondary-text: 0 0% 60%; /* #999999 - Lighter gray for less important text */
--popover-foreground: 0 0% 0%; /* Black text in popovers */
```

**Semantic Colors:**

```css
--secondary: 0 0% 96%; /* Light gray for secondary elements */
--secondary-foreground: 0 0% 0%; /* Black text on secondary */
--muted: 0 0% 96%; /* Muted background */
--accent: 0 0% 96%; /* Accent background */
--accent-foreground: 0 0% 0%; /* Accent text */
--destructive: 0 84.2% 60.2%; /* Red for destructive actions */
--destructive-foreground: 0 0% 100%; /* White text on destructive */
--success: 142 76% 36%; /* Green for success states */
--warning: 38 92% 50%; /* Yellow for warning states */
```

**Usage Guidelines:**

- **Primary Blue (`#0a66c2`)**: Use for primary actions, links, and brand elements
- **Primary Hover (`#004182`)**: Darker blue for hover states on primary buttons
- **Primary Light (`#70b5f9`)**: Light blue for secondary actions and highlights
- **Background (`#f3f2ef`)**: Main page background - creates LinkedIn's warm, professional feel
- **Cards**: Always white (`#ffffff`) on the warm gray background
- **Borders**: Subtle gray (`#e0e0de`) for card borders and dividers
- **Muted Text (`#666666`)**: For secondary information, metadata, timestamps
- **Secondary Text (`#999999`)**: For less important text, disabled states

**Color Accessibility:**

All color combinations meet WCAG 2.1 AA standards:

- Primary blue on white: ✅ 4.5:1 contrast ratio
- Black text on background: ✅ 4.5:1 contrast ratio
- Muted text on white: ✅ 4.5:1 contrast ratio
- Primary blue on white (large text): ✅ 3:1 contrast ratio

**Tailwind Usage:**

```tsx
// Background colors
<div className="bg-background">     {/* LinkedIn warm gray */}
<div className="bg-card">            {/* White card */}
<div className="bg-primary">        {/* LinkedIn blue */}

// Text colors
<p className="text-foreground">     {/* Black text */}
<p className="text-muted-foreground"> {/* Gray text */}
<p className="text-primary">        {/* LinkedIn blue text */}

// Border colors
<div className="border border-border"> {/* Subtle gray border */}

// Hover states
<button className="hover:bg-primary-hover"> {/* Darker blue on hover */}
```

---

### Typography

#### Font Stack

**Primary Font (System Fonts):**
LinkedIn uses system fonts for optimal performance and native feel across platforms.

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
  sans-serif;
```

**Arabic Font (RTL Support):**
For Arabic content, we use Tajawal:

```css
font-family: 'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

**Font Features:**

```css
font-feature-settings: 'rlig' 1, 'calt' 1;
```

- `rlig`: Required ligatures (important for Arabic)
- `calt`: Contextual alternates

#### Type Scale

LinkedIn uses a clear, hierarchical type scale:

| Element | Size            | Line Height | Weight         | Usage                      |
| ------- | --------------- | ----------- | -------------- | -------------------------- |
| H1      | 2rem (32px)     | 1.2-1.3     | 600 (semibold) | Page titles, hero headings |
| H2      | 1.5rem (24px)   | 1.2-1.3     | 600 (semibold) | Section headers            |
| H3      | 1.25rem (20px)  | 1.2-1.3     | 600 (semibold) | Subsection headers         |
| H4      | 1.125rem (18px) | 1.4         | 500 (medium)   | Card titles, small headers |
| Body    | 1rem (16px)     | 1.5-1.6     | 400 (regular)  | Default text, paragraphs   |
| Small   | 0.875rem (14px) | 1.4         | 400 (regular)  | Secondary text, captions   |
| Caption | 0.75rem (12px)  | 1.4         | 400 (regular)  | Metadata, timestamps       |

**Tailwind Classes:**

```tsx
<h1 className="text-2xl font-semibold leading-tight">     {/* H1 */}
<h2 className="text-xl font-semibold leading-snug">      {/* H2 */}
<h3 className="text-lg font-semibold leading-snug">     {/* H3 */}
<h4 className="text-base font-medium leading-normal">    {/* H4 */}
<p className="text-base leading-relaxed">                 {/* Body */}
<p className="text-sm leading-normal">                   {/* Small */}
<span className="text-xs leading-normal">                {/* Caption */}
```

**Font Weights:**

- Regular: 400 (default body text)
- Medium: 500 (for emphasis, H4)
- Semibold: 600 (for headings H1-H3)
- Bold: 700 (for strong emphasis)

**SEO-Friendly Heading Hierarchy:**

Always maintain proper heading hierarchy for SEO:

```tsx
<h1>Page Title</h1>
  <h2>Section</h2>
    <h3>Subsection</h3>
      <h4>Card Title</h4>
```

**Text Truncation:**

Use Tailwind's line-clamp utilities for text truncation:

```tsx
<p className="line-clamp-2">Long text that will be truncated...</p>
<p className="line-clamp-3">Even longer text...</p>
```

---

### Spacing

#### 8px Grid System

LinkedIn uses a consistent 8px grid system for all spacing. Our Tailwind spacing scale aligns with this:

| Token        | Value         | Usage                         |
| ------------ | ------------- | ----------------------------- |
| `xs` / `1`   | 4px (0.25rem) | Tight spacing, icon gaps      |
| `sm` / `2`   | 8px (0.5rem)  | Small gaps, compact spacing   |
| `md` / `4`   | 16px (1rem)   | Default spacing, card padding |
| `lg` / `6`   | 24px (1.5rem) | Section spacing               |
| `xl` / `8`   | 32px (2rem)   | Large sections, page padding  |
| `2xl` / `12` | 48px (3rem)   | Extra large spacing           |

**Component Spacing Patterns:**

```tsx
// Card padding (LinkedIn standard)
<Card className="p-4">  {/* 16px padding */}

// Card gap (between cards)
<div className="grid gap-3">  {/* 12px gap (0.75rem) */}

// Section spacing
<section className="py-6">  {/* 24px vertical padding */}

// Container padding
<div className="px-4 md:px-6">  {/* 16px mobile, 24px desktop */}
```

**Custom Spacing:**

We have custom spacing values in `tailwind.config.ts`:

- `18`: 4.5rem (72px) - For specific layout needs
- `88`: 22rem (352px) - For sidebar widths

---

### Border Radius

LinkedIn uses subtle, consistent border radius values:

| Size    | Value          | Usage                                 |
| ------- | -------------- | ------------------------------------- |
| Small   | 4px (0.25rem)  | Buttons, small elements               |
| Default | 8px (0.5rem)   | Cards, containers (LinkedIn standard) |
| Large   | 12px (0.75rem) | Large cards, modals                   |

**CSS Variable:**

```css
--radius: 0.5rem; /* 8px - Default border radius */
```

**Tailwind Usage:**

```tsx
<Card className="rounded-lg">     {/* 8px - Default (cards) */}
<Button className="rounded-md">   {/* 6px - Buttons */}
<div className="rounded-sm">      {/* 4px - Small elements */}
<div className="rounded-xl">      {/* 12px - Large elements */}
```

---

### Shadows

LinkedIn uses very subtle shadows for depth:

| Shadow Type | Value                            | Usage               |
| ----------- | -------------------------------- | ------------------- |
| Card        | `0 1px 2px rgba(0, 0, 0, 0.05)`  | Default card shadow |
| Hover       | `0 2px 4px rgba(0, 0, 0, 0.1)`   | Card hover state    |
| Modal       | `0 4px 12px rgba(0, 0, 0, 0.15)` | Modals, dropdowns   |

**Tailwind Usage:**

```tsx
<Card className="shadow-sm hover:shadow-md transition-shadow">
  {/* Subtle shadow that increases on hover */}
</Card>
```

**Implementation:**

LinkedIn's shadows are very subtle. Use Tailwind's `shadow-sm` for cards and `shadow-md` for hover states. Avoid heavy shadows.

---

## Component System

### shadcn/ui Components

We use [shadcn/ui](https://ui.shadcn.com) as our component library, styled to match LinkedIn's aesthetic.

**Configuration:**

- Style: `default` (LinkedIn-inspired)
- Base color: `slate` (neutral, professional)
- CSS variables: `true` (for theming)
- RSC: `true` (React Server Components)

**Available Components:**

| Component      | Usage                  | LinkedIn Pattern                        |
| -------------- | ---------------------- | --------------------------------------- |
| `Button`       | Primary actions, links | LinkedIn blue primary, subtle secondary |
| `Card`         | Content containers     | White cards on warm gray background     |
| `Input`        | Form inputs            | Subtle borders, LinkedIn blue focus     |
| `Label`        | Form labels            | Clear, accessible labels                |
| `Badge`        | Status indicators      | Subtle, professional badges             |
| `Avatar`       | User images            | Circular, professional avatars          |
| `DropdownMenu` | Navigation menus       | Clean, accessible dropdowns             |
| `Dialog`       | Modals                 | Professional modal dialogs              |
| `Alert`        | Notifications          | Subtle, non-intrusive alerts            |
| `Accordion`    | Collapsible sections   | Clean, accessible accordions            |
| `Textarea`     | Multi-line inputs      | LinkedIn-style text areas               |
| `Select`       | Dropdown selects       | Professional select components          |

**Component Location:**
All shadcn/ui components are in `components/ui/` directory.

**Import Pattern:**

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
```

---

### Card Component (LinkedIn Style)

Cards are the foundation of LinkedIn's layout. Every content piece is in a white card on the warm gray background.

**Standard Card Pattern:**

```tsx
<Card className="hover:shadow-md transition-shadow">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>{/* Card content */}</CardContent>
</Card>
```

**Card Specifications:**

- Background: White (`bg-card`)
- Border: Subtle gray (`border-border`)
- Border Radius: 8px (`rounded-lg`)
- Padding: 16px (`p-4`)
- Shadow: Very subtle (`shadow-sm`)
- Hover: Slightly increased shadow (`hover:shadow-md`)

**Article Card Example:**

```tsx
<Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
  {image && (
    <div className="aspect-video w-full overflow-hidden rounded-t-lg">
      <img src={image} alt={title} className="w-full h-full object-cover" />
    </div>
  )}
  <CardHeader>
    <CardTitle className="line-clamp-2">{title}</CardTitle>
    {excerpt && <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{excerpt}</p>}
  </CardHeader>
  <CardContent>
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <span>{clientName}</span>
      <span>{date}</span>
    </div>
  </CardContent>
</Card>
```

---

### Button Component

Buttons follow LinkedIn's clean, professional style.

**Variants:**

```tsx
// Primary (LinkedIn blue)
<Button variant="default">Primary Action</Button>

// Secondary (light gray)
<Button variant="secondary">Secondary Action</Button>

// Ghost (transparent, hover effect)
<Button variant="ghost">Ghost Button</Button>

// Destructive (red)
<Button variant="destructive">Delete</Button>
```

**Sizes:**

```tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

**With Icons:**

```tsx
<Button>
  <Icon className="mr-2 h-4 w-4" />
  Button Text
</Button>
```

**Button Specifications:**

- Primary: LinkedIn blue (`#0a66c2`)
- Primary Hover: Darker blue (`#004182`)
- Border Radius: 6px (`rounded-md`)
- Padding: 8px 16px (default)
- Font Weight: 500 (medium)

---

### Link Component

Links follow LinkedIn's clean, professional style with clear visual indicators.

**Standard Link Pattern:**

```tsx
import Link from 'next/link';

// Text link with underline
<Link href="/articles" className="underline hover:opacity-80 transition-opacity">
  View Articles
</Link>

// Link in status breakdown or clickable items
<Link href="/articles?status=DRAFT" className="block space-y-2 hover:opacity-80 transition-opacity cursor-pointer">
  <span className="underline">Draft</span>
</Link>
```

**Link Specifications:**

- **Text Links**: Use `underline` class for all clickable text links
- **Color**: Inherit text color (usually `text-foreground` or `text-primary`)
- **Hover Effect**: `hover:opacity-80 transition-opacity` for smooth interaction
- **Cursor**: `cursor-pointer` for clickable elements
- **Next.js Link**: Always use Next.js `Link` component for client-side navigation

**Link Usage Guidelines:**

- **Status Items**: When status labels or breakdown items are clickable, add `underline` class to the text label
- **Navigation Links**: Use underline for all navigation and filter links
- **Article Titles**: Article titles in lists should be underlined when clickable
- **Hover States**: Always include hover effects (`hover:opacity-80`) for better UX

**Examples:**

```tsx
// Clickable status breakdown item
<Link href="/articles?status=PUBLISHED" className="block space-y-2 hover:opacity-80 transition-opacity cursor-pointer">
  <div className="flex items-center justify-between text-sm">
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4" />
      <span className="underline">Published</span>
    </div>
    <span className="font-medium">{count}</span>
  </div>
</Link>

// Simple text link
<Link href="/articles" className="underline hover:text-primary transition-colors">
  View all articles
</Link>
```

---

### Input Components

Form inputs match LinkedIn's clean, professional style.

**Standard Input:**

```tsx
<Input type="email" placeholder="Email address" className="border-border focus:ring-primary" />
```

**Input with Label:**

```tsx
<div className="grid gap-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>
```

**Input Specifications:**

- Border: Subtle gray (`#e0e0de`)
- Border Radius: 6px
- Focus Ring: LinkedIn blue (`#0a66c2`)
- Padding: 8px 12px

---

### Navigation

#### Top Navigation Bar

LinkedIn-style top navigation with sticky positioning.

**Pattern:**

```tsx
<header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
  <div className="container mx-auto max-w-[1128px]">
    <div className="flex h-14 items-center justify-between px-4">
      {/* Logo */}
      <Link href="/">Logo</Link>

      {/* Navigation Items */}
      <nav className="flex items-center gap-1">
        <NavItem icon={Home} label="Home" href="/" />
        <NavItem icon={Tags} label="Categories" href="/categories" />
      </nav>

      {/* User Menu */}
      <UserMenu />
    </div>
  </div>
</header>
```

**Navigation Specifications:**

- Height: 56px (`h-14`)
- Background: White
- Border: Bottom border (`border-b`)
- Shadow: Subtle (`shadow-sm`)
- Max Width: 1128px (LinkedIn standard)
- Sticky: `sticky top-0`
- Icon + Text: Consistent icon placement patterns
- Active States: Clear visual indicators for active navigation items

---

## Layout Patterns

### Card Grid Layout

LinkedIn's signature card grid layout.

**Responsive Grid:**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item) => (
    <Card key={item.id}>{/* Card content */}</Card>
  ))}
</div>
```

**Grid Specifications:**

- Mobile: 1 column
- Tablet (md): 2 columns
- Desktop (lg): 3 columns
- Gap: 24px (`gap-6`) between cards
- Max Width Container: 1128px (LinkedIn standard)
- Card Hover Effects: Subtle shadow increase

---

### Container Patterns

**Standard Container:**

```tsx
<div className="container mx-auto max-w-[1128px] px-4 py-8">{/* Content */}</div>
```

**Container Specifications:**

- Max Width: 1128px (LinkedIn's feed width)
- Padding: 16px mobile (`px-4`), 24px desktop (`px-6`)
- Centered: `mx-auto`

**Full-Width Container:**

```tsx
<div className="w-full">{/* Full width content */}</div>
```

---

### Feed Layout

Vertical card stack for article feeds.

**Pattern:**

```tsx
<div className="space-y-6">
  {articles.map((article) => (
    <Card key={article.id} className="hover:shadow-md transition-shadow">
      {/* Article card */}
    </Card>
  ))}
</div>
```

**Feed Specifications:**

- Vertical spacing: 24px (`space-y-6`)
- Cards: White on warm gray background
- Hover: Subtle shadow increase
- Card Content Structure: Image, title, excerpt, metadata

---

## Responsive Design

### Breakpoints (Tailwind Standard)

| Breakpoint | Value  | Usage            |
| ---------- | ------ | ---------------- |
| `sm`       | 640px  | Mobile landscape |
| `md`       | 768px  | Tablet           |
| `lg`       | 1024px | Desktop          |
| `xl`       | 1280px | Large desktop    |
| `2xl`      | 1536px | Extra large      |

**Mobile-First Approach:**

Always start with mobile styles, then enhance for larger screens:

```tsx
<div className="
  text-sm          {/* Mobile: small text */}
  md:text-base     {/* Tablet+: default text */}
  lg:text-lg       {/* Desktop+: larger text */}
">
```

**Responsive Grid Example:**

```tsx
<div className="
  grid
  grid-cols-1      {/* Mobile: 1 column */}
  md:grid-cols-2   {/* Tablet: 2 columns */}
  lg:grid-cols-3   {/* Desktop: 3 columns */}
  gap-4            {/* Mobile: 16px gap */}
  md:gap-6         {/* Tablet+: 24px gap */}
">
```

**Responsive Spacing Adjustments:**

- Mobile: Tighter spacing (16px padding, 12px gaps)
- Desktop: More generous spacing (24px padding, 24px gaps)

---

## Icons

### Lucide React

We use [Lucide React](https://lucide.dev) for all icons, matching LinkedIn's clean icon style.

**Icon Sizes:**

| Size | Value          | Usage               |
| ---- | -------------- | ------------------- |
| `xs` | 12px (0.75rem) | Very small icons    |
| `sm` | 16px (1rem)    | Small icons, inline |
| `md` | 20px (1.25rem) | Default icons       |
| `lg` | 24px (1.5rem)  | Large icons         |
| `xl` | 32px (2rem)    | Extra large icons   |

**Usage:**

```tsx
import { Home, User, Settings } from "lucide-react";

<Home className="h-5 w-5" />        {/* Default size */}
<User className="h-4 w-4" />       {/* Small */}
<Settings className="h-6 w-6" />   {/* Large */}
```

**Icon with Text:**

```tsx
<Button>
  <Home className="mr-2 h-4 w-4" />
  Home
</Button>
```

**Icon Usage Guidelines:**

- Consistent sizing within components
- Proper spacing from text (use `mr-2` or `ml-2` for spacing)
- RTL icon mirroring (for directional icons)

**RTL Icon Mirroring:**

For directional icons in RTL, use conditional classes:

```tsx
<ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
```

---

## Dark Mode

### Implementation

Dark mode is implemented using Tailwind's class-based strategy, following LinkedIn's design token system approach for flexible theme management.

**Toggle Dark Mode:**

```tsx
// Add/remove 'dark' class on html element
document.documentElement.classList.toggle('dark');

// Or using a theme provider
import { useTheme } from 'next-themes';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
}
```

**Dark Mode Colors (LinkedIn-Inspired):**

LinkedIn uses a design token system where colors are semantically labeled, allowing for easy theme switching. Our implementation follows this pattern:

```css
.dark {
  /* Background & Surfaces */
  --background: 222.2 84% 4.9%; /* Dark blue-gray - avoids pure black for reduced eye strain */
  --card: 222.2 84% 6%; /* Slightly lighter dark for cards - creates visual depth */
  --popover: 222.2 84% 6%; /* Dark popovers */
  --border: 217.2 32.6% 17.5%; /* Subtle dark borders */
  --input: 217.2 32.6% 17.5%; /* Input borders in dark mode */

  /* Text Colors */
  --foreground: 210 40% 98%; /* Light text for readability */
  --card-foreground: 210 40% 98%; /* Light text on cards */
  --muted-foreground: 215 20.2% 65.1%; /* Muted text in dark mode */
  --popover-foreground: 210 40% 98%; /* Light text in popovers */

  /* Primary Colors */
  --primary: 217.2 91.2% 59.8%; /* Lighter blue for better visibility in dark mode */
  --primary-foreground: 222.2 84% 4.9%; /* Dark text on primary */
  --primary-hover: 217.2 91.2% 65%; /* Slightly lighter on hover */
  --ring: 217.2 91.2% 59.8%; /* Focus ring color */

  /* Semantic Colors */
  --secondary: 217.2 32.6% 17.5%; /* Dark secondary background */
  --secondary-foreground: 210 40% 98%; /* Light text on secondary */
  --muted: 217.2 32.6% 17.5%; /* Muted background */
  --accent: 217.2 32.6% 17.5%; /* Accent background */
  --accent-foreground: 210 40% 98%; /* Accent text */
  --destructive: 0 72.2% 50.6%; /* Adjusted red for dark mode */
  --destructive-foreground: 210 40% 98%; /* Light text on destructive */
}
```

**Usage:**

Dark mode works automatically with Tailwind's color system. All components support dark mode out of the box.

```tsx
<div className="bg-background text-foreground">{/* Automatically adapts to dark mode */}</div>
```

**Dark Mode Design Principles (LinkedIn-Inspired):**

Following LinkedIn's approach to dark mode design:

1. **Balancing Color Contrast**
   - Use dark grays (`#1a1a1a` range) instead of pure black (`#000000`)
   - Reduces eye strain in low-light environments
   - Maintains visual depth without overwhelming brightness

2. **Visual Depth**
   - Use subtle shadows and soft borders to create layering
   - Cards should be slightly lighter than background for separation
   - Careful layering gives dark interfaces a sense of space

3. **User Control**
   - Provide theme toggle for user preference
   - Respect system preferences (`prefers-color-scheme`)
   - Persist user choice in localStorage

4. **Accessibility**
   - Maintain WCAG 2.1 AA contrast ratios in dark mode
   - Adjust text and UI element colors for accessibility
   - Accommodate users with light sensitivities

**Dark Mode Guidelines:**

- **Background**: Dark blue-gray (avoid pure black) - reduces eye strain
- **Cards**: Slightly lighter dark background - creates visual depth
- **Text**: Light gray/white for readability - maintains contrast
- **Borders**: Subtle dark borders - soft, not harsh
- **Primary**: Lighter blue for better visibility in dark mode
- **Shadows**: More subtle in dark mode - less prominent than light mode

**Theme Detection:**

```tsx
// Detect system preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Use next-themes for React
import { ThemeProvider } from 'next-themes';

<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {/* Your app */}
</ThemeProvider>
```

**Testing Dark Mode:**

- Test all components in both light and dark modes
- Verify contrast ratios meet WCAG standards
- Check readability of all text elements
- Ensure interactive elements are clearly visible
- Test with system preference detection

---

## RTL Support

### Arabic (RTL) Patterns

For Arabic content, we support right-to-left layout.

**HTML Direction:**

```tsx
<html lang="ar" dir="rtl">
```

**Logical Properties:**

Use logical properties for spacing that adapts to direction:

```tsx
// Instead of margin-left/right
<div className="ms-4">  {/* margin-inline-start */}
<div className="me-4">  {/* margin-inline-end */}

// Instead of padding-left/right
<div className="ps-4">  {/* padding-inline-start */}
<div className="pe-4">  {/* padding-inline-end */}
```

**Text Alignment:**

```tsx
<p className="text-right">  {/* RTL: right, LTR: left */}
<p className="text-left">   {/* RTL: left, LTR: right */}
```

**Icon Mirroring:**

For directional icons, mirror in RTL:

```tsx
<ArrowLeft className={isRTL ? 'rotate-180' : ''} />
```

**Font Configuration:**

Arabic uses Tajawal font:

```css
font-family: 'Tajawal', -apple-system, BlinkMacSystemFont, sans-serif;
```

**RTL Patterns:**

- Direction: `dir="rtl"` for Arabic
- Spacing: Logical properties (margin-inline, padding-inline)
- Icons: Mirror directional icons
- Text alignment: Right for Arabic, left for English

---

## Accessibility

### WCAG 2.1 AA Compliance

All components and patterns meet WCAG 2.1 AA standards.

**Color Contrast:**

- Text on background: Minimum 4.5:1 ratio
- Large text (18px+): Minimum 3:1 ratio
- Interactive elements: Clear focus states

**Focus States:**

All interactive elements have visible focus indicators:

```tsx
<Button className="focus:ring-2 focus:ring-primary focus:ring-offset-2">Button</Button>
```

**Keyboard Navigation:**

- All interactive elements are keyboard accessible
- Tab order follows logical flow
- Escape key closes modals/dropdowns
- Enter/Space activates buttons

**Screen Reader Support:**

- Semantic HTML elements
- ARIA labels where needed
- Alt text for images
- Proper heading hierarchy

**Example - Accessible Button:**

```tsx
<Button aria-label="Close dialog" onClick={handleClose} className="focus:ring-2 focus:ring-primary">
  <X className="h-4 w-4" />
</Button>
```

**Accessibility Checklist:**

- ✅ Color contrast ratios meet WCAG 2.1 AA
- ✅ All interactive elements keyboard accessible
- ✅ Clear focus indicators
- ✅ Semantic HTML structure
- ✅ ARIA labels for complex components
- ✅ Alt text for all images
- ✅ Proper heading hierarchy for SEO

---

## Animation & Transitions

### Tailwind Animate

We use `tailwindcss-animate` plugin for smooth transitions.

**Common Transitions:**

```tsx
// Hover shadow transition
<Card className="transition-shadow hover:shadow-md">

// Color transitions
<Button className="transition-colors hover:bg-primary/90">

// Opacity transitions
<div className="transition-opacity hover:opacity-80">
```

**Performance:**

- Use `transform` and `opacity` for animations (GPU-accelerated)
- Avoid animating `width`, `height`, `margin`, `padding`
- Keep animations under 300ms for responsiveness

**Example:**

```tsx
<Card
  className="
  transition-all
  duration-200
  hover:shadow-md
  hover:scale-[1.02]
"
>
  {/* Smooth hover effect */}
</Card>
```

**Animation Guidelines:**

- Keep animations subtle and professional
- Use transitions for hover states
- Avoid excessive animations
- Ensure animations don't cause motion sickness

---

## Monorepo Guidelines

### Package-Specific Rules

**Admin App (`admin/`):**

- Uses same design system
- Admin-specific components in `components/admin/`
- Dashboard-focused layouts
- Form-heavy interfaces

**Beta App (`beta/`):**

- Public-facing blog platform
- Card-based article layouts
- LinkedIn-inspired feed design
- RTL support for Arabic

**Home App (`home/`):**

- Fresh Next.js application
- Can use same design system
- Locale-based direction (RTL/LTR)

### Shared Components

All packages can use:

- shadcn/ui components (installed per package)
- Design tokens (via `globals.css`)
- Tailwind utilities

**Component Sharing:**

If components need to be shared:

1. Create in a shared package (future consideration)
2. Or duplicate with same implementation
3. Document any package-specific variations

---

## Official Documentation References

### Primary References

- **shadcn/ui**: https://ui.shadcn.com/docs

  - Component documentation
  - Installation guide
  - Theming guide

- **Tailwind CSS**: https://tailwindcss.com/docs

  - Utility classes
  - Configuration
  - Responsive design

- **Radix UI**: https://www.radix-ui.com/primitives

  - Base component primitives
  - Accessibility features
  - Component APIs

- **Lucide Icons**: https://lucide.dev
  - Icon library
  - Icon search
  - Usage examples

### Accessibility References

- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
  - Success criteria
  - Contrast requirements
  - Keyboard navigation

### Design Inspiration

- **LinkedIn Design**: Professional, calm, editorial aesthetic
  - Card-based layouts
  - Warm gray backgrounds
  - Subtle shadows
  - Clean typography

### LinkedIn Official Documentation

- **LinkedIn Brand Guidelines**: https://brand.linkedin.com/en-us
  - Logo usage and brand policies
  - Color schemes and brand assets
  - Acceptable brand practices

- **LinkedIn Logo Guidelines**: https://brand.linkedin.com/linkedin-logo/
  - Logo usage requirements
  - Spacing and placement guidelines
  - Color specifications

- **LinkedIn [in] Logo Guidelines**: https://brand.linkedin.com/in-logo
  - [in] logo usage for members
  - Hyperlink and business card usage
  - Email signature guidelines

- **LinkedIn Dark Mode Announcement**: https://www.linkedin.com/pulse/introducing-dark-mode-linkedin-night-day-difference-
  - Dark mode implementation insights
  - Design token system approach
  - Accessibility considerations

- **LinkedIn Branding & UX Guidelines (Verified Features)**: https://learn.microsoft.com/en-us/linkedin/consumer/integrations/verified-on-linkedin/branding-ux-guidelines
  - Verification badge usage
  - "Verify on LinkedIn" button guidelines
  - Consistent member experience standards

**Note**: While LinkedIn has shared insights into their design approach and dark mode implementation, they have not publicly released a complete design system documentation. Our design system is inspired by LinkedIn's visual patterns and best practices, adapted for our monorepo needs.

---

## Best Practices

### ✅ Do

- Use semantic HTML elements
- Follow the 8px grid system
- Use design tokens (CSS variables)
- Maintain consistent spacing
- Test in both light and dark modes
- Ensure keyboard accessibility
- Use proper heading hierarchy
- Add alt text to images
- Test RTL layouts for Arabic
- Use Tailwind utility classes
- Keep components under 200 lines
- Extract complex logic to helpers/hooks
- Use meaningful variable and function names
- Prefer composition over inheritance
- Write self-documenting code

### ❌ Don't

- Hardcode colors (use CSS variables)
- Use arbitrary spacing values
- Skip focus states
- Ignore contrast ratios
- Use inline styles
- Create custom components when shadcn/ui has one
- Break the 8px grid
- Use heavy shadows (keep them subtle)
- Use `any` types in TypeScript
- Use `require()` (use ES6 `import`)
- Put logic in global scope
- Skip error handling

---

## Code Examples

### Complete Card Component

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/articles/${article.slug}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        {article.image && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}
        <CardHeader>
          <CardTitle className="line-clamp-2 text-lg">{article.title}</CardTitle>
          {article.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{article.excerpt}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <Link href={`/clients/${article.clientSlug}`} className="hover:text-primary">
              {article.clientName}
            </Link>
            <span>{new Date(article.date).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

### Responsive Grid Layout

```tsx
<div className="container mx-auto max-w-[1128px] px-4 py-8">
  <h1 className="text-2xl font-semibold mb-6">Articles</h1>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {articles.map((article) => (
      <ArticleCard key={article.id} article={article} />
    ))}
  </div>
</div>
```

### Form Input with Validation

```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function EmailInput() {
  return (
    <div className="grid gap-2">
      <Label htmlFor="email">Email Address</Label>
      <Input
        id="email"
        type="email"
        placeholder="name@example.com"
        className="border-border focus:ring-primary"
      />
      <p className="text-xs text-muted-foreground">
        We'll never share your email with anyone else.
      </p>
    </div>
  );
}
```

### Button with Icon

```tsx
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function CreateButton() {
  return (
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Create New
    </Button>
  );
}
```

---

## Updates & Maintenance

This design system is a living document. When making changes:

1. Update this documentation
2. Update CSS variables in `globals.css`
3. Update Tailwind config if needed
4. Test across all packages (admin, beta, home)
5. Verify accessibility compliance
6. Test dark mode
7. Test RTL layouts

---

**Last Updated**: 2024
**Version**: 2.0.0
**Maintained By**: Modonty Development Team
