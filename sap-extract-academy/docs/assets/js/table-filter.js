const chipGroup = document.querySelector('[data-filter-group="module"]');
const grid = document.querySelector('[data-filterable]');
const emptyState = document.querySelector('[data-empty-state]');
const visibleCount = document.querySelector('[data-visible-count]');

if (chipGroup && grid) {
  const cards = Array.from(grid.querySelectorAll('.table-card'));
  const chips = Array.from(chipGroup.querySelectorAll('.chip'));

  function applyFilter(filter) {
    let visible = 0;
    for (const card of cards) {
      const module = card.dataset.module || '';
      const show = filter === 'all' || module === filter;
      card.hidden = !show;
      if (show) visible += 1;
    }
    if (emptyState) emptyState.hidden = visible !== 0;
    if (visibleCount) visibleCount.textContent = String(visible);
  }

  chipGroup.addEventListener('click', (event) => {
    const chip = event.target.closest('.chip');
    if (!chip) return;
    const filter = chip.dataset.filter || 'all';
    for (const c of chips) {
      const active = c === chip;
      c.classList.toggle('chip--active', active);
      c.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
    applyFilter(filter);
  });
}
