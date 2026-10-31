import { describe, expect, it } from 'vitest';
import {
  attachPublicRowClicks,
  buildPrivateRowInput,
  normalizePrivateRows,
  validatePrivateRowInput
} from '../../src/features/privateRows/privateRows.model.js';

describe('buildPrivateRowInput', () => {
  it('trims referral row fields for create payloads', () => {
    expect(
      buildPrivateRowInput({
        companyName: '  Example Company  ',
        category: '  fintech  ',
        referralLink: '  https://example.com/referral  ',
        bonusDescription: '  Personal bonus note  '
      })
    ).toEqual({
      companyName: 'Example Company',
      companyKey: 'example%20company',
      category: 'fintech',
      referralLink: 'https://example.com/referral',
      bonusDescription: 'Personal bonus note'
    });
  });

  it('falls back to empty strings for missing fields', () => {
    expect(buildPrivateRowInput({})).toEqual({
      companyName: '',
      companyKey: '',
      category: '',
      referralLink: '',
      bonusDescription: ''
    });
  });

  it('preserves normalized payload shape for edit inputs', () => {
    expect(
      buildPrivateRowInput({
        companyName: '  Updated Company  ',
        category: '  travel  ',
        referralLink: '  https://example.com/updated  ',
        bonusDescription: '  Updated bonus  '
      })
    ).toEqual({
      companyName: 'Updated Company',
      companyKey: 'updated%20company',
      category: 'travel',
      referralLink: 'https://example.com/updated',
      bonusDescription: 'Updated bonus'
    });
  });
});

describe('normalizePrivateRows', () => {
  it('maps Firestore rows into UI-safe values', () => {
    expect(
      normalizePrivateRows([
        {
          id: 'row-a',
          data: () => ({
            companyName: 'Example Company',
            category: 'fintech',
            referralLink: 'https://example.com/referral',
            bonusDescription: 'Owned by the current user',
            views: 12
          })
        }
      ])
    ).toEqual([
      {
        id: 'row-a',
        companyName: 'Example Company',
        companyKey: 'example%20company',
        category: 'fintech',
        referralLink: 'https://example.com/referral',
        bonusDescription: 'Owned by the current user',
        isPublished: false,
        publicRowId: '',
        views: 12,
        clicks: 0
      }
    ]);
  });

  it('keeps publish state for published rows', () => {
    expect(
      normalizePrivateRows([
        {
          id: 'row-a',
          data: () => ({
            companyName: 'Example Company',
            companyKey: 'example%20company',
            isPublished: true,
            publicRowId: 'user-a_example%20company'
          })
        }
      ])
    ).toEqual([
      {
        id: 'row-a',
        companyName: 'Example Company',
        companyKey: 'example%20company',
        category: '',
        referralLink: '',
        bonusDescription: '',
        isPublished: true,
        publicRowId: 'user-a_example%20company',
        views: 0,
        clicks: 0
      }
    ]);
  });

  it('falls back to empty strings and zero counters for missing row data', () => {
    expect(
      normalizePrivateRows([
        {
          id: 'row-a',
          data: () => ({})
        }
      ])
    ).toEqual([
      {
        id: 'row-a',
        companyName: '',
        companyKey: '',
        category: '',
        referralLink: '',
        bonusDescription: '',
        isPublished: false,
        publicRowId: '',
        views: 0,
        clicks: 0
      }
    ]);
  });
});

describe('validatePrivateRowInput', () => {
  it('accepts a complete valid row', () => {
    expect(
      validatePrivateRowInput({
        companyName: 'Example Company',
        category: 'fintech',
        referralLink: 'https://example.com/referral',
        bonusDescription: 'Bonus details'
      })
    ).toEqual({
      isValid: true,
      errors: {
        companyName: '',
        category: '',
        referralLink: '',
        bonusDescription: ''
      }
    });
  });

  it('reports missing required fields and invalid URLs', () => {
    expect(
      validatePrivateRowInput({
        companyName: '  ',
        category: '',
        referralLink: 'example.com/referral',
        bonusDescription: ''
      })
    ).toEqual({
      isValid: false,
      errors: {
        companyName: 'Company name is required.',
        category: 'Select a category.',
        referralLink: 'Referral link must start with http:// or https://.',
        bonusDescription: ''
      }
    });
  });

  it('reports missing referral links separately', () => {
    expect(
      validatePrivateRowInput({
        companyName: 'Example Company',
        category: 'travel',
        referralLink: '',
        bonusDescription: ''
      }).errors.referralLink
    ).toBe('Referral link is required.');
  });

  it('reports fields that exceed Firestore rule limits', () => {
    const result = validatePrivateRowInput({
      companyName: 'a'.repeat(121),
      category: 'b'.repeat(81),
      referralLink: `https://example.com/${'a'.repeat(2048)}`,
      bonusDescription: 'c'.repeat(1001)
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual({
      companyName: 'Company name must be 120 characters or fewer.',
      category: 'Category must be 80 characters or fewer.',
      referralLink: 'Referral link must be 2048 characters or fewer.',
      bonusDescription: 'Bonus description must be 1000 characters or fewer.'
    });
  });
});

describe('attachPublicRowClicks', () => {
  it('adds public click counts to published rows and defaults others to zero', () => {
    const rows = [
      { id: 'published-row', isPublished: true, publicRowId: 'public-a' },
      { id: 'unpublished-row', isPublished: false, publicRowId: '' },
      { id: 'missing-public-row', isPublished: true, publicRowId: 'public-missing' }
    ];

    expect(
      attachPublicRowClicks(rows, new Map([['public-a', 7]]))
    ).toEqual([
      { id: 'published-row', isPublished: true, publicRowId: 'public-a', clicks: 7 },
      { id: 'unpublished-row', isPublished: false, publicRowId: '', clicks: 0 },
      { id: 'missing-public-row', isPublished: true, publicRowId: 'public-missing', clicks: 0 }
    ]);
  });
});
