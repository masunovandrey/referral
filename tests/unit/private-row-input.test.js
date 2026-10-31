import { describe, expect, it } from 'vitest';
import {
  attachPublicRowClicks,
  buildPrivateRowInput,
  normalizePrivateRows
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
