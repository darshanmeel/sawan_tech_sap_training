# CLAUDE.md — Instructions for SAP Wiki Maintenance

You are maintaining a private SAP knowledge base in this directory.

## Rules

1. Every article follows the schema in `academy_handoff/SAP_WIKI_GUIDE.md`
2. Every factual claim cites one of:
   - A SAP Help Portal URL (verified, not invented) — `[source](https://help.sap.com/...)`
   - A raw/ source file path — e.g., `raw/notes/SAP_NOTES_REFERENCE.md`
   - An explicit SME note — `[SME_KNOWLEDGE]`
3. Never invent a SAP Help URL. If unsure, mark `[NEEDS_SAP_CITATION]`
4. When ingesting a new raw/ file, check if a wiki article already exists for the topic.
   If yes, update and flag any contradictions. If no, create a new article.
5. Keep articles under 2000 words. Split into multiple articles if longer.
6. Always update `wiki/index.md` when creating new articles.
7. Always append to `changelog.md` with what you did and today's date.
8. Articles that reference SAP Notes link to `https://support.sap.com/notes/<number>`
   — readers need SAP login to read full note content.

## Citation Rules by Source Type

| Source | How to cite |
|---|---|
| SAP Help Portal URL | `[SAP Help](https://help.sap.com/...)` — must be verified |
| raw/pdfs_md/ file | `(raw/pdfs_md/filename.md, page ~N)` |
| raw/clippings/ file | `(raw/clippings/filename.md)` |
| raw/notes/ file | `(raw/notes/filename.md)` |
| SAP Note | `[SAP Note XXXXXXX](https://support.sap.com/notes/XXXXXXX)` |
| SME tribal knowledge | `[SME_KNOWLEDGE]` |
| Unverified claim | `[NEEDS_SAP_CITATION]` |

## Workflow Prompts

### Ingest a new raw source
"Read raw/[path/to/new/file]. Identify the main topics. For each topic, check if a wiki
article exists. Update or create as needed. Flag any contradictions with existing content."

### Compile a new topic from multiple sources
"Compile a wiki article on [topic]. Search all of raw/ for relevant content.
Cross-reference with existing wiki articles. Produce a new file at
wiki/[category]/[topic].md following the schema in SAP_WIKI_GUIDE.md."

### Lint/health check
"Scan the entire wiki. Report: (a) broken cross-references, (b) articles without
primary_sap_source, (c) contradictions between articles, (d) topics mentioned in
multiple articles that should be consolidated."

### Author Academy content
"Before writing any walkthrough, read the relevant wiki articles. Every SAP Help URL
you cite must already be in the wiki. If you need a citation that's not in the wiki,
stop and ask me to add it first."
