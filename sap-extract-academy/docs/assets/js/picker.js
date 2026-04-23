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

    // Swap visible step list based on current method. Falls back to the
    // container's data-default-method if no list exists for the selection.
    const container = document.querySelector('.steps-container');
    if (container) {
      const available = Array.from(container.querySelectorAll('ol.steps-list'));
      const wanted = state.method;
      const fallback =
        container.getAttribute('data-default-method') || 'odp';
      const targetMethod = available.some(function (ol) {
        return ol.getAttribute('data-method') === wanted;
      })
        ? wanted
        : fallback;
      available.forEach(function (ol) {
        if (ol.getAttribute('data-method') === targetMethod) {
          ol.removeAttribute('hidden');
        } else {
          ol.setAttribute('hidden', '');
        }
      });
    }

    // Swap visible tool block based on current tool selection.
    const toolContainer = document.querySelector('.tool-steps-container');
    if (toolContainer) {
      const toolBlocks = Array.from(toolContainer.querySelectorAll('[data-tool-block]'));
      const wantedTool = state.tool;
      const fallbackTool = toolContainer.getAttribute('data-default-tool') || 'custom';
      const targetTool = toolBlocks.some(function (el) {
        return el.getAttribute('data-tool-block') === wantedTool;
      }) ? wantedTool : fallbackTool;
      toolBlocks.forEach(function (el) {
        if (el.getAttribute('data-tool-block') === targetTool) {
          el.removeAttribute('hidden');
        } else {
          el.setAttribute('hidden', '');
        }
      });
    }

    // Swap visible sink block based on current sink selection.
    const sinkContainer = document.querySelector('.sink-steps-container');
    if (sinkContainer) {
      const sinkBlocks = Array.from(sinkContainer.querySelectorAll('[data-sink-block]'));
      const wantedSink = state.sink;
      const fallbackSink = sinkContainer.getAttribute('data-default-sink') || 'adls';
      const targetSink = sinkBlocks.some(function (el) {
        return el.getAttribute('data-sink-block') === wantedSink;
      }) ? wantedSink : fallbackSink;
      sinkBlocks.forEach(function (el) {
        if (el.getAttribute('data-sink-block') === targetSink) {
          el.removeAttribute('hidden');
        } else {
          el.setAttribute('hidden', '');
        }
      });
    }

    // Filter troubleshooting items by method (in SAP panel).
    document.querySelectorAll('.troubleshooting-item[data-ts-method]').forEach(function (el) {
      if (el.getAttribute('data-ts-method') === state.method) {
        el.removeAttribute('hidden');
      } else {
        el.setAttribute('hidden', '');
      }
    });

    // Filter troubleshooting items by tool (in Tool panel).
    document.querySelectorAll('.troubleshooting-item[data-ts-tool]').forEach(function (el) {
      if (el.getAttribute('data-ts-tool') === state.tool) {
        el.removeAttribute('hidden');
      } else {
        el.setAttribute('hidden', '');
      }
    });

    // Filter troubleshooting items by sink (in Sink panel).
    document.querySelectorAll('.troubleshooting-item[data-ts-sink]').forEach(function (el) {
      if (el.getAttribute('data-ts-sink') === state.sink) {
        el.removeAttribute('hidden');
      } else {
        el.setAttribute('hidden', '');
      }
    });

    // When method=ref, hide the tool/sink picker axes and tool/sink tab buttons.
    // The tab system controls panel visibility — don't touch panel hidden state here.
    const toolAxisEl = document.getElementById('picker-tool');
    const sinkAxisEl = document.getElementById('picker-sink');
    const toolStepsSection = document.querySelector('.tool-steps-section');
    const referenceStarters = document.querySelectorAll('.reference-starter');
    const toolTabBtn = document.querySelector('.wt-tab[data-wt-tab="tool"]');
    const sinkTabBtn = document.querySelector('.wt-tab[data-wt-tab="sink"]');

    if (state.method === 'ref') {
      if (toolAxisEl) toolAxisEl.setAttribute('hidden', '');
      if (sinkAxisEl) sinkAxisEl.setAttribute('hidden', '');
      if (toolStepsSection) toolStepsSection.setAttribute('hidden', '');
      if (toolTabBtn) toolTabBtn.setAttribute('hidden', '');
      if (sinkTabBtn) sinkTabBtn.setAttribute('hidden', '');
      referenceStarters.forEach(function (el) {
        el.setAttribute('hidden', '');
      });
    } else {
      if (toolAxisEl) toolAxisEl.removeAttribute('hidden');
      if (sinkAxisEl) sinkAxisEl.removeAttribute('hidden');
      if (toolTabBtn) toolTabBtn.removeAttribute('hidden');
      if (sinkTabBtn) sinkTabBtn.removeAttribute('hidden');
      // Note: toolStepsSection panel visibility is controlled by tab system only.
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

  /** Walkthrough tab switching. */
  function initTabs() {
    const tabs = document.querySelectorAll('.wt-tab[data-wt-tab]');
    if (!tabs.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) {
          t.setAttribute('aria-selected', 'false');
        });
        tab.setAttribute('aria-selected', 'true');

        const target = tab.getAttribute('data-wt-tab');
        document.querySelectorAll('[id^="wt-panel-"]').forEach(function (panel) {
          if (panel.id === 'wt-panel-' + target) {
            panel.removeAttribute('hidden');
          } else {
            panel.setAttribute('hidden', '');
          }
        });
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
    initTabs();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
