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
        isPublished: true,
        publicRowId: 'user-a_test%20company',
        views: 5,
        clicks: 3
      }
    ];
    const emptyState = {
      title: 'No rows',
      description: 'Create some rows'
    };

    const html = renderPrivateRows(rows, emptyState);

    expect(html).toContain('Test Company');
    expect(html).toContain('travel');
    expect(html).toContain('selected>travel</option>');
    expect(html).toContain('https://example.com');
    expect(html).toContain('My bonus details');
    expect(html).toContain('Views: 5');
    expect(html).toContain('Clicks: 3');
    expect(html).toContain('Published');
    expect(html).toContain('data-role="row-view"');
    expect(html).toContain('data-action="edit"');
    expect(html).toContain('data-action="delete"');
    expect(html).toContain('data-action="unpublish"');
    expect(html).toContain('data-role="cancel-edit"');
    expect(html).toContain('data-role="companyName-error"');
    expect(html).toContain('private-row-edit-form');
    expect(html).toContain('hidden');
    expect(html).toContain('Unpublish');
  });

  it('renders the publish action for unpublished rows', () => {
    const html = renderPrivateRows(
      [
        {
          id: 'row-1',
          companyName: 'Test Company',
          category: 'travel',
          referralLink: 'https://example.com',
          bonusDescription: 'My bonus details',
          isPublished: false,
          publicRowId: '',
          views: 0
        }
      ],
      { title: 'No rows', description: 'Create some rows' }
    );

    expect(html).toContain('Not published');
    expect(html).not.toContain('Clicks:');
    expect(html).toContain('>Publish</button>');
  });
});
