// Filter logic for directory index page (module + availability filters)

const moduleGroup = document.querySelector('[data-filter-group="module"]');
const modeGroup = document.querySelector('[data-filter-group="mode"]');
const grid = document.querySelector('[data-directory-grid]');
const emptyState = document.querySelector('[data-empty-state]');
const visibleCount = document.querySelector('[data-visible-count]');

if ((moduleGroup || modeGroup) && grid) {
  const cards = Array.from(grid.querySelectorAll('.directory-card'));
  const moduleChips = moduleGroup ? Array.from(moduleGroup.querySelectorAll('.chip')) : [];
  const modeChips = modeGroup ? Array.from(modeGroup.querySelectorAll('.chip')) : [];

  let currentModuleFilter = 'all';
  let currentModeFilter = 'all';

  function matchesMode(cardMode, modeFilter) {
    if (modeFilter === 'all') return true;
    if (modeFilter === 's4hana') return cardMode === 'both' || cardMode === 's4-only';
    if (modeFilter === 'ecc') return cardMode === 'both' || cardMode === 'ecc-only';
    return false;
  }

  function applyFilters() {
    let visible = 0;
    for (const card of cards) {
      const module = card.dataset.module || '';
      const mode = card.dataset.mode || '';
      const moduleMatch = currentModuleFilter === 'all' || module === currentModuleFilter;
      const modeMatch = matchesMode(mode, currentModeFilter);
      const show = moduleMatch && modeMatch;
      card.hidden = !show;
      if (show) visible += 1;
    }
    if (emptyState) emptyState.hidden = visible !== 0;
    if (visibleCount) visibleCount.textContent = String(visible);
  }

  if (moduleGroup) {
    moduleGroup.addEventListener('click', (event) => {
      const chip = event.target.closest('.chip');
      if (!chip) return;
      currentModuleFilter = chip.dataset.filter || 'all';
      for (const c of moduleChips) {
        const active = c === chip;
        c.classList.toggle('chip--active', active);
        c.setAttribute('aria-pressed', active ? 'true' : 'false');
      }
      applyFilters();
    });
  }

  if (modeGroup) {
    modeGroup.addEventListener('click', (event) => {
      const chip = event.target.closest('.chip');
      if (!chip) return;
      currentModeFilter = chip.dataset.filter || 'all';
      for (const c of modeChips) {
        const active = c === chip;
        c.classList.toggle('chip--active', active);
        c.setAttribute('aria-pressed', active ? 'true' : 'false');
      }
      applyFilters();
    });
  }

  // Initial state
  applyFilters();
}
