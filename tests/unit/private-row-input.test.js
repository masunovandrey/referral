import { describe, expect, it } from 'vitest';
import {
  buildPrivateRowInput,
  normalizePrivateRows
} from '../../src/features/privateRows/privateRows.model.js';

describe('buildPrivateRowInput', () => {
  it('trims referral row fields for create payloads', () => {
    expect(
      buildPrivateRowInput({
        companyName: '  Example Company  ',
        referralLink: '  https://example.com/referral  ',
        bonusDescription: '  Personal bonus note  '
      })
    ).toEqual({
      companyName: 'Example Company',
      referralLink: 'https://example.com/referral',
      bonusDescription: 'Personal bonus note'
    });
  });

  it('falls back to empty strings for missing fields', () => {
    expect(buildPrivateRowInput({})).toEqual({
      companyName: '',
      referralLink: '',
      bonusDescription: ''
    });
  });

  it('preserves normalized payload shape for edit inputs', () => {
    expect(
      buildPrivateRowInput({
        companyName: '  Updated Company  ',
        referralLink: '  https://example.com/updated  ',
        bonusDescription: '  Updated bonus  '
      })
    ).toEqual({
      companyName: 'Updated Company',
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
        referralLink: 'https://example.com/referral',
        bonusDescription: 'Owned by the current user',
        views: 12
      }
    ]);
  });

  it('falls back to empty strings and zero views for missing row data', () => {
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
        referralLink: '',
        bonusDescription: '',
        views: 0
      }
    ]);
  });
});
