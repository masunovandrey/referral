import { describe, expect, it } from 'vitest';
import { renderProfileCard } from '../../src/features/ui/profileCard.js';

describe('profileCard', () => {
  it('renders company name, actions and counters', () => {
    const html = renderProfileCard({
      row: {
        id: 'row-1',
        companyName: 'Acme',
        category: 'fintech',
        isPublished: true,
        views: 3,
        clicks: 2
      }
    });

    expect(html).toContain('Acme');
    expect(html).toContain('data-action="edit"');
    expect(html).toContain('data-action="unpublish"');
    expect(html).toContain('data-action="delete"');
    expect(html).toContain('Views: 3');
    expect(html).toContain('Clicks: 2');
  });

  it('marks unpublished rows as hidden', () => {
    const html = renderProfileCard({ row: { companyName: 'Acme', isPublished: false } });

    expect(html).toContain('profile-card--hidden');
  });
});
