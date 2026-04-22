# SKILL: SAP Content Authoring

Use this skill when writing ANY content that references SAP systems, transactions, tables, or concepts. This is the most important skill for content quality.

---

## The Golden Rule

**Every SAP claim cites an SAP Help Portal page, or it doesn't go on the site.**

If you cannot find official SAP documentation for a statement:
1. Remove the statement
2. Rephrase to avoid the claim
3. Mark `[NEEDS_SAP_CITATION]` for human review
4. Link to a broader SAP page discussing the topic

Never invent a URL. Never cite non-SAP sources.

---

## Finding SAP Help Portal Pages

### The Portal Structure

Root: `https://help.sap.com/docs`

Key products for this project:
- SAP S/4HANA on-premise: `/docs/SAP_S4HANA_ON-PREMISE`
- SAP NetWeaver: `/docs/SAP_NETWEAVER_750` (canonical for many ABAP topics)
- SAP BW/4HANA: `/docs/SAP_BW4HANA`
- SLT Replication Server: `/docs/SLT_REPLICATION_SERVER`
- SAP Data Services: `/docs/SAP_DATA_SERVICES`

### Search Strategy

1. Go to `https://help.sap.com/docs`
2. For a transaction: search `"CODE" transaction` with quotes
3. For a concept: search the full name
4. For a table: search `table <name>`
5. Filter by product in the left sidebar
6. Pick the page whose URL contains the most specific match
7. Use the full HTTPS URL including `.html` extension

### Language Version

For the English Academy, always link to the English version (`en-US` segment if present). For German content (Stage 2), link to the German version when available, else link to English and note in translation comments.

---

## SAP Notes

SAP Notes (`launchpad.support.sap.com`) are behind a login wall. Link anyway — most learners have SAP credentials.

Format: `https://launchpad.support.sap.com/#/notes/<NOTE_NUMBER>`

Example: `https://launchpad.support.sap.com/#/notes/2729873`

Inline citation format:

> This behavior is documented in [SAP Note 2729873](https://launchpad.support.sap.com/#/notes/2729873).

---

## Common Transactions — Search Terms

Verify each URL before using. Don't hard-code these paths — search fresh on help.sap.com.

| Transaction | Purpose | Search Term |
|---|---|---|
| SE11 | Data Dictionary | "SE11 data dictionary" |
| SE16N | Table browser | "SE16N table display" |
| SE80 | Object Navigator | "SE80 object navigator" |
| SM59 | RFC Destinations | "SM59 RFC destination" |
| SICF | HTTP Service Nodes | "SICF service" |
| ODQMON | Delta Queue Monitor | "ODQMON delta queue" |
| RSA5 | Business Content Extractor Metadata | "RSA5 business content" |
| RSA6 | Active Extractors | "RSA6 datasources" |
| RSA7 | Delta Queue (classic BW) | "RSA7 delta queue" |
| LTRC | SLT Cockpit | "LTRC configuration SLT" |
| LTRS | SLT Advanced Replication Settings | "LTRS advanced replication" |
| SM30 | Table Maintenance | "SM30 table view maintenance" |

---

## Decision Tree for Uncertain Claims

1. **Found on help.sap.com?** → Cite, use it
2. **Found in an SAP Note?** → Cite the note
3. **Found on community.sap.com in an official SAP-tagged doc?** → Cite
4. **Only "know" it from training?** → Mark `[NEEDS_SAP_CITATION]` and flag
5. **Widely understood but no canonical doc?** → Rephrase to avoid the specific claim OR cite a broader page

### Example

Claim: "SLT supports real-time replication with sub-second latency."

- Search "SLT latency" on help.sap.com
- If a page says SLT supports real-time → cite it
- If "sub-second" is not documented → rephrase to "SLT supports near-real-time replication [cite]" and drop "sub-second" OR mark `[NEEDS_SAP_CITATION]`

---

## Format Examples

### Walkthrough Step with Transaction

```markdown
## Step 5: Confirm the delta queue is active

Once the subscription is created, verify that SAP has actually started collecting change records in the delta queue.

**Do this in SAP:** Open transaction [ODQMON](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/.../ODQMON.html) and navigate to **Subscription Monitor**.

> **Verify:** Your subscription ID appears in the list with status "Active" and a non-zero "Last Delta" timestamp.

**Why it matters:** Without an active subscription, your downstream consumer will not receive new rows even after you save changes in the source table.
```

### Glossary Entry

```yaml
---
term: ODQMON
fullName: "Operational Data Queue Monitor"
shortDefinition: "Transaction for monitoring the status of delta queues under the Operational Data Provisioning (ODP) framework. Shows queue depth, latency, and subscription health."
relatedTerms:
  - odp
  - delta
sapDocUrl: "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/.../ODQMON.html"
---

Extended paragraph description.
```

### Article Citation

```markdown
The Universal Journal (table [ACDOCA](https://help.sap.com/docs/...)) is the unified financial data store introduced in S/4HANA. It consolidates what were previously separate tables for general ledger, controlling, profitability, and fixed assets.
```

---

## Common Mistakes

### Mistake 1: Citing a related-but-different-topic page

If the claim is about ACDOCA *delta extraction* but the only page you find is about ACDOCA *in general*, either narrow the claim or mark the delta-specific part `[NEEDS_SAP_CITATION]`.

### Mistake 2: Linking to help.sap.com home page

Home page is not a citation. Always link to the specific doc.

### Mistake 3: Using Confluence or community Wiki

SAP internal Confluence and community Wiki pages are not official documentation. Use help.sap.com equivalents.

### Mistake 4: Treating older URLs as current

SAP occasionally restructures help.sap.com. Prefer the newer `help.sap.com/docs/...` structure. If you find only `help.sap.com/viewer/...`, use it but flag for future refresh.

---

## When Stuck

1. Add `[NEEDS_SAP_CITATION: brief description]` inline
2. List missing citations in the issue's "Open Questions" with what you searched for
3. Continue other content — don't block the whole issue on one missing citation
4. Human reviewer fills in citations before publish
