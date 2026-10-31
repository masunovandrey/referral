import { describe, expect, it } from 'vitest';
import {
  buildCompanyKey,
  buildPublicRowId,
  groupPublicRowsByCompany,
  normalizePublicRows,
  pickRandomPublicRow
} from '../../src/features/publicRows/publicRows.model.js';

describe('buildCompanyKey', () => {
  it('normalizes and encodes the company name', () => {
    expect(buildCompanyKey('  Acme   Corp  ')).toBe('acme%20corp');
    expect(buildCompanyKey('AT&T')).toBe('at%26t');
  });

  it('returns an empty key for missing company names', () => {
    expect(buildCompanyKey('')).toBe('');
    expect(buildCompanyKey(null)).toBe('');
  });
});

describe('buildPublicRowId', () => {
  it('builds a deterministic public row id', () => {
    expect(buildPublicRowId('user-a', 'acme%20corp')).toBe('user-a_acme%20corp');
  });
});

describe('normalizePublicRows', () => {
  it('maps Firestore rows into public catalog rows', () => {
    const rows = normalizePublicRows([
      {
        id: 'public-row',
        data: () => ({
          companyName: 'Acme',
          companyKey: 'acme',
          category: 'fintech',
          referralLink: 'https://acme.example/referral',
          bonusDescription: 'Bonus details',
          ownerUid: 'user-a',
          sourceRowId: 'private-row',
          clicks: 3
        })
      }
    ]);

    expect(rows).toEqual([
      {
        id: 'public-row',
        companyName: 'Acme',
        companyKey: 'acme',
        category: 'fintech',
        referralLink: 'https://acme.example/referral',
        bonusDescription: 'Bonus details',
        ownerUid: 'user-a',
        sourceRowId: 'private-row',
        clicks: 3
      }
    ]);
  });

  it('builds a company key fallback and ignores legacy or invalid rows', () => {
    const rows = normalizePublicRows([
      {
        id: 'valid-row',
        data: () => ({
          companyName: 'Acme Corp',
          category: 'travel',
          referralLink: 'https://acme.example/referral'
        })
      },
      {
        id: 'legacy-row',
        data: () => ({
          title: 'Old public row',
          description: 'Old schema',
          visible: true
        })
      }
    ]);

    expect(rows).toEqual([
      {
        id: 'valid-row',
        companyName: 'Acme Corp',
        companyKey: 'acme%20corp',
        category: 'travel',
        referralLink: 'https://acme.example/referral',
        bonusDescription: '',
        ownerUid: '',
        sourceRowId: '',
        clicks: 0
      }
    ]);
  });
});

describe('groupPublicRowsByCompany', () => {
  it('groups links by company and sorts companies and categories', () => {
    const groups = groupPublicRowsByCompany([
      publicRow({ id: 'travel-link', companyName: 'Acme', companyKey: 'acme', category: 'travel' }),
      publicRow({ id: 'fintech-link', companyName: 'Acme', companyKey: 'acme', category: 'fintech' }),
      publicRow({ id: 'beta-link', companyName: 'Beta', companyKey: 'beta', category: 'software' })
    ]);

    expect(groups).toEqual([
      {
        companyKey: 'acme',
        companyName: 'Acme',
        categories: ['fintech', 'travel'],
        links: [
          expect.objectContaining({ id: 'travel-link' }),
          expect.objectContaining({ id: 'fintech-link' })
        ],
        linkCount: 2
      },
      {
        companyKey: 'beta',
        companyName: 'Beta',
        categories: ['software'],
        links: [expect.objectContaining({ id: 'beta-link' })],
        linkCount: 1
      }
    ]);
  });

  it('ignores rows without a company or referral link', () => {
    expect(
      groupPublicRowsByCompany([
        publicRow({ id: 'valid-link' }),
        publicRow({ id: 'missing-company', companyName: '', companyKey: '' }),
        publicRow({ id: 'missing-link', referralLink: '' })
      ])
    ).toHaveLength(1);
  });
});

describe('pickRandomPublicRow', () => {
  const rows = [publicRow({ id: 'first' }), publicRow({ id: 'second' }), publicRow({ id: 'third' })];

  it('picks a row using the provided random source', () => {
    expect(pickRandomPublicRow(rows, () => 0)).toEqual(expect.objectContaining({ id: 'first' }));
    expect(pickRandomPublicRow(rows, () => 0.99)).toEqual(
      expect.objectContaining({ id: 'third' })
    );
  });

  it('returns null for an empty list', () => {
    expect(pickRandomPublicRow([], () => 0)).toBeNull();
  });
});

function publicRow(overrides = {}) {
  return {
    id: 'public-row',
    companyName: 'Acme',
    companyKey: 'acme',
    category: 'fintech',
    referralLink: 'https://acme.example/referral',
    bonusDescription: 'Bonus details',
    ownerUid: 'user-a',
    sourceRowId: 'private-row',
    clicks: 0,
    ...overrides
  };
}
