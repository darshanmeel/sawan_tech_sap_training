# SKILL: Accessibility

Use this skill on every user-facing component and page. WCAG 2.1 AA minimum.

---

## Semantic HTML First

Before reaching for ARIA, use the right element:

| Use | Not |
|---|---|
| `<button>` | `<div onclick>` |
| `<a href>` | `<span onclick>` |
| `<nav>` | `<div class="nav">` |
| `<main>` | `<div id="main">` |
| `<article>` | `<div class="article">` |
| `<aside>` | `<div class="sidebar">` |
| `<header>` / `<footer>` | `<div class="header">` |
| `<h1>` to `<h6>` in order | Skipping levels |

Native elements come with keyboard nav, focus handling, screen reader support.

---

## Required Features

### Skip to Content Link

First element after `<body>`:

```html
<a href="#main" class="skip-link">Skip to content</a>
```

CSS:

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  padding: 0.5rem 1rem;
  background: var(--color-ink);
  color: var(--color-paper);
  z-index: 100;
}
.skip-link:focus { top: 0; }
```

Target `<main id="main">`.

### Focus Styles

Never remove focus outlines. Style them:

```css
:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 2px;
}
```

Use `:focus-visible` (not `:focus`) so mouse clicks don't show focus rings but keyboard navigation does.

### Color Contrast

- Body text: 7:1 preferred (AAA), 4.5:1 minimum (AA)
- Large text (18pt+ or 14pt bold+): 4.5:1 preferred
- Interactive borders: 3:1 minimum

Verify with [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).

Palette check:
- `#1a1816` on `#faf7f2` → ~18:1 (body) ✓
- `#c84a1a` on `#faf7f2` → ~4.8:1 (links, AA)
- `#6b655c` on `#faf7f2` → ~4.6:1 (muted, AA)

### Form Labels

Every input has a label:

```html
<label for="email-input">Email address</label>
<input id="email-input" type="email" name="email" required />
```

For groups, use `<fieldset>` and `<legend>`:

```html
<fieldset>
  <legend>Audience level</legend>
  <label><input type="radio" name="level" value="beginner" /> Beginner</label>
  <label><input type="radio" name="level" value="intermediate" /> Intermediate</label>
  <label><input type="radio" name="level" value="expert" /> Expert</label>
</fieldset>
```

### Alt Text

Every `<img>` has `alt`:
- Informative: describe content
- Decorative: `alt=""` (empty, not omitted)

### Interactive Element Names

Buttons/links have discernible names, prefer visible text:

```html
<!-- Good -->
<button>Subscribe</button>

<!-- Acceptable for icon-only -->
<button aria-label="Close dialog">
  <svg aria-hidden="true"><!-- icon --></svg>
</button>

<!-- Bad -->
<button><svg></svg></button>
```

### Heading Hierarchy

One `<h1>` per page. No skipping levels:

```html
<h1>Walkthrough: Extract ACDOCA</h1>
  <h2>Prerequisites</h2>
  <h2>Step 1: Check for released CDS view</h2>
    <h3>Do this in SAP</h3>
    <h3>Verify</h3>
```

### Language

`<html lang="en">` on every page. For German (Stage 2): `lang="de"`.

### Keyboard Navigation

Every interactive element reachable via Tab. Order matches visual reading order. Test: unplug mouse, navigate with Tab, Shift+Tab, Enter, Arrow keys.

Common failures:
- Custom checkboxes as `<div>` instead of `<input type="checkbox">`
- Modals not trapping focus
- Dropdowns not opening with Enter/Space

---

## Component-Specific

### Walkthrough Checklist

- Use `<ol>` for step list
- Each checkbox is real `<input type="checkbox">` with associated `<label>`
- Progress in `role="status" aria-live="polite"`:

```html
<div role="status" aria-live="polite">
  3 of 12 steps complete
</div>
```

### Glossary Links

Use plain anchor links to glossary pages:

```html
<a href="/glossary/odp/" class="term-link">ODP</a>
```

Don't build tooltips at Stage 1 — adds JS, accessibility complexity. The dedicated glossary pages are more accessible, more SEO-friendly, and work without JS.

### External Link Indicators

```html
<a href={sapHelpUrl} target="_blank" rel="noopener noreferrer">
  ODQMON documentation
  <svg aria-hidden="true" class="external-icon"><!-- icon --></svg>
  <span class="sr-only">(opens in new tab)</span>
</a>
```

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## Per-Page Manual Test Checklist

- [ ] Tab through every interactive element; focus visible
- [ ] Can reach all content with keyboard alone
- [ ] Every image has alt text (empty for decorative)
- [ ] Every form input has a label
- [ ] Exactly one `<h1>`
- [ ] Heading hierarchy logical
- [ ] `<html lang>` set
- [ ] Color contrast passes on any custom combos
- [ ] Screen reader announces page title and main content
- [ ] External links indicate they open externally
- [ ] Skip link works

---

## Common Mistakes

### Color Alone

Bad: "Required fields shown in red."
Good: Red + asterisk + `aria-required="true"` on input.

### Placeholder as Label

Wrong:

```html
<input type="email" placeholder="Email address" />
```

Placeholder disappears when typing. Always real `<label>`.

### Accessible Name != Visible Name

If button says "Learn more" but `aria-label="Learn more about ACDOCA walkthrough"`, voice users saying "click learn more" may fail because voice matches visible text.

Rule: `aria-label` starts with or equals visible text.

### Over-Reliance on ARIA

First choice: semantic HTML. Second: ARIA to fill gaps. Incorrect ARIA is worse than no ARIA.
