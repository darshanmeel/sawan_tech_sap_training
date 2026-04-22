# ISSUE-001: Project Structure Setup

**Phase:** Foundation
**Estimated Effort:** 30 minutes
**Depends on:** None
**Skill files:** `SKILLS/stage1-static-html.md`, `SKILLS/deployment.md`, `SKILLS/migration-readiness.md`

---

## Goal

Create the repository structure, initial config files, and placeholder `.gitkeep` files so directory structure is tracked.

---

## Steps

1. Create directory tree exactly as defined in `README.md`:
   ```
   sap-extract-academy/
   ├── docs/
   │   └── assets/{css,js,images}/
   ├── content/en/{tables,walkthroughs/{beginner,intermediate,expert},articles,glossary,roadmap}/
   ├── templates/
   ├── strings/
   ├── .github/workflows/
   ```
2. Create `.gitkeep` files in empty directories to ensure git tracks them
3. Create `.gitignore`:
   ```
   node_modules/
   .DS_Store
   *.log
   .env
   .env.local
   ```
4. Create `package.json` stub (only needed if using `build.js`):
   ```json
   {
     "name": "sap-extract-academy",
     "version": "0.1.0",
     "private": true,
     "type": "module",
     "scripts": {
       "build": "node build.js"
     }
   }
   ```
5. Create `README.md` at repo root — short overview + link to detailed docs (distinct from the handoff README you're reading now; this one is the repo's public README)
6. Create `strings/en.json` with all keys from `DATA_SCHEMA.md`

---

## Acceptance Criteria

- [ ] Complete directory structure exists
- [ ] `.gitignore` present
- [ ] `package.json` present (even if build script not yet written)
- [ ] `strings/en.json` present with all keys populated
- [ ] Repo README exists and is distinct from the handoff docs
- [ ] `git init` done, first commit made

---

## Open Questions

---

## Completion Notes
