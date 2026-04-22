# TOOLING_GUIDE.md — Claude Code as Primary Build Tool

You'll use **Claude Code exclusively** to build this. One tool, one workflow, no context-switching.

---

## Why Claude Code

- Handles the 37+ files in this project naturally — reads, edits, tracks state across sessions
- Runs `npm install`, `npm run build`, `git commit` from inside the session
- Runs Lighthouse and fixes regressions in-session
- Follows `AGENTS.md` rules reliably across long sessions
- Has web search — so it can verify SAP Help Portal URLs directly
- Can read the full handoff package and keep all specs in context
- Native SKILL.md support — picks up the skill files automatically

---

## Setup

```bash
# Install Claude Code (one-time)
npm install -g @anthropic-ai/claude-code

# Create the project directory
mkdir -p ~/code/sap-extract-academy
cd ~/code/sap-extract-academy

# Extract the handoff zip here
# Expected structure after:
#   ~/code/sap-extract-academy/
#     academy_handoff/   (handoff docs — stays intact throughout the build)
#     (code goes in ~/code/sap-extract-academy/ root once ISSUE-001 runs)

# Start Claude Code
claude
```

### First Prompt to Claude Code

Paste this verbatim:

```
Read every file in the academy_handoff/ directory, including subdirectories.
Start with academy_handoff/README.md, then AGENTS.md, then the rest.

Once you've read everything:

1. Confirm you understand:
   - Dual-stage plan (static HTML first, Astro/Next later)
   - SAP citation discipline (only help.sap.com, no blogs)
   - SEO priority (every page must pass the checklist)
   - ECC-in-Phase-1 scope (from ECC_ADDENDUM.md)
   - Claude Code is the only tool being used

2. Open academy_handoff/issues/001-project-setup.md and begin work.

3. Commit after every meaningful unit per AGENTS.md conventions.

4. After each completed issue, append a Completion Notes section
   and show me what you did before moving to the next issue.
```

---

## Session Patterns

### Pattern 1: Code Issues — One Issue Per Session

Best for code-heavy issues (ISSUE-001 through 004, 009, 010, 011, 012).

Session-per-issue keeps context fresh and commits focused.

### Pattern 2: Content Batches

Best for content-heavy issues (ISSUE-005, 006, 007, 008).

Example prompt:

```
Work on ISSUE-006. Write three walkthroughs this session: 
LFA1 Beginner, LFA1 Intermediate, LFA1 Expert. 
Use the reference structure in content_samples/vbak-beginner.md.

For every SAP claim, use the web search tool to verify the 
help.sap.com URL before writing the citation. If you can't 
verify one, mark it [NEEDS_SAP_CITATION] so I can check.
```

Three walkthroughs per batch is a good unit — same table, so context builds once.

### Pattern 3: SAP Verification Pass

Run this once per content batch:

```
For every content file modified in the last 5 commits, verify 
every SAP Help Portal URL. Use the web search tool. If a URL 
404s or redirects to a different concept, flag it.
```

### Pattern 4: Competitive Refresh (Quarterly)

```
Review COMPETITIVE_ANALYSIS.md. Run web searches for new SAP 
data extraction courses, tools, or content published in the 
past 90 days. Update the analysis and flag any new threats 
or positioning opportunities.
```

---

## Your Role as SAP SME

Claude Code drafts; you verify.

1. **Read every SAP Help URL** Claude Code produces. Click each. Confirm the page exists and says what the draft claims.
2. **Catch technical inaccuracies.** Claude Code has general SAP knowledge but lacks your depth. You'll catch things like:
   - "SLT uses SAP Gateway" — it doesn't
   - "ACDOCA has an ECC equivalent" — it doesn't; ECC uses BSEG/COEP/GLT0 separately
   - "CDS views work on ECC" — they don't; ECC predates CDS
3. **Final approval on every walkthrough step.** Drafts can go to a feature branch; `main` is merge-gated by you.

**Budget:** ~40% reviewing, ~30% filling SAP gaps Claude Code misses, ~30% SME-only content (tribal knowledge, license nuance).

---

## Cost

Claude Code is included in Anthropic Pro (€20/month) for personal use. Pay-per-use via API is also available if you prefer. No other tools needed.

---

## Commit Conventions

Per `AGENTS.md`:

```
[ISSUE-###] verb description
```

Examples:
```
[ISSUE-001] Initialize project structure
[ISSUE-006] Draft LFA1 Beginner walkthrough
[ISSUE-006] Verify SAP Help URLs for LFA1 walkthroughs
[ISSUE-012] Add ECC source picker to tables index
```

---

## When Claude Code Gets Stuck

It will. SAP documentation is sometimes ambiguous or has moved. When Claude Code hits a dead end:

1. It adds the question to the issue's "Open Questions" section
2. It moves to the next independent issue
3. You answer the question when you next review

This workflow means Claude Code never sits idle waiting for your input — it keeps producing drafts on non-blocked work while you answer blockers in batches.

---

## Expected Velocity

With Claude Code + you as SME:

- **Week 1:** ISSUE-001 through 004 complete (foundation + templates)
- **Week 2-3:** ISSUE-005 through 008 in progress (content sprint)
- **Week 4-5:** ISSUE-009 through 012 complete (pages, JS, ECC picker)
- **Week 6:** ISSUE-011 deploy + verification
- **Week 7-8:** ISSUE-013 LinkedIn outreach operationalized

Total: 6-8 weeks part-time to live launch with both S/4HANA and ECC coverage.

If you dedicate full-time for 3-4 weeks, you can compress to launch-ready in one month.
