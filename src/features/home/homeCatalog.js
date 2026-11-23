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

export function renderCategoryMenuItems({ categories = [], selectedCategory = '' } = {}) {
  const items = [
    { value: '', label: translate('home.catalog.chips.all') },
    ...categories.map((category) => ({ value: category, label: category }))
  ];

  return items
    .map(
      (item) => `
        <button
          type="button"
          class="chip${item.value === selectedCategory ? ' chip--active' : ''}"
          data-category="${item.value}"
        >
          ${item.label}
        </button>
      `
    )
    .join('');
}

export function renderCategoryMenu({ categories = [], selectedCategory = '' } = {}) {
  const selectedLabel = selectedCategory || translate('home.catalog.chips.all');

  return `
    <div class="catalog-menu">
      <button
        class="catalog-menu__toggle"
        type="button"
        data-role="category-menu-toggle"
        aria-haspopup="menu"
        aria-expanded="false"
      >
        <span class="catalog-menu__icon" aria-hidden="true">☰</span>
        <span class="catalog-menu__value">${selectedLabel}</span>
      </button>
      <div class="catalog-menu__dropdown" data-role="category-menu" hidden>
        ${renderCategoryMenuItems({ categories, selectedCategory })}
      </div>
    </div>
  `;
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
        <button class="public-row-card__action" type="button" data-company-key="${group.companyKey}">Copy</button>
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
