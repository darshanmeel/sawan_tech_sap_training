/**
 * picker.js — 3-axis extraction picker for SAP Extract Academy walkthroughs.
 *
 * Axes:
 *   method: odp | slt | rfc | ref
 *   tool:   adf | databricks | fivetran | airbyte | custom
 *   sink:   adls | s3 | gcs | snowflake | bigquery | fabric | other
 *
 * On page load: reads ?method=&tool=&sink= from the URL and checks the
 * matching radio buttons. On change: writes updated values back via
 * history.replaceState (no page reload).
 *
 * When method=ref the "Tool hand-off" block (.reference-starter) hides.
 */

(function () {
  'use strict';

  const AXES = ['method', 'tool', 'sink'];
  const DEFAULTS = { method: 'odp', tool: 'adf', sink: 'adls' };

  /** Read query params for all three axes. */
  function readParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    AXES.forEach(function (axis) {
      const v = params.get(axis);
      result[axis] = v || DEFAULTS[axis];
    });
    return result;
  }

  /** Write current picker state to the URL without reloading. */
  function writeParams(state) {
    const params = new URLSearchParams(window.location.search);
    AXES.forEach(function (axis) {
      if (state[axis]) {
        params.set(axis, state[axis]);
      }
    });
    const newUrl =
      window.location.pathname + '?' + params.toString() + window.location.hash;
    history.replaceState(null, '', newUrl);
  }

  /** Apply state: check radio buttons and toggle dependent UI. */
  function applyState(state) {
    AXES.forEach(function (axis) {
      const radios = document.querySelectorAll(
        '.picker input[type="radio"][name="' + axis + '"]'
      );
      radios.forEach(function (radio) {
        radio.checked = radio.value === state[axis];
      });
    });

    // When method=ref, hide the tool axis and any reference-starter blocks.
    const toolAxisEl = document.getElementById('picker-tool');
    const referenceStarters = document.querySelectorAll('.reference-starter');

    if (state.method === 'ref') {
      if (toolAxisEl) toolAxisEl.setAttribute('hidden', '');
      referenceStarters.forEach(function (el) {
        el.setAttribute('hidden', '');
      });
    } else {
      if (toolAxisEl) toolAxisEl.removeAttribute('hidden');
      // Unhide reference-starter blocks so the selected tool snippet is visible.
      referenceStarters.forEach(function (el) {
        el.removeAttribute('hidden');
      });
    }
  }

  /** Attach change listeners to all picker radios. */
  function attachListeners() {
    const radios = document.querySelectorAll('.picker input[type="radio"]');
    radios.forEach(function (radio) {
      radio.addEventListener('change', function () {
        const state = readParams();
        // Override the changed axis with the new value.
        state[radio.name] = radio.value;
        writeParams(state);
        applyState(state);
      });
    });
  }

  /** Boot: run once the DOM is ready. */
  function init() {
    const picker = document.querySelector('.picker');
    if (!picker) return; // not a walkthrough page

    const state = readParams();
    applyState(state);
    attachListeners();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
