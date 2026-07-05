import { describe, expect, it } from 'vitest';
import { normalizePublicRows } from '../../src/features/publicRows/publicRows.model.js';

describe('normalizePublicRows', () => {
  it('returns only visible public rows with UI-safe fields', () => {
    const rows = normalizePublicRows([
      {
        id: 'visible-row',
        data: () => ({
          title: 'Visible row',
          description: 'Shown on the public page',
          visible: true
        })
      },
      {
        id: 'hidden-row',
        data: () => ({
          title: 'Hidden row',
          description: 'Should not be shown',
          visible: false
        })
      }
    ]);

    expect(rows).toEqual([
      {
        id: 'visible-row',
        title: 'Visible row',
        description: 'Shown on the public page'
      }
    ]);
  });

  it('falls back to empty strings for missing text fields', () => {
    const rows = normalizePublicRows([
      {
        id: 'partial-row',
        data: () => ({
          visible: true
        })
      }
    ]);

    expect(rows).toEqual([
      {
        id: 'partial-row',
        title: '',
        description: ''
      }
    ]);
  });
});
