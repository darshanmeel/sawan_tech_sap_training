# SAP_NOTES_REFERENCE.md — Critical SAP Notes for the 10 Main Tables

Drop this into `sap_wiki/raw/notes/`. Claude Code uses this when authoring walkthroughs.

⚠️ All notes require SAP login to read in full at support.sap.com/notes.
Numbers listed here are verified from community references and vendor documentation.

---

## CRITICAL — Read Before Any Walkthrough

### Note 3255746 — ODP RFC Usage No Longer Permitted (February 2024)

**This is the most important note in your entire wiki.**

SAP updated this note in February 2024 (version 4) and again July 2024. It states that use of ODP RFC modules by customers or third-party applications is **no longer permitted**. This affects:

- Azure Data Factory SAP CDC connector
- Qlik Replicate
- Google Cloud Data Fusion
- Informatica ODP connector
- Matillion ODP connector
- Fivetran ODP connector
- Any tool using ODP via RFC

**What is still permitted:**
- ODP via OData API (slower but compliant)
- SLT (not affected)
- Direct table read via RFC_READ_TABLE (but see Note 382318)
- ABAP CDS views via OData (compliant path)
- SAP Datasphere (SAP's preferred direction)

**What this means for your walkthroughs:**
Every walkthrough must mention this note. For the ODP path, clarify whether the tool uses RFC or OData. Do not present RFC-based ODP as a safe default without flagging this note.

**The honest picture for your readers:**
The note is not legally binding on its own, but SAP can include restrictions in contract renewals and has threatened to audit unpermitted usage. Most enterprises are taking it seriously. The practical alternatives are:
1. ODP via OData (supported, but 10× slower than RFC)
2. SLT (separate license, real-time capable, not affected)
3. Migrate to SAP Datasphere (SAP's preferred path — expensive)
4. Use SAP-certified connector vendors (SNP Glue, Theobald via OData, etc.)

This is a major article topic: *"The ODP Licensing Trap: What Note 3255746 Means for Your Extraction Pipeline"*

---

### Note 382318 — RFC_READ_TABLE Not Intended for Productive Use

RFC_READ_TABLE is the simplest way to read any SAP table directly. SAP explicitly says it is not for productive use:
- Limited to 512 bytes per row
- Unstable across releases
- Not supported for large tables
- License implications for third-party tools

**Impact on walkthroughs:** Never recommend RFC_READ_TABLE as a production path. Mention it only as a quick-test tool, always with this note cited.

---

### Note 2232584 — Release of SAP Extractors for ODP

The master list of classic BW extractors released for ODP consumption. Program `BS_ANLY_DS_RELEASE_ODP` enables all listed data sources for ODP.

**Relevant for:** All ECC walkthroughs using classic BW extractors (2LIS_*, 0FI_*, 0MM_*).

---

### Note 3198662 — Supplement to Note 2232584

Additional DataSource releases for ODP. Check this alongside 2232584 for the complete list.

---

### Note 2884410 — CDS-Based Data Extraction: Full and Delta Enabled

Explains which CDS views support full vs delta extraction. Critical for ACDOCA and any CDS-based walkthrough. Covers:
- Why a CDS view extracts 0 records after init on delta
- CDC prerequisites and minimum requirements
- `@Analytics.dataExtraction.delta.changeDataCapture.automatic: true` annotation

---

### Note 2481315 — ODP: Extracting from SAP Systems to BW/4HANA — Availability and Limitations

Availability matrix and known limitations for ODP extraction. Use when readers ask "does this work on my release?"

---

### Note 1577441 — Central SAP Note for SLT Replication Server Installation

The master note for SLT. Contains links to all SLT installation guides, sizing notes, and version compatibility. Reference this whenever SLT is mentioned.

---

### Note 576886 — Sales Document Delta Update (2LIS_11_*)

Delta update behavior for sales order extractors. When a sales document changes, delta fires only if fields in the extract structure are affected. Critical for VBAK/VBAP walkthroughs using classic extractors.

---

## By Table

### ACDOCA (Universal Journal — S/4HANA only)

| Note | Title | Why It Matters |
|---|---|---|
| 3255746 | ODP RFC no longer permitted | ADF SAP CDC connector affected; RFC-based ODP extraction no longer safe |
| 2884410 | CDS full/delta extraction | Delta behavior for I_JournalEntryItem; CDC prerequisites |
| 2481315 | ODP availability and limitations | Release matrix for ACDOCA extraction |

**Extractor path (on-prem S/4HANA):** `0FI_ACDOCA_10` via ODP_SAP context. Delta enabled.

**CDS view path:** `I_JournalEntryItem` via ODP_CDS context. Check release status — SAP community discussion suggests `I_GLAccountLineItemRawData` (IFIGLACCTLIR) was not fully released on-prem as of 2022. Verify in your system with View Browser.

**SME note:** `0FI_ACDOCA_10` is the safer on-prem path. `I_JournalEntryItem` is preferred for S/4HANA Cloud. Confirm with BASIS which is released in your specific release/SPS level.

---

### VBAK / VBAP (Sales Document Header / Item — S/4HANA and ECC)

| Note | Title | Why It Matters |
|---|---|---|
| 3255746 | ODP RFC no longer permitted | Tools using ODP RFC for 2LIS_11_* affected |
| 576886 | Sales document delta update | Delta fires only on extract-structure-relevant field changes |
| 2232584 | Extractor release for ODP | Confirms 2LIS_11_VAHDR and 2LIS_11_VAITM are ODP-released |

**Extractor paths:**
- Header: `2LIS_11_VAHDR` — base tables VBAK, VBKD, VBUK
- Item: `2LIS_11_VAITM` — base tables VBAK, VBAP, VBKD, VBUK, VBUP
- Schedule line: `2LIS_11_VASCL` — base tables VBAK, VBAP, VBEP
- Item status: `2LIS_11_VASTI` — base table VBUP
- Header status: `2LIS_11_VASTH` — base table VBUK

**Delta method:** ABR (after-before record). Note: Inquiry documents (category A) are NOT extracted by standard extractors.

**Z-field path:** Enhance extract structure in LBWE using LIS communication structures (MCVBAK, MCVAP, etc.).

---

### BSEG (Accounting Document Segment — ECC only)

| Note | Title | Why It Matters |
|---|---|---|
| 3255746 | ODP RFC no longer permitted | RFC-based extraction of 0FI_* extractors affected |
| 2232584 | Extractor release for ODP | Confirms 0FI_GL_* extractors are ODP-released |

**Extractor paths (ECC):**
- `0FI_GL_50` — General Ledger line items (replaces older 0FI_GL_4)
- `0FI_AR_4` — Accounts Receivable line items
- `0FI_AP_4` — Accounts Payable line items

**S/4HANA equivalent:** ACDOCA (BSEG no longer the primary table — replaced by Universal Journal)

**Critical gotcha:** BSEG is a cluster table in ECC. Direct table read via RFC_READ_TABLE fails on cluster tables. Must use the BW extractors (0FI_GL_50 etc.) or SLT.

---

### LFA1 (Vendor Master General Data — S/4HANA and ECC)

| Note | Title | Why It Matters |
|---|---|---|
| 2232584 | Extractor release for ODP | Confirms 0VENDOR_ATTR is ODP-released |

**Extractor paths:**
- `0VENDOR_ATTR` — Vendor master attributes (general data from LFA1)
- `0VENDOR_TEXT` — Vendor texts

**Direct table read:** LFA1 is a transparent table. RFC_READ_TABLE works but see Note 382318 on production use. SLT or ODP via 0VENDOR_ATTR is cleaner.

**Key consideration:** LFA1 stores only general data. Company-code-specific data is in LFB1. Purchasing-org data is in LFM1. Most use cases need a join — use the extractor which handles this.

---

### MARA (Material Master General Data — S/4HANA and ECC)

| Note | Title | Why It Matters |
|---|---|---|
| 2232584 | Extractor release for ODP | Confirms 0MATERIAL_ATTR is ODP-released |

**Extractor paths:**
- `0MATERIAL_ATTR` — Material master attributes (MARA + joined views)
- `0MATERIAL_TEXT` — Material texts (from MAKT)

**Key consideration:** Material master is split across many tables (MARA general, MARC plant, MARD storage location, MBEW valuation, MVKE sales, etc.). `0MATERIAL_ATTR` joins the key ones. If you need all views, you need multiple extractors or SLT on the full set.

**Z-field path:** Z-fields added via customer include CI_MARA. Exposed in extractor enhancement via LBWE or via Append Structure + CDS Extension View in S/4HANA.

---

### BKPF (Accounting Document Header — S/4HANA and ECC)

| Note | Title | Why It Matters |
|---|---|---|
| 3255746 | ODP RFC no longer permitted | RFC-based extraction affected |
| 2232584 | Extractor release for ODP | Check for BKPF-specific extractors |

**Note:** In S/4HANA, BKPF still exists but ACDOCA is the primary financial table. For header-level data, BKPF is still used alongside ACDOCA. In ECC, BKPF + BSEG together form the complete document.

**Extractor path:** No dedicated BKPF extractor. Use `0FI_GL_50` which includes header fields from BKPF joined to item data from BSEG/ACDOCA. Or SLT direct table replication.

---

### MATDOC (Material Document — S/4HANA)

| Note | Title | Why It Matters |
|---|---|---|
| 3255746 | ODP RFC no longer permitted | Affects RFC-based extraction tools |
| 2232584 | Extractor release for ODP | Check for MM movement extractors |

**Extractor paths:**
- `2LIS_03_BF` — Goods movements (MKPF/MSEG in ECC; MATDOC in S/4HANA)
- `2LIS_03_UM` — Revaluations

**Key consideration:** MATDOC is the S/4HANA simplification of MKPF (header) + MSEG (items). In ECC use 2LIS_03_BF which reads from MKPF/MSEG. In S/4HANA the same extractor reads from MATDOC.

---

### EKKO / EKPO (Purchasing Document Header / Item — S/4HANA and ECC)

| Note | Title | Why It Matters |
|---|---|---|
| 3255746 | ODP RFC no longer permitted | RFC-based extraction of 2LIS_02_* affected |
| 2232584 | Extractor release for ODP | Confirms 2LIS_02_HDR and 2LIS_02_ITM are ODP-released |

**Extractor paths:**
- Header: `2LIS_02_HDR` — base tables EKKO + EKKO status tables
- Item: `2LIS_02_ITM` — base tables EKKO, EKPO
- Schedule line: `2LIS_02_SCL` — EKET
- Account assignment: `2LIS_02_ACC` — EKKN

**Setup table transaction:** `OLI3BW` fills setup table for purchasing (application 02). Must run before first extraction.

---

## The One Note Every Walkthrough Must Mention

**Note 3255746** — mention it in every walkthrough that covers ODP via RFC. Your readers need to know:

1. RFC-based ODP is technically usable but no longer permitted by SAP as of Feb 2024
2. The compliant alternatives are ODP via OData or SLT
3. This does not affect SLT, direct table reads (subject to Note 382318), or SAP-native tools
4. Contract renewal risk is real — legal teams at large enterprises are taking this seriously

This note is also your best cornerstone article: *"What SAP Note 3255746 Means for Your Data Pipeline"* — high search intent, no good coverage exists yet.

---

## How to Use This File

When authoring any walkthrough:

1. Check which table you're writing about
2. Find the table section above
3. Include the relevant notes in the walkthrough's "Prerequisites" or "License and Compliance" section
4. Always include Note 3255746 if the walkthrough covers ODP via RFC
5. Mark `[NEEDS_SAP_CITATION]` and link to `support.sap.com/notes/<number>` — readers need their own SAP login to read the full note
