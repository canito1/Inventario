# copilot DESIGN.md

> Auto-generated design system — reverse-engineered via static analysis by skillui.
> Frameworks: None detected
> Colors: 20 · Fonts: 2 · Components: 7
> Icon library: not detected · State: not detected
> Primary theme: dark · Dark mode toggle: no · Motion: expressive

## Visual Reference

**Match this design exactly** — study colors, fonts, spacing, and component shapes before writing any UI code.

![copilot Homepage](../screenshots/homepage.png)

---

## 1. Visual Theme & Atmosphere

This is a **dark-themed** interface with a flat, warm visual language. Elevation is achieved through color and border shifts rather than shadows — a clean, industrial aesthetic. Typography pairs **Ginto** for display/headings with **GintoNord** for body text, creating clear visual hierarchy through type contrast. Spacing follows a **4px base grid** (compact density), with scale: 2, 4, 6, 8, 10, 12, 14, 16px. The accent color **#ffb4ad** anchors interactive elements (buttons, links, focus rings). Motion is expressive — spring physics, layout animations, and staggered reveals are part of the visual language.

---

## 2. Color Palette & Roles

| Token | Hex | Role | Use |
|---|---|---|---|
| tw-ring-color | `#000000` | background | Page background, darkest surface |
| surface | `#1c2437` | surface | Card and panel backgrounds |
| tw-ring-offset-color | `#ffffff` | text-primary | Headings and body text |
| text-muted | `#323f60` | text-muted | Captions, placeholders, secondary info |
| border | `#3b3b3b` | border | Dividers, card borders, outlines |
| accent | `#ffb4ad` | accent | CTAs, links, focus rings, active states |
| tw-ring-color | `#ac1922` | danger | Error states, destructive actions |
| success | `#01712b` | success | Success states, positive indicators |
| warning | `#f3c357` | warning | Warning states, caution indicators |
| info | `#e5ebfa` | info | Informational highlights |
| unknown | `#c7c7c7` | unknown | Palette color |
| unknown | `#f2f2f2` | unknown | Palette color |
| unknown | `#262626` | unknown | Palette color |
| unknown | `#f98880` | unknown | Palette color |
| unknown | `#97abea` | unknown | Palette color |
| unknown | `#121212` | unknown | Palette color |
| unknown | `#6cc57b` | unknown | Palette color |
| unknown | `#9da8d9` | unknown | Palette color |
| unknown | `#333a4e` | unknown | Palette color |
| unknown | `#9d1920` | unknown | Palette color |

### CSS Variable Tokens

```css
--tw-border-spacing-x: 0;
--tw-border-spacing-y: 0;
--tw-border-spacing-x: 0;
--tw-border-spacing-y: 0;
--tw-border-spacing-x: 0px;
--tw-border-spacing-y: 0px;
--tw-border-opacity: 1;
--tw-border-opacity: 1;
--tw-border-spacing-x: 0px;
--tw-border-spacing-y: 0px;
--tw-border-opacity: 1;
--tw-border-opacity: 1;
--tw-border-opacity: 1;
--tw-border-opacity: 1;
--tw-border-opacity: 1;
--tw-border-opacity: 1;
--tw-border-opacity: 1;
--tw-border-opacity: 1;
--tw-border-opacity: 1;
--tw-border-opacity: 1;
```


---

## 3. Typography Rules

**Font Stack:**
- **GintoNord** — Heading 1, Heading 2, Heading 3
- **Ginto** — Body, Caption

**Font Sources:**

```css
@font-face {
  font-family: "Ginto";
  src: url("https://copilot.microsoft.com/static/cmc/fonts/Ginto-Copilot-Upright-Variable.woff2") format("woff2");
  font-weight: 400;
}
@font-face {
  font-family: "GintoNord";
  src: url("https://copilot.microsoft.com/static/cmc/fonts/Ginto-Copilot-Nord-Upright-Variable.woff2") format("woff2");
  font-weight: 400;
}
@font-face {
  font-family: "CascadiaCode";
  src: url("https://copilot.microsoft.com/static/cmc/fonts/CascadiaCode.woff2") format("woff2");
  font-weight: 400;
}
@font-face {
  font-family: "Georgia Pro";
  src: url("https://copilot.microsoft.com/static/cmc/fonts/GeorgiaPro-Regular.woff2") format("woff2");
  font-weight: 400;
}
@font-face {
  font-family: "Georgia Pro";
  src: url("https://copilot.microsoft.com/static/cmc/fonts/GeorgiaPro-Bold.woff2") format("woff2");
  font-weight: 700;
}
```

| Role | Font | Size | Weight |
|---|---|---|---|
| Heading 1 | GintoNord | 80px | 700 |
| Heading 2 | GintoNord | 60px | 700 |
| Heading 3 | GintoNord | 52px | 700 |
| Body | Ginto | .875rem | 400 |
| Caption | Ginto | 1.25rem | 400 |

**Typographic Rules:**
- Limit to 2 font families max per screen
- Use **GintoNord** for body/UI text, **Ginto** for display/headings
- Maintain consistent hierarchy: no more than 3-4 font sizes per screen
- Headings use bold (600-700), body uses regular (400)
- Line height: 1.5 for body text, 1.2 for headings
- Use color and opacity for secondary hierarchy, not additional font sizes


---

## 4. Component Stylings

### Layout (1)

**Footer** — `html`

### Navigation (1)

**Navigation** — `html`

### Data Display (1)

**List** — `html`

### Data Input (2)

**Button** — `html`

**Input** — `html`
- State: :focus, :placeholder

### Media (2)

**Image** — `html`

**Icon** — `html`



---

## 5. Layout Principles

- **Base spacing unit:** 4px
- **Spacing scale:** 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24
- **Border radius:** .125rem, .25rem, .375rem, .5rem, .625rem, .75rem, 1rem, 1px, 1.25rem, 1.5rem, 1.75rem, 2rem, 2.25rem, 3rem, 4rem, 4px, 7px, 8px, 8.5px, 10px, 12px, 14px, 16px, 18px, 20px, 20%, 24px, 26px, 28px, 32px, 36px, 40px, 48px, 60px, inherit
- **Max content width:** 1060px

**Spacing as Meaning:**
| Spacing | Use |
|---|---|
| 4-8px | Tight: related items within a group |
| 12-16px | Medium: between groups |
| 24-32px | Wide: between sections |
| 48px+ | Vast: major section breaks |


---

## 6. Depth & Elevation

No box-shadow values detected. The design uses a **flat visual style** — elevation is conveyed through background color shifts and borders rather than shadows.

**Elevation Strategy:**
| Level | Technique | Use |
|---|---|---|
| 0 — Base | Background color | Page background |
| 1 — Raised | Lighter surface + subtle border | Cards, panels |
| 2 — Floating | Even lighter surface + stronger border | Dropdowns, popovers |
| 3 — Overlay | Backdrop + modal surface | Modals, dialogs |

**Z-Index Scale:** `0, 1, 5, 10, 20, 30, 35, 40, 50, 60, 70, 80, 100`


---

## 7. Animation & Motion

This project uses **expressive motion**. Animations are an integral part of the experience.

### CSS Animations

- `@keyframes scroll-fade`
- `@keyframes scroll-fade-x-end`
- `@keyframes bounce-in`
- `@keyframes shimmer`
- `@keyframes caret-blink`
- `@keyframes dotBounce`
- `@keyframes dotPulse`
- `@keyframes fade-in`

### Motion Guidelines

- Duration: 150-300ms for micro-interactions, 300-500ms for page transitions
- Easing: `ease-out` for enters, `ease-in` for exits
- Always respect `prefers-reduced-motion`


---

## 8. Do's and Don'ts

### Do's

- Use `#ffb4ad` for interactive elements (buttons, links, focus rings)
- Use `#000000` as the primary page background
- Pair **GintoNord** (body) with **Ginto** (display) — these are the only allowed fonts
- Follow the **4px** spacing grid for all margins, padding, and gaps
- Use border and background shifts for elevation — not shadows
- Use border-radius from the scale: .125rem, .25rem, .375rem, .5rem, .625rem
- Reuse existing components from Section 4 before creating new ones

### Don'ts

- Don't introduce colors outside this palette — extend the design tokens first
- Don't introduce additional font families beyond GintoNord and Ginto
- Don't use arbitrary spacing values — stick to multiples of 4px
- Don't add box-shadow — this design system uses flat elevation
- Don't use arbitrary border-radius values — pick from the defined scale
- Don't duplicate component patterns — check Section 4 first
- Don't use backdrop-blur or blur effects

### Anti-Patterns (detected from codebase)

- No box-shadow on any element
- No blur or backdrop-blur effects
- No zebra striping on tables/lists


---

## 9. Responsive Behavior

| Name | Value | Source |
|---|---|---|
| sm | 32rem | css |
| xs | 360px | css |
| xs | 400px | css |
| xs | 480px | css |
| sm | 600px | css |
| sm | 640px | css |
| md | 768px | css |
| lg | 960px | css |
| lg | 1024px | css |
| xl | 1058px | css |
| xl | 1280px | css |
| 2xl | 1380px | css |
| 2xl | 1536px | css |
| 2xl | 1920px | css |

**Approach:** Use `@media (min-width: ...)` queries matching the breakpoints above.


---

## 10. Agent Prompt Guide

Use these as starting points when building new UI:

### Build a Card

```
Background: #1c2437
Border: 1px solid #3b3b3b
Radius: 8px
Padding: 16px
Font: GintoNord
No shadows — use borders and surface colors for depth.
```

### Build a Button

```
Primary: bg #ffb4ad, text white
Ghost: bg transparent, border #3b3b3b
Padding: 8px 16px
Radius: 8px
Hover: opacity 0.9 or lighter shade
Focus: ring with #ffb4ad
```

### Build a Page Layout

```
Background: #000000
Max-width: 1060px, centered
Grid: 4px base
Responsive: mobile-first, breakpoints from Section 9
```

### Build a Stats Card

```
Surface: #1c2437
Label: #323f60 (muted, 12px, uppercase)
Value: #ffffff (primary, 24-32px, bold)
Status: use success/warning/danger from Section 2
```

### Build a Form

```
Input bg: #000000
Input border: 1px solid #3b3b3b
Focus: border-color #ffb4ad
Label: #323f60 12px
Spacing: 16px between fields
Radius: 8px
```

### General Component

```
1. Read DESIGN.md Sections 2-6 for tokens
2. Colors: only from palette
3. Font: GintoNord, type scale from Section 3
4. Spacing: 4px grid
5. Components: match patterns from Section 4
6. Elevation: flat, surface shifts
```
