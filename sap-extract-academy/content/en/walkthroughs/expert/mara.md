---
table: MARA
level: expert
slug: mara
title: "Extract Massive MARA (20+ Z-Fields, Multi-Table)"
summary: "Enterprise material master with 20+ Z-fields, joined with MARC (plant) and MVKE (sales org). Fivetran Application Layer extraction."
estimatedMinutes: 90
prerequisites:
  - "Completed MARA Intermediate"
  - "Understanding of MARC and MVKE tables"
licenseRelevance: "All licenses."
destinations:
  - Snowflake
extractors:
  - Fivetran
steps:
  - id: step-01
    title: "Profile the extended MARA structure"
    explanation: "Your MARA has 20+ Z-fields across multiple append structures. Fivetran's Application Layer can extract all at once."
    verify: "Count Z-fields in SE11 MARA → Append Structures."
  
  - id: step-02
    title: "Set up Fivetran Connector for SAP"
    explanation: "In Fivetran, create connector for SAP Application Layer. Authenticate with EXTRACT user."
    verify: "Fivetran dashboard shows SAP connection status: Connected."
  
  - id: step-03
    title: "Enable MARA, MARC, MVKE tables in Fivetran"
    explanation: "Select all three tables. Fivetran auto-discovers joins and Z-fields."
    verify: "Fivetran shows 3 tables with all Z-fields listed."
  
  - id: step-04
    title: "Configure Snowflake destination"
    explanation: "Map to Snowflake schemas: raw.MARA, raw.MARC, raw.MVKE."
    verify: "Initial load completes."
  
  - id: step-05
    title: "Create Snowflake views with joins"
    explanation: "Create DIM_MATERIAL_COMPLETE joining MARA + MARC + MVKE + all Z-fields."
    verify: "View query works and returns denormalized material records."

troubleshooting:
  - problem: "Fivetran transformation fails due to Z-field type mismatch"
    solution: "In Fivetran, adjust column mapping to handle string/numeric conversions."

nextSteps:
  - label: "Compare with ACDOCA Expert"
    url: "/walkthrough/expert/acdoca/"

seoTitle: "Extract Extended MARA (20+ Z-Fields) — Fivetran"
seoDescription: "Expert-level material master extraction with 20+ Z-fields, MARC, MVKE joins via Fivetran Application Layer."
updatedAt: 2026-04-22
---

## Scenario

Your company's MARA is heavily extended with custom fields. Manually managing 20+ Z-field extractions is error-prone. Fivetran's Application Layer connector discovers and extracts everything automatically.

---

## What you've built

You have a complete material dimension in Snowflake, including all Z-fields and related plant/sales org data.
