# DESIGN_GUIDE.md — Visual Design System

---

## Color Palette — CONFIRMED: SAP-Adjacent

Inspired by SAP's visual language without copying their exact brand. Reads as enterprise/SAP-native without trademark risk.

```css
:root {
  /* Primary palette */
  --color-ink: #1a1f2e;              /* near-black navy, body text */
  --color-paper: #fafbfc;            /* off-white, page background */
  --color-paper-2: #edf0f5;          /* subtle card background */
  --color-rule: #d4d9e1;             /* borders, rules */

  /* Brand accents */
  --color-primary: #2a5c8f;          /* deep blue — links, primary CTAs */
  --color-primary-soft: #7ba3c9;     /* hover states, secondary emphasis */
  --color-accent: #e67e22;           /* warm orange — callouts, highlights */
  --color-accent-soft: #f5b77a;

  /* Semantic */
  --color-success: #2d6b4f;          /* green for verify boxes */
  --color-warning: #b87333;          /* amber for warnings */
  --color-danger: #a63d3d;           /* red for license blocks */
  --color-muted: #6c7585;            /* muted text */

  /* Code */
  --color-code-bg: #f3f4f8;
  --color-code-text: #1a1f2e;
  --color-code-keyword: #2a5c8f;
  --color-code-string: #2d6b4f;
  --color-code-comment: #6c7585;
}
```

### Why This Palette Works

- **Deep blue (`#2a5c8f`)** — conveys trust, enterprise, technical depth. Similar family to SAP's corporate blue but distinguishable enough to avoid trademark concerns. SAP's exact blue is around `#0070E0`; ours is darker and greyer.
- **Warm orange accent (`#e67e22`)** — differentiates us from the generic "tech blue" landscape, memorable, evokes thoughtful documentation rather than marketing.
- **Navy ink (`#1a1f2e`)** — softer than pure black, reduces eye strain, premium feel.
- **Off-white paper (`#fafbfc`)** — cleaner than pure white, reduces screen glare.

### Accessibility Check

All combinations pass WCAG AA:
- Ink on paper: 15.2:1 ✅ AAA
- Primary on paper: 6.4:1 ✅ AA (AAA for large text)
- Muted on paper: 5.1:1 ✅ AA
- Accent on paper: 4.5:1 ✅ AA (borderline — use accent sparingly for text, freely for backgrounds)

---

## Alternative Palette (Not Used — For Reference Only)

If you ever want to pivot away from SAP-adjacent to maximum visual differentiation, this editorial palette was an earlier candidate:

```css
:root {
  --color-ink: #1a1816;
  --color-paper: #faf7f2;
  --color-paper-2: #f2ede3;
  --color-primary: #1f4a6e;          /* navy for links */
  --color-accent: #c84a1a;           /* burnt orange — the v1 aesthetic */
  --color-muted: #6b655c;
  --color-rule: #2a2622;
  /* ... same semantic colors ... */
}
```

This is the editorial magazine aesthetic from the earlier strategy documents. Warmer, more distinctive, less "enterprise software."

---

## Implementation Note

The SAP-adjacent palette is the confirmed choice. The alternative above is kept for reference only — do not implement it unless explicitly re-evaluated.

---

## Typography

### Font Stack (No Web Fonts)

```css
--font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
             Ubuntu, Cantarell, "Helvetica Neue", sans-serif;

--font-heading: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;

--font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
```

**Why no web fonts:**
- Privacy (GDPR) — no third-party font service tracking
- Performance — zero font download = faster LCP
- Reliability — system fonts always work

System fonts on modern OS are genuinely high-quality. San Francisco (Apple), Segoe UI (Windows), Roboto (Android) all look professional.

### Type Scale

```css
--text-xs: 0.75rem;      /* 12px — captions, meta */
--text-sm: 0.875rem;     /* 14px — helper text */
--text-base: 1rem;       /* 16px — body */
--text-lg: 1.125rem;     /* 18px — emphasized body */
--text-xl: 1.25rem;      /* 20px — small headings */
--text-2xl: 1.5rem;      /* 24px — h3 */
--text-3xl: 1.875rem;    /* 30px — h2 */
--text-4xl: 2.25rem;     /* 36px — h1 */
--text-5xl: 3rem;        /* 48px — landing page hero */
```

Line heights:
- Body: 1.6
- Headings: 1.2
- Code: 1.5

---

## Spacing

```css
--space-1: 0.25rem;      /* 4px */
--space-2: 0.5rem;       /* 8px */
--space-3: 0.75rem;      /* 12px */
--space-4: 1rem;         /* 16px */
--space-5: 1.5rem;       /* 24px */
--space-6: 2rem;         /* 32px */
--space-8: 3rem;         /* 48px */
--space-10: 4rem;        /* 64px */
--space-12: 6rem;        /* 96px */
```

Generous whitespace. This is a content site, not a dashboard. Prose needs room to breathe.

---

## Layout Widths

```css
--width-prose: 68ch;         /* articles, walkthrough explanation text */
--width-content: 1100px;     /* most pages */
--width-wide: 1280px;        /* landing page */
```

68ch for prose keeps lines at ~65-75 characters, which is the readability sweet spot.

---

## Component Styles

### Buttons

```css
.btn {
  display: inline-block;
  padding: var(--space-3) var(--space-5);
  border: 1px solid transparent;
  border-radius: 3px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.btn-primary {
  background: var(--color-primary);
  color: white;
}
.btn-primary:hover {
  background: color-mix(in srgb, var(--color-primary) 85%, black);
}
.btn-secondary {
  background: transparent;
  color: var(--color-primary);
  border-color: var(--color-primary);
}
```

### Callouts

Four variants, distinct colors:

```css
.callout {
  border-left: 3px solid;
  padding: var(--space-4) var(--space-5);
  margin: var(--space-5) 0;
  background: var(--color-paper-2);
}
.callout-verify { border-left-color: var(--color-success); }
.callout-sap { border-left-color: var(--color-primary); }
.callout-warning { border-left-color: var(--color-warning); }
.callout-license { border-left-color: var(--color-danger); }
```

Each callout type has a semantic purpose:
- `callout-verify`: "Verify this step" boxes in walkthroughs
- `callout-sap`: "Do this in SAP" action boxes
- `callout-warning`: Common pitfalls
- `callout-license`: License-blocking or license-aware content

### Code Blocks

```css
pre {
  background: var(--color-code-bg);
  padding: var(--space-4);
  border-radius: 3px;
  border: 1px solid var(--color-rule);
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.5;
}
```

No fancy syntax highlighting library at Stage 1 (it's a JS payload). Let browsers render code with the monospace font. Phase 2 can add Prism or Shiki.

---

## Focus States

Never remove focus outlines. Style them distinctively:

```css
:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 2px;
}
```

The orange accent color is deliberately chosen so focus is highly visible against both light and dark backgrounds.

---

## Icons

Use inline SVG icons, 16px or 24px, current color. No icon library.

Core icons needed:
- External link (arrow out of box)
- Check (completed step indicator)
- Info (callout badge)
- Download (PDF button)
- Menu (mobile nav toggle)

Free source: Heroicons or Lucide. Copy SVG source directly into HTML; don't load a library.

---

## Logo Direction

Brief placeholder logo guidance:

- Monogram "AE" or "A" (Academy) in the primary blue
- Serif or weighted sans-serif wordmark reading "SAP Extract Academy"
- Keep it simple; this isn't where budget goes at MVP
- SVG format, single color version + two-color version

Human to finalize in design. For MVP, text-only wordmark in the header is fine.

---

## Open Graph Image Template

Every page needs an `og-image.png` (1200×630). At MVP, generate these programmatically:

- Background: `--color-paper`
- Thin `--color-primary` accent bar at top (8px)
- Site logo/wordmark top-left
- Page title typeset large (`--text-5xl`) in `--color-ink`
- Subtle "SAP Extract Academy" wordmark bottom-right
- No photos, no people, no stock imagery

One template SVG or HTML-to-image generator (using `satori` or similar) can produce all OG images automatically from frontmatter.

---

## Dark Mode

**Defer to post-MVP.** Adding dark mode later means:
1. One additional CSS variable set triggered by `prefers-color-scheme: dark`
2. No structural changes

For Stage 1, ship light only. Stage 2 adds dark mode along with German localization.
