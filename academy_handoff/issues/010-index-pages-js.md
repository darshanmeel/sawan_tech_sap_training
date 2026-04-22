# ISSUE-010: Index Pages and Client JS

**Phase:** Core Pages
**Estimated Effort:** 3-4 hours
**Depends on:** ISSUE-004, ISSUE-005, ISSUE-006, ISSUE-007, ISSUE-008
**Skill files:** `SKILLS/stage1-static-html.md`, `SKILLS/accessibility.md`

---

## Goal

Build the three index pages and the single JS file for checklist + PDF download.

---

## Pages

### Tables Index (`docs/tables/index.html`)

Grid of 5 cards, one per table. Each card:
- Table code (VBAK)
- Business name
- Module
- Volume badge
- Level badges
- "View walkthroughs" link

Use `templates/list.html` with table cards.

### Glossary Index (`docs/glossary/index.html`)

Alphabetical list of all 32 terms. Each list item:
- Term + full name
- 1-sentence short definition
- Link to term page

Use `templates/list.html`.

### Articles Index (`docs/articles/index.html`)

3 cards, one per article:
- Title
- Description
- Publish date, reading time
- "Read article" link

---

## Client JavaScript

Single file: `docs/assets/js/checklist.js`

### Features

1. **Checklist persistence**
   - On walkthrough page load, read `localStorage.sapExtractAcademy.checklist`
   - For each step checkbox, set checked state from storage
   - On checkbox change, update storage
   - Update progress indicator ("3 of 12 complete") reactively
   - Handle localStorage errors gracefully (quota exceeded, disabled, etc.)

2. **Reset progress**
   - Reset button clears the current walkthrough's entry in storage
   - Confirm dialog before clearing ("This clears your progress for this walkthrough. Continue?")

3. **PDF download**
   - Button generates a PDF of the walkthrough's completed steps
   - Approach: use `window.print()` with a CSS print stylesheet that only prints completed steps
   - Alternative: include `jspdf` via CDN if print approach is insufficient

4. **Email form enhancement**
   - Intercept form submit, post via `fetch`, show success message inline
   - Fallback to native form submission if JS fails

### Size Target

Entire JS file under 5KB minified. No frameworks. Vanilla ES modules.

### Progressive Enhancement

The site must work without JS:
- Checkboxes render but don't persist (acceptable)
- PDF button hidden via `[hidden]` attribute, JS removes it
- Email form uses native POST to Buttondown

---

## CSS Print Stylesheet

Add to `main.css`:

```css
@media print {
  /* Hide everything except walkthrough content */
  header, footer, aside, nav, .email-form, .btn { display: none; }
  
  /* Only print completed steps */
  .step:not(.completed) { display: none; }
  
  /* Reset colors for print */
  body { background: white; color: black; }
  
  /* Force page breaks between sections */
  .step { page-break-inside: avoid; }
}
```

Apply `.completed` class via JS based on checkbox state.

---

## Acceptance Criteria

- [ ] All 3 index pages render correctly
- [ ] Checklist JS works: checkbox state persists across refresh
- [ ] Progress indicator updates reactively
- [ ] Reset button clears progress after confirm
- [ ] Print-to-PDF produces clean output with only completed steps
- [ ] Site functional without JS (checkboxes render, links work, email form submits natively)
- [ ] JS file under 5KB
- [ ] No external JS dependencies loaded at runtime (other than optional Plausible)
- [ ] All three index pages have appropriate JSON-LD (ItemList schema)

---

## Open Questions

---

## Completion Notes
