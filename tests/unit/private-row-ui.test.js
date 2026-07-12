import { describe, expect, it } from 'vitest';
import { renderPrivateRows } from '../../src/features/privateRows/privateRows.ui.js';

describe('renderPrivateRows', () => {
  it('renders empty state when rows is empty', () => {
    const emptyState = {
      title: 'No rows',
      description: 'Create some rows'
    };
    const html = renderPrivateRows([], emptyState);
    expect(html).toContain('No rows');
    expect(html).toContain('Create some rows');
  });

  it('renders rows and pre-selects category without throwing error', () => {
    const rows = [
      {
        id: 'row-1',
        companyName: 'Test Company',
        category: 'travel',
        referralLink: 'https://example.com',
        bonusDescription: 'My bonus details',
        views: 5
      }
    ];
    const emptyState = {
      title: 'No rows',
      description: 'Create some rows'
    };

    // This would throw if categoryOptions is incorrectly evaluated as a string instead of a function reference
    const html = renderPrivateRows(rows, emptyState);

    expect(html).toContain('Test Company');
    expect(html).toContain('travel');
    expect(html).toContain('selected>travel</option>');
    expect(html).toContain('https://example.com');
    expect(html).toContain('My bonus details');
    expect(html).toContain('Views: 5');
  });
});
