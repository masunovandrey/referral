import { describe, expect, it } from 'vitest';
import { renderPublicRows } from '../../src/features/publicRows/publicRows.ui.js';

describe('renderPublicRows', () => {
  it('renders the empty state', () => {
    const html = renderPublicRows([]);

    expect(html).toContain('No referral links are published yet');
  });

  it('renders company cards without exposing referral links', () => {
    const html = renderPublicRows([
      {
        companyKey: 'acme',
        companyName: 'Acme',
        categories: ['fintech', 'travel'],
        links: [{ referralLink: 'https://acme.example/private-referral' }],
        linkCount: 2
      }
    ]);

    expect(html).toContain('Acme');
    expect(html).toContain('fallback-logo');
    expect(html).toContain('fintech, travel');
    expect(html).toContain('2 referral links');
    expect(html).toContain('data-company-key="acme"');
    expect(html).toContain('id="public-catalog-feedback"');
    expect(html).not.toContain('https://acme.example/private-referral');
  });
});
