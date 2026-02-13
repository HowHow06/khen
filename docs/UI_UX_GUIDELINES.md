# UI/UX Design Guidelines

This document outlines the design principles, patterns, and conventions used in the Khen Tool Suite. Follow these guidelines to maintain visual consistency across the application.

---

## Design Philosophy

Khen follows a **"Modern Elegance"** design approach:

- **Clean & Uncluttered**: Generous whitespace, clear visual hierarchy
- **Professional yet Warm**: Suitable for worship teams while maintaining a polished feel
- **Accessible**: High contrast, readable typography, clear interactive states
- **Responsive**: Mobile-first approach with graceful scaling

---

## Typography

### Font Stack

| Purpose | Font | Fallback |
|---------|------|----------|
| Display/Headings | Playfair Display | Georgia, serif |
| Body/UI | DM Sans | system-ui, sans-serif |
| Code/Monospace | JetBrains Mono | Fira Code, Cascadia Code, monospace |

### Usage

```tsx
// Headings (h1, h2, h3) automatically use Playfair Display via CSS
<h1 className="text-4xl font-bold tracking-tight">Page Title</h1>

// Body text uses DM Sans by default
<p className="text-muted-foreground">Description text</p>

// For explicit display font usage
<span className="font-display text-xl font-semibold">Khen</span>
```

### Scale

| Element | Desktop | Mobile |
|---------|---------|--------|
| Page Title (h1) | `text-5xl` to `text-6xl` | `text-4xl` |
| Section Title (h2) | `text-xl` to `text-2xl` | `text-xl` |
| Body | `text-base` | `text-sm` to `text-base` |
| Small/Caption | `text-sm` or `text-xs` | `text-xs` |

### Tracking

- Headings: `tracking-tight` (-0.025em)
- Body: Default tracking
- All caps/labels: `tracking-wide` if needed

---

## Color System

We use CSS custom properties for theming. **Do not hardcode colors** — always use the semantic variables.

### Semantic Colors

```css
/* Primary surfaces */
--background       /* Main background */
--foreground       /* Primary text */
--card             /* Card backgrounds */
--card-foreground  /* Card text */

/* Interactive */
--primary          /* Primary actions, links */
--primary-foreground
--secondary        /* Secondary actions */
--secondary-foreground

/* Utility */
--muted            /* Subdued backgrounds */
--muted-foreground /* Secondary text, placeholders */
--accent           /* Hover states, highlights */
--border           /* Borders, dividers */
--ring             /* Focus rings */

/* Feedback */
--destructive      /* Errors, delete actions */
```

### Usage Examples

```tsx
// Correct - uses semantic colors
<div className="bg-background text-foreground" />
<p className="text-muted-foreground" />
<button className="bg-primary text-primary-foreground" />

// Incorrect - hardcoded colors
<div className="bg-white text-black" />  // ❌ Won't work in dark mode
```

### Opacity Modifiers

Use Tailwind's opacity modifiers for subtle variations:

```tsx
<div className="bg-primary/10" />     // 10% opacity primary
<div className="bg-muted/30" />       // 30% opacity muted
<div className="border-border/50" />  // 50% opacity border
```

---

## Spacing & Layout

### Container

Use the `<Container>` component for consistent max-width and padding:

```tsx
import Container from "@/components/ui/container";

<Container className="py-12">
  {/* Content */}
</Container>
```

- Max width: `max-w-6xl` (72rem)
- Horizontal padding: `px-6` → `sm:px-8` → `lg:px-12`

### Section Spacing

| Context | Vertical Spacing |
|---------|-----------------|
| Page sections | `py-12` to `py-16` (desktop: `lg:py-20`) |
| Between cards | `space-y-8` |
| Within cards | `p-6` |
| Between form fields | `space-y-4` or `gap-4` |

### Card Pattern

For major content sections, use the card pattern:

```tsx
<section className="rounded-2xl border bg-card/50 p-6 shadow-sm transition-all hover:shadow-md">
  <div className="mb-5 flex items-center gap-3">
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
      1
    </span>
    <h2 className="text-xl font-semibold tracking-tight">Section Title</h2>
  </div>
  {/* Content */}
</section>
```

---

## Components

### Buttons

Use consistent button sizing and variants:

```tsx
// Primary action
<Button size="lg" className="gap-2 px-8">
  <Icon className="h-4 w-4" />
  Primary Action
</Button>

// Secondary/outline
<Button variant="outline" className="gap-2">
  <Icon className="h-4 w-4" />
  Secondary
</Button>

// Icon-only
<Button variant="ghost" size="icon" className="h-9 w-9">
  <Icon className="h-4 w-4" />
</Button>
```

### Toolbars

Group related actions in styled toolbars:

```tsx
<div className="flex flex-wrap items-center gap-1.5 rounded-lg border bg-muted/30 p-1.5">
  <Button variant="ghost" size="sm">Action 1</Button>
  <Button variant="ghost" size="sm">Action 2</Button>
  <div className="mx-1 h-6 w-px bg-border" />  {/* Separator */}
  <Button variant="ghost" size="sm">Action 3</Button>
</div>
```

### Form Fields

```tsx
<Textarea
  className="min-h-72 resize-y border-2 focus-visible:ring-1"
  placeholder="Descriptive placeholder..."
/>
```

### Badges/Pills

```tsx
// Info badge
<div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm backdrop-blur-sm">
  <Icon className="h-4 w-4 text-primary" />
  <span className="text-muted-foreground">Badge text</span>
</div>

// Status badge
<span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400">
  <Check className="h-3 w-3" />
  Valid
</span>
```

---

## Visual Effects

### Glass/Blur Effect

For overlays and sticky elements:

```tsx
<header className="sticky top-0 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
```

### Shadows

| Context | Class |
|---------|-------|
| Cards (default) | `shadow-sm` |
| Cards (hover) | `hover:shadow-md` or `hover:shadow-lg` |
| Elevated elements | `shadow-lg` |
| CTAs | `shadow-lg hover:shadow-xl` |

### Background Patterns

Subtle dot pattern for hero sections:

```tsx
<div
  className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
  style={{
    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
    backgroundSize: "32px 32px",
  }}
/>
```

### Gradient Text

```tsx
<span className="text-gradient">Gradient Text</span>

// CSS utility class defined in globals.css:
.text-gradient {
  @apply bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent;
}
```

---

## Animation & Transitions

### Standard Transitions

```tsx
// Color/background transitions (automatic via globals.css)
// All elements transition background-color and border-color over 200ms

// Interactive hover
<div className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" />

// Button hover
<Button className="transition-all hover:shadow-xl" />
```

### Utility Classes

```css
.card-hover {
  @apply transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg;
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out forwards;
}
```

### Staggered Animations

For lists or multiple elements:

```tsx
<div className="animate-fade-in delay-100">Item 1</div>
<div className="animate-fade-in delay-200">Item 2</div>
<div className="animate-fade-in delay-300">Item 3</div>
```

---

## Icons

Use **Lucide React** icons consistently:

```tsx
import { Settings, Download, Sparkles } from "lucide-react";

// Standard sizes
<Icon className="h-4 w-4" />   // In buttons, inline
<Icon className="h-5 w-5" />   // Standalone, navigation
<Icon className="h-6 w-6" />   // Feature icons, large contexts
```

### Icon + Text Alignment

```tsx
<Button className="gap-2">
  <Icon className="h-4 w-4" />
  Button Text
</Button>
```

---

## Responsive Design

### Breakpoint Strategy

| Breakpoint | Width | Usage |
|------------|-------|-------|
| Default | < 640px | Mobile |
| `sm:` | ≥ 640px | Large phones, small tablets |
| `md:` | ≥ 768px | Tablets |
| `lg:` | ≥ 1024px | Laptops, desktops |
| `xl:` | ≥ 1280px | Large desktops |

### Common Patterns

```tsx
// Responsive text sizing
<h1 className="text-4xl md:text-5xl lg:text-6xl">

// Stack to row
<div className="flex flex-col gap-4 sm:flex-row">

// Responsive padding
<Container className="py-12 lg:py-16">

// Hide on mobile
<div className="hidden md:block">

// Mobile-only
<div className="block md:hidden">
```

### Flex Wrapping

Always allow buttons and toolbars to wrap:

```tsx
<div className="flex flex-wrap items-center gap-2">
  {/* Buttons will wrap on small screens */}
</div>
```

---

## Dark Mode

Dark mode is handled automatically via `next-themes`. Always use semantic color variables.

### Testing

- Test all new components in both light and dark modes
- Ensure sufficient contrast in both themes
- Check hover/focus states in both themes

### Special Cases

When you need theme-specific opacity:

```tsx
<div className="opacity-[0.015] dark:opacity-[0.03]" />
```

---

## Accessibility

### Focus States

All interactive elements must have visible focus states:

```tsx
<Button className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
```

### ARIA Labels

```tsx
<Button aria-label="Open settings">
  <Settings className="h-4 w-4" />
</Button>

<Sheet>
  <SheetTitle className="sr-only">Settings Panel</SheetTitle>
</Sheet>
```

### Color Contrast

- Text on backgrounds: Minimum 4.5:1 contrast ratio
- Large text (18px+): Minimum 3:1 contrast ratio
- Use `text-muted-foreground` sparingly for secondary content

---

## File Organization

```
components/
├── ui/                    # shadcn/ui base components
├── layout/                # Header, Footer, Container
├── ppt-generator/         # Feature-specific components
│   └── settings/          # Settings panel components
└── context/               # React Context providers
```

### Naming Conventions

- Components: PascalCase (`PptGeneratorSettings.tsx`)
- Utilities: camelCase (`settings-generator.ts`)
- Constants: SCREAMING_SNAKE_CASE (`SETTING_CATEGORY`)

---

## Quick Reference

### Do's ✓

- Use semantic color variables
- Use the `<Container>` component for page content
- Include `gap` or `space-*` for consistent spacing
- Add `transition-all` for interactive elements
- Test in both light and dark modes
- Use `flex-wrap` for button groups

### Don'ts ✗

- Don't hardcode colors (`bg-white`, `text-black`)
- Don't use fixed widths that break responsiveness
- Don't forget hover/focus states
- Don't skip accessibility labels on icon-only buttons
- Don't use arbitrary spacing values when Tailwind scale works

---

## Example: New Section Component

```tsx
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const NewFeatureSection = () => {
  return (
    <section className="rounded-2xl border bg-card/50 p-6 shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          <Sparkles className="h-4 w-4" />
        </span>
        <h2 className="text-xl font-semibold tracking-tight">New Feature</h2>
      </div>

      {/* Content */}
      <p className="mb-4 text-muted-foreground">
        Description of the feature goes here.
      </p>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button className="gap-2">
          <Sparkles className="h-4 w-4" />
          Primary Action
        </Button>
        <Button variant="outline">Secondary</Button>
      </div>
    </section>
  );
};
```

---

*Last updated: February 2026*
