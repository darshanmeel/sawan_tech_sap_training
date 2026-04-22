# agents/INDEX.md — Agent Routing

One agent per task type. Each agent has a focused spec.
Route every task to the right agent before starting.

---

## Agent Roster

| Agent | File | Use When |
|---|---|---|
| **Builder** | `agents/builder.md` | HTML, CSS, JS, templates, build script |
| **Content Writer** | `agents/content-writer.md` | Walkthroughs, articles, glossary entries |
| **Wiki Compiler** | `agents/wiki-compiler.md` | Compiling PDFs into sap_wiki/ articles |
| **SEO Auditor** | `agents/seo-auditor.md` | Checking pages pass SEO requirements |
| **Deployer** | `agents/deployer.md` | GitHub Pages deploy, sitemap, verification |

---

## How to Invoke an Agent

At the start of any Claude Code session, state which agent you are activating:

```
Activate agent: Content Writer
Read agents/content-writer.md now.
Task: [describe the task]
```

Claude Code reads the agent file, applies its specific rules, and operates within that scope only.

---

## Global Rules (Apply to All Agents)

These rules override everything else:

1. Never invent SAP Help URLs — mark [NEEDS_SAP_CITATION]
2. Never touch files outside your agent's scope
3. Commit after every meaningful unit
4. Read CONTENT_RULES.md before writing any user-facing content
5. Read ACADEMY_SCOPE.md — data extraction only, not SAP functional training
6. Real-world examples follow CONTENT_RULES.md policy (composite/documented/first-person only)
7. No fabricated dollar amounts, company names, or specific events
