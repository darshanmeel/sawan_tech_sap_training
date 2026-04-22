---
slug: /decide/
title: "Help me decide"
seoTitle: "Help Me Decide — SAP Extraction Method Picker"
seoDescription: "Not sure whether to use ODP, SLT, or RFC for your SAP extraction? Answer five quick questions and get a personalised walkthrough link."
updatedAt: 2026-04-22
---

<p class="decide-intro">
  Answer a few questions about your data and environment. The tool will recommend an extraction method, then build a direct link to the right walkthrough — pre-loaded with your choices.
</p>

<div id="decide-mount">
  <div aria-live="polite" aria-atomic="false" id="decide-live" class="sr-only"></div>
  <div id="decide-grid" class="decide-grid">
    <!-- Q1 card is rendered by decide.js on DOMContentLoaded -->
  </div>
</div>

<script src="/assets/js/decide.js" defer></script>
<noscript>
  <p class="decide-noscript">
    JavaScript is required for the interactive decision tree.
    Without it, use the guide below to pick your method manually.
  </p>
  <ul>
    <li><strong>Real-time (&lt; 5 min lag)?</strong> → <a href="/articles/sap-runtime-license-trap/">Check SLT licensing first</a></li>
    <li><strong>Batch, table &gt; 500M rows?</strong> → ODP with parallel extraction</li>
    <li><strong>Batch, table ≤ 500M rows?</strong> → ODP single-thread</li>
  </ul>
</noscript>
