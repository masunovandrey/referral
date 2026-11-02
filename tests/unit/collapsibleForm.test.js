import { describe, expect, it } from 'vitest';
import { renderCollapsibleForm } from '../../src/features/ui/collapsibleForm.js';

describe('collapsibleForm', () => {
  it('returns empty markup when closed', () => {
    expect(renderCollapsibleForm({ isOpen: false })).toBe('');
  });

  it('renders form markup when open', () => {
    const html = renderCollapsibleForm({ isOpen: true });

    expect(html).toContain('collapsible-form');
    expect(html).toContain('Add referral entry');
    expect(html).toContain('name="companyName"');
  });
});
