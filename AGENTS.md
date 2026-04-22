# AGENTS.md — SAP Extract Academy

Claude Code reads this file automatically. It defines who does what.

---

## Who You Are (Determined by Your Task)

Before starting any task, identify which agent you are.
Read the corresponding agent file completely before writing a single line.

| If your task involves... | You are the... | Read this file |
|---|---|---|
| HTML, CSS, JS, templates, build script, layout fixes | **Builder** | `academy_handoff/agents/builder.md` |
| Walkthroughs, articles, glossary, table content | **Content Writer** | `academy_handoff/agents/content-writer.md` |
| Compiling SAP PDFs into sap_wiki/ articles | **Wiki Compiler** | `academy_handoff/agents/wiki-compiler.md` |
| SEO audits, meta tags, JSON-LD, robots.txt, llms.txt | **SEO Auditor** | `academy_handoff/agents/seo-auditor.md` |
| GitHub Pages deploy, sitemap, 404 fixes, verification | **Deployer** | `academy_handoff/agents/deployer.md` |

---

## How to Activate an Agent

The human will tell you which agent to be at the start of each session:

```
Activate agent: Content Writer
Task: Write the VBAK beginner walkthrough from wiki
```

If the human does not specify, infer from the task description using the table above.
When in doubt, ask: "This looks like [agent] work — shall I proceed as that agent?"

---

## Rules Every Agent Follows (No Exceptions)

1. **Read your agent file first** — before writing any code or content
2. **Never invent SAP Help URLs** — mark `[NEEDS_SAP_CITATION]`
3. **Never touch files outside your agent's scope** — see each agent file
4. **Commit after every meaningful unit** — format: `[AGENT-TYPE] verb description`
5. **Read `academy_handoff/CONTENT_RULES.md`** before any user-facing content
6. **Read `academy_handoff/ACADEMY_SCOPE.md`** — data extraction only, not SAP functional training
7. **Real-world examples** — composite/documented/first-person only, never fabricated specifics
8. **Wiki first** — Content Writer reads `sap_wiki/wiki/` before drafting any SAP content

---

## Project Structure

```
sap-extract-academy/
├── AGENTS.md                     ← you are here
├── build.js                      ← build script (Builder's scope)
├── package.json
├── strings/en.json               ← UI strings (Builder's scope)
├── content/en/                   ← markdown source (Content Writer's scope)
│   ├── tables/
│   ├── walkthroughs/
│   ├── articles/
│   └── glossary/
├── docs/                         ← built HTML output (Builder + Deployer scope)
├── templates/                    ← HTML templates (Builder's scope)
├── sap_wiki/                     ← private knowledge base (Wiki Compiler's scope)
│   ├── raw/
│   └── wiki/
└── academy_handoff/              ← spec documents (read-only reference for all agents)
    ├── agents/                   ← specialist agent files
    ├── ACADEMY_SCOPE.md
    ├── CONTENT_RULES.md
    ├── SAP_NOTES_REFERENCE.md
    └── ... all other spec files
```

---

## Scope Boundaries (Hard Rules)

| Agent | Can touch | Cannot touch |
|---|---|---|
| Builder | `docs/`, `templates/`, `build.js`, `strings/`, CSS, JS | `content/en/`, `sap_wiki/` |
| Content Writer | `content/en/` | `docs/`, `templates/`, `sap_wiki/` |
| Wiki Compiler | `sap_wiki/` | `content/en/`, `docs/`, `templates/` |
| SEO Auditor | `docs/` HTML meta only, `docs/sitemap.xml`, `docs/robots.txt`, `docs/llms.txt` | `content/en/`, `sap_wiki/`, CSS, JS |
| Deployer | `docs/sitemap.xml`, `docs/robots.txt`, `docs/llms*.txt`, `docs/CNAME`, `.github/` | Everything else |

**All agents:** `academy_handoff/` is **read-only**. Never modify handoff files.

---

## Commit Format by Agent

```
[BUILD] fix table page container max-width
[CONTENT] add VBAK beginner walkthrough
[WIKI] compile ACDOCA article from finance PDF
[SEO] fix missing JSON-LD on 3 glossary pages
[DEPLOY] rebuild sitemap with 52 pages
[FIX] remove duplicate section rendering in build script
[RECONCILE] apply v4 schema changes to existing content
```
