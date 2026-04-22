// SAP version source picker
// Allows users to select ECC or S/4HANA and stores preference

(function() {
  const STORAGE_KEY = 'sap-extract-academy-source-version';
  const DEFAULT_VERSION = 's4hana';

  function initializeSourcePicker() {
    const picker = document.querySelector('[data-source-picker]');
    if (!picker) return;

    // Get current preference or use default
    const currentVersion = localStorage.getItem(STORAGE_KEY) || DEFAULT_VERSION;

    // Set picker value
    const select = picker.querySelector('select');
    if (select) {
      select.value = currentVersion;
      select.addEventListener('change', (e) => {
        saveSourceVersion(e.target.value);
        updateSourceIndicator(e.target.value);
      });
    }

    // Update UI based on selection
    updateSourceIndicator(currentVersion);
  }

  function saveSourceVersion(version) {
    localStorage.setItem(STORAGE_KEY, version);
  }

  function updateSourceIndicator(version) {
    // Update banner/indicator if present
    const indicator = document.querySelector('[data-source-indicator]');
    if (indicator) {
      indicator.setAttribute('data-source-version', version);

      const label = indicator.querySelector('[data-source-label]');
      if (label) {
        if (version === 'ecc') {
          label.textContent = 'Viewing ECC Extraction Patterns';
          indicator.classList.add('source-ecc');
          indicator.classList.remove('source-s4hana');
        } else {
          label.textContent = 'Viewing S/4HANA Extraction Patterns';
          indicator.classList.add('source-s4hana');
          indicator.classList.remove('source-ecc');
        }
      }
    }

    // Show/hide version-specific content
    updateVersionSpecificContent(version);
  }

  function updateVersionSpecificContent(version) {
    // Show/hide elements with data-ecc-only or data-s4hana-only
    document.querySelectorAll('[data-ecc-only]').forEach(el => {
      el.style.display = version === 'ecc' ? 'block' : 'none';
    });

    document.querySelectorAll('[data-s4hana-only]').forEach(el => {
      el.style.display = version === 's4hana' ? 'block' : 'none';
    });
  }

  function getSourceVersion() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_VERSION;
  }

  // Expose to global scope
  window.sapExtractAcademy = window.sapExtractAcademy || {};
  window.sapExtractAcademy.sourceVersion = getSourceVersion;
  window.sapExtractAcademy.setSourceVersion = saveSourceVersion;

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSourcePicker);
  } else {
    initializeSourcePicker();
  }
})();
