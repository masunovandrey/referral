import { getFallbackLogoColor, getFallbackLogoLetter } from '../ui/fallbackLogo.js';
import { translate } from '../i18n/i18n.js';

export function renderHero() {
  return `
    <section class="hero">
      <h1 class="hero__title">${translate('home.hero.title')}</h1>
      <p class="hero__subtitle">${translate('home.hero.subtitle')}</p>
    </section>
  `;
}

export function renderSearchInput({ value = '' } = {}) {
  return `
    <input
      class="catalog-search__input"
      type="search"
      name="query"
      value="${value}"
      placeholder="${translate('home.catalog.search.placeholder')}"
    />
  `;
}

export function renderCategoryChips({ categories = [], selectedCategory = '' } = {}) {
  const chips = [
    { value: '', label: translate('home.catalog.chips.all') },
    ...categories.map((category) => ({ value: category, label: category }))
  ];

  const chipHtml = chips
    .map(
      (chip) => `
        <button
          type="button"
          class="chip${chip.value === selectedCategory ? ' chip--active' : ''}"
          data-category="${chip.value}"
        >
          ${chip.label}
        </button>
      `
    )
    .join('');

  return `<div class="catalog-chips">${chipHtml}</div>`;
}

export function renderCompanyCards({ groups = [] } = {}) {
  if (groups.length === 0) {
    return renderCatalogEmptyState({});
  }

  const cards = groups.map(
    (group) => `
      <article class="public-row-card">
        <h3>
          <span class="fallback-logo" style="background-color: ${getFallbackLogoColor(group.companyName)}">${getFallbackLogoLetter(group.companyName)}</span>
          ${group.companyName}
        </h3>
        <p>${group.categories.join(', ')} · ${group.linkCount} referral links</p>
      </article>
    `
  );

  return cards.join('');
}

export function renderCatalogEmptyState({ isLoggedIn = false } = {}) {
  const cta = isLoggedIn
    ? '<a class="action-button" href="#/profile">Add your own link</a>'
    : '';

  return `
    <div class="placeholder catalog-empty">
      <h2>${translate('home.catalog.empty.all')}</h2>
      ${cta}
    </div>
  `;
}
