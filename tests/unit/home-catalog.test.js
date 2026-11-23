import { describe, expect, it } from 'vitest';
import { renderCatalogEmptyState, renderCategoryMenu, renderCategoryMenuItems, renderCompanyCards, renderHero, renderSearchInput } from '../../src/features/home/homeCatalog.js';

describe('homeCatalog', () => {
  it('renders the hero with title and subtitle', () => {
    const html = renderHero();

    expect(html).toContain('hero__title');
    expect(html).toContain('hero__subtitle');
    expect(html).toContain('Referral links in one click');
  });

  it('renders the search input with value and placeholder', () => {
    const html = renderSearchInput({ value: 'acme' });

    expect(html).toContain('value="acme"');
    expect(html).toContain('placeholder="Search by company or category"');
  });

  it('renders the category menu toggle with the all label when no category is selected', () => {
    const html = renderCategoryMenu({ categories: ['fintech', 'food'], selectedCategory: '' });

    expect(html).toContain('data-role="category-menu-toggle"');
    expect(html).toContain('data-role="category-menu"');
    expect(html).toContain('catalog-menu__toggle');
    expect(html).toContain('catalog-menu__value');
    expect(html).toContain('>All<');
  });

  it('marks the selected category in the menu', () => {
    const html = renderCategoryMenu({ categories: ['fintech', 'food'], selectedCategory: 'fintech' });

    expect(html).toContain('data-category=""');
    expect(html).toContain('data-category="fintech"');
    expect(html).toContain('data-category="food"');
    expect(html).toContain('chip--active');
    expect(html).toContain('fintech');
  });

  it('renders category menu items with the all item first', () => {
    const items = renderCategoryMenuItems({ categories: ['fintech', 'food'], selectedCategory: 'fintech' });

    expect(items).toContain('data-category=""');
    expect(items).toContain('data-category="fintech"');
    expect(items).toContain('data-category="food"');
    expect(items).toContain('chip--active');
  });

  it('renders a palm icon for travel category cards', () => {
    const html = renderCompanyCards({
      groups: [
        {
          companyKey: 'palma',
          companyName: 'Palma',
          categories: ['travel'],
          linkCount: 1
        }
      ]
    });

    expect(html).toContain('\u{1F334}');
  });

  it('renders company cards from groups', () => {
    const html = renderCompanyCards({
      groups: [
        {
          companyKey: 'acme',
          companyName: 'Acme',
          categories: ['fintech'],
          linkCount: 2
        }
      ]
    });

    expect(html).toContain('Acme');
    expect(html).toContain('fallback-logo');
    expect(html).toContain('data-company-key="acme"');
  });

  it('renders empty state and adds cta for logged in users', () => {
    expect(renderCatalogEmptyState({ isLoggedIn: false })).not.toContain('Add your own link');
    expect(renderCatalogEmptyState({ isLoggedIn: true })).toContain('Add your own link');
  });
});
