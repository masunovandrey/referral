import { describe, expect, it } from 'vitest';
import {
  buildPrivateRowInput,
  normalizePrivateRows
} from '../../src/features/privateRows/privateRows.model.js';

describe('buildPrivateRowInput', () => {
  it('trims title and description for create payloads', () => {
    expect(
      buildPrivateRowInput({
        title: '  First row  ',
        description: '  Personal note  '
      })
    ).toEqual({
      title: 'First row',
      description: 'Personal note'
    });
  });

  it('falls back to empty strings for missing fields', () => {
    expect(buildPrivateRowInput({})).toEqual({
      title: '',
      description: ''
    });
  });

  it('preserves normalized payload shape for edit inputs', () => {
    expect(
      buildPrivateRowInput({
        title: '  Updated title  ',
        description: '  Updated description  '
      })
    ).toEqual({
      title: 'Updated title',
      description: 'Updated description'
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
            title: 'Private row',
            description: 'Owned by the current user'
          })
        }
      ])
    ).toEqual([
      {
        id: 'row-a',
        title: 'Private row',
        description: 'Owned by the current user'
      }
    ]);
  });

  it('falls back to empty strings for missing row text', () => {
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
        title: '',
        description: ''
      }
    ]);
  });
});
