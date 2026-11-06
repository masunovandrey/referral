import { describe, expect, it } from 'vitest';
import { renderCatalogEmptyState, renderCategoryChips, renderCompanyCards, renderHero, renderSearchInput } from '../../src/features/home/homeCatalog.js';

describe('homeCatalog', () => {
  it('renders the hero with title, subtitle and cta', () => {
    const html = renderHero();

    expect(html).toContain('hero__title');
    expect(html).toContain('hero__subtitle');
    expect(html).toContain('Referral links in one click');
    expect(html).toContain('Browse catalog');
    expect(html).toContain('data-hero-cta');
  });

  it('renders the search input with value and placeholder', () => {
    const html = renderSearchInput({ value: 'acme' });

    expect(html).toContain('value="acme"');
    expect(html).toContain('placeholder="Search by company or category"');
  });

  it('renders category chips with the all chip and selected state', () => {
    const html = renderCategoryChips({ categories: ['fintech', 'food'], selectedCategory: 'fintech' });

    expect(html).toContain('data-category=""');
    expect(html).toContain('data-category="fintech"');
    expect(html).toContain('chip--active');
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
