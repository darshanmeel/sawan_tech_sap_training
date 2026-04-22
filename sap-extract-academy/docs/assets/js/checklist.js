// Walkthrough step checklist functionality
// Saves and loads step completion state from localStorage

(function() {
  const STORAGE_PREFIX = 'sap-extract-academy-checklist';

  function getStorageKey(pageSlug) {
    return `${STORAGE_PREFIX}:${pageSlug}`;
  }

  function initializeChecklist() {
    // Get current page slug from URL or data attribute
    const pageSlug = document.documentElement.dataset.pageSlug ||
                     window.location.pathname.replace(/\/$/, '').split('/').pop();

    if (!pageSlug) return;

    const storageKey = getStorageKey(pageSlug);
    const checkboxes = document.querySelectorAll('input[type="checkbox"][data-step-id]');

    // Load saved state from localStorage
    const savedState = JSON.parse(localStorage.getItem(storageKey) || '{}');

    checkboxes.forEach(checkbox => {
      const stepId = checkbox.dataset.stepId;
      if (savedState[stepId]) {
        checkbox.checked = true;
      }

      // Save state on change
      checkbox.addEventListener('change', function() {
        const currentState = JSON.parse(localStorage.getItem(storageKey) || '{}');
        if (this.checked) {
          currentState[stepId] = true;
        } else {
          delete currentState[stepId];
        }
        localStorage.setItem(storageKey, JSON.stringify(currentState));

        // Update visual progress indicator
        updateProgressIndicator(checkboxes, storageKey);
      });
    });

    // Initial progress update
    updateProgressIndicator(checkboxes, storageKey);
  }

  function updateProgressIndicator(checkboxes, storageKey) {
    const completed = Array.from(checkboxes).filter(c => c.checked).length;
    const total = checkboxes.length;
    const percentage = Math.round((completed / total) * 100);

    // Update progress bar if it exists
    const progressBar = document.querySelector('[data-checklist-progress]');
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
      progressBar.setAttribute('aria-valuenow', percentage);
    }

    // Update progress text if it exists
    const progressText = document.querySelector('[data-checklist-progress-text]');
    if (progressText) {
      progressText.textContent = `${completed}/${total} steps completed`;
    }

    // Walkthrough-specific progress widgets
    const countEl = document.getElementById('progress-count');
    if (countEl) countEl.textContent = String(completed);

    const barFill = document.getElementById('progress-bar-fill');
    if (barFill) barFill.style.width = `${percentage}%`;

    const resetBtn = document.getElementById('reset-progress');
    if (resetBtn) resetBtn.hidden = completed === 0;
  }

  function clearChecklist() {
    const pageSlug = document.documentElement.dataset.pageSlug ||
                     window.location.pathname.replace(/\/$/, '').split('/').pop();

    if (!pageSlug) return;

    const storageKey = getStorageKey(pageSlug);
    localStorage.removeItem(storageKey);

    // Uncheck all checkboxes
    document.querySelectorAll('input[type="checkbox"][data-step-id]').forEach(checkbox => {
      checkbox.checked = false;
    });

    // Reset progress
    const checkboxes = document.querySelectorAll('input[type="checkbox"][data-step-id]');
    updateProgressIndicator(checkboxes, storageKey);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChecklist);
  } else {
    initializeChecklist();
  }

  // Expose clearChecklist to global scope for button clicks
  window.clearWalkthroughChecklist = clearChecklist;

  // Wire up reset button if present
  document.addEventListener('click', (event) => {
    const target = event.target.closest('#reset-progress');
    if (target) clearChecklist();
  });
})();
