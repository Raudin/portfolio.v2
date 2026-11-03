# Design System Context

## Aesthetic & Tone
- **Brutalist Dark Minimal**: High-contrast, utilitarian, developer-focused aesthetic.
- Monochromatic foundation (`#121212` background, `#f0f0f0` / `#ffffff` primary text, `#7d7d7d` secondary meta text).
- Geometric layout grids, fine border delimiters, and monospace tabular data.

## Typography
- **Primary Face**: `JetBrains Mono`, monospace (replaces generic Inter to impart distinctive technical character).
- **Scale**:
  - Hero Title: clamp(2.2rem, 5vw, 4rem), weight 700.
  - Section Headings: 1.5rem (24px), uppercase, letter-spacing 0.08em, weight 700.
  - Subheadings / Roles: 1.15rem (18.4px), weight 600.
  - Body Text: 1rem (16px), line-height 1.6, weight 400.
  - Meta / Tags / Header nav: 0.82rem (13.1px) to 0.875rem (14px), uppercase/mono, weight 500-600.

## Color Palette
- Background Primary: `#121212`
- Card Surface: `#171717` (hover: `#1d1d1d`)
- Primary Text: `#f0f0f0` / `#ffffff`
- Muted / Secondary Text: `#7d7d7d` (compliant with WCAG AA 4.5:1 on `#121212`)
- Border Colors: `rgba(255, 255, 255, 0.12)` (focus / hover: `rgba(255, 255, 255, 0.35)`)
- Accent / Invert: `#ffffff` background with `#000000` text for primary CTAs and interactive highlights.

## Motion & Interactivity
- GSAP driven smooth expand/collapse for project items.
- Kinetic cursor scramble effects for name elements.
- Accessible `:focus-visible` outlines with 2px offset.
- `prefers-reduced-motion` considerations implemented across animations.
