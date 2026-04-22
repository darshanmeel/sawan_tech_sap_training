// Mode banner dismissal with localStorage
// Allows users to dismiss the S/4HANA/ECC mode banner and remember choice

(function() {
  const STORAGE_KEY = 'sap-academy.mode-banner-dismissed';

  function initializeBanner() {
    const banner = document.querySelector('[data-source-indicator]');
    if (!banner) return;

    const currentVersion = banner.getAttribute('data-source-version');
    const dismissButton = banner.querySelector('.banner-dismiss');

    // Check if banner was previously dismissed for this version
    const dismissedVersion = localStorage.getItem(STORAGE_KEY);
    if (dismissedVersion === currentVersion) {
      hideBanner();
    }

    // Wire dismiss button
    if (dismissButton) {
      dismissButton.addEventListener('click', () => {
        localStorage.setItem(STORAGE_KEY, currentVersion);
        hideBanner();
      });
    }

    // Listen for source version changes to reset dismissal
    const versionSelect = document.querySelector('#source-version-select');
    if (versionSelect) {
      versionSelect.addEventListener('change', (e) => {
        const newVersion = e.target.value;
        // Clear the dismissed key so banner shows for new version
        localStorage.removeItem(STORAGE_KEY);
        // Show banner if it's currently hidden
        if (banner.style.display === 'none') {
          banner.style.display = '';
        }
      });
    }
  }

  function hideBanner() {
    const banner = document.querySelector('[data-source-indicator]');
    if (banner) {
      banner.style.display = 'none';
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBanner);
  } else {
    initializeBanner();
  }
})();
